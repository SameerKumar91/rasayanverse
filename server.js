const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const { init, User, Otp, Progress } = require("./db");
const { sendOtpEmail } = require("./email");

// ---------- Config ----------
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be set and at least 32 characters long.");
  process.exit(1);
}
const TEACHER_EMAILS = (process.env.TEACHER_EMAILS || "")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

const OTP_TTL_MIN = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_COOLDOWN_SEC = 60;
const COOKIE = "rv_session";
const PUBLIC_DIR = path.join(__dirname, "public");

const PRACTICALS = [
  "Acid–Base Titration", "Determination of pH", "Acid–Base Indicators",
  "Preparation of Standard Solution", "Separation by Filtration",
  "Crystallization of Copper Sulphate", "Hardness of Water", "Flame Test",
  "Chloride Ion Test", "Sulphate Ion Test", "Carbonate Ion Test",
  "Preparation of Soap", "Redox Titration", "Heat of Neutralization",
  "Buffer Solution & pH",
];
const PRACTICAL_LIST = PRACTICALS.map((name, i) => ({ id: i + 1, name }));
const PROTECTED = [/^\/experiments(\.html)?$/, /^\/experiments\//, /^\/dashboard(\.html)?$/];

// ---------- App ----------
const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// ---------- Helpers ----------
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const normEmail = (e) => String(e || "").trim().toLowerCase();
const isEmail = (e) => e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const clean = (s, max) => String(s || "").trim().replace(/\s+/g, " ").slice(0, max);
const isObjectId = (v) => /^[a-f\d]{24}$/i.test(String(v));
const hashOtp = (email, code) =>
  crypto.createHmac("sha256", JWT_SECRET).update(`${email}:${code}`).digest("hex");
const practicalId = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= PRACTICALS.length ? n : null;
};

function getUser(req) {
  const token = req.cookies[COOKIE];
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

function setSession(res, user) {
  const token = jwt.sign(
    { uid: String(user._id), role: user.role, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.cookie(COOKIE, token, {
    httpOnly: true, secure: IS_PROD, sameSite: "lax", path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function requireAuth(req, res, next) {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Please log in." });
  req.user = user;
  next();
}

function requireTeacher(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== "teacher") return res.status(403).json({ error: "Teacher access only." });
    next();
  });
}

const mapProgress = (p) => ({
  practical_id: p.practicalId,
  status: p.status,
  visits: p.visits || 0,
  quiz_score: p.quizScore,
  quiz_total: p.quizTotal,
  best_score_pct: p.bestScorePct,
  first_opened_at: p.firstOpenedAt,
  last_activity_at: p.lastActivityAt,
  completed_at: p.completedAt,
});

const limiterOpts = { windowMs: 15 * 60 * 1000, standardHeaders: "draft-7", legacyHeaders: false };
const otpLimiter = rateLimit({ ...limiterOpts, limit: 10, message: { error: "Too many OTP requests. Try again in 15 minutes." } });
const verifyLimiter = rateLimit({ ...limiterOpts, limit: 30, message: { error: "Too many attempts. Try again in 15 minutes." } });

// ---------- Health ----------
app.get("/healthz", (req, res) => res.send("ok"));

// ---------- Auth API ----------
app.post("/api/auth/request-otp", otpLimiter, wrap(async (req, res) => {
  const b = req.body || {};
  const email = normEmail(b.email);
  const mode = b.mode === "register" ? "register" : "login";
  const role = b.role === "teacher" ? "teacher" : "student";

  if (!isEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (role === "teacher" && !TEACHER_EMAILS.includes(email)) {
    return res.status(403).json({ error: "This email is not authorised as a teacher account." });
  }

  const existing = await User.findOne({ email }).lean();
  let payload = null;

  if (mode === "login") {
    if (!existing) return res.status(404).json({ error: "No account found for this email. Please create an account first." });
    if (existing.role !== role) return res.status(403).json({ error: `This is a ${existing.role} account. Please use the ${existing.role} login.` });
  } else {
    if (existing) return res.status(409).json({ error: "An account already exists for this email. Please log in." });
    const name = clean(b.name, 80);
    const enrollment = clean(b.enrollment, 30);
    if (name.length < 2) return res.status(400).json({ error: "Enter your full name." });
    if (role === "student" && !enrollment) return res.status(400).json({ error: "Enter your enrollment number." });
    payload = { name, role, enrollment: enrollment || null };
  }

  const prev = await Otp.findOne({ email }).lean();
  if (prev) {
    const elapsed = (Date.now() - new Date(prev.createdAt).getTime()) / 1000;
    if (elapsed < OTP_COOLDOWN_SEC) {
      return res.status(429).json({ error: `Please wait ${Math.ceil(OTP_COOLDOWN_SEC - elapsed)}s before requesting a new OTP.` });
    }
  }

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
  const now = new Date();
  await Otp.findOneAndUpdate(
    { email },
    {
      $set: {
        codeHash: hashOtp(email, code), purpose: mode, payload, attempts: 0,
        expiresAt: new Date(now.getTime() + OTP_TTL_MIN * 60 * 1000), createdAt: now,
      },
    },
    { upsert: true }
  );

  try {
    await sendOtpEmail(email, code, OTP_TTL_MIN);
  } catch (err) {
    console.error("[email] failed:", err.message);
    await Otp.deleteOne({ email });
    return res.status(502).json({ error: "Could not send the OTP email. Please try again later." });
  }

  res.json({ ok: true, message: `OTP sent to ${email}. It expires in ${OTP_TTL_MIN} minutes.` });
}));

app.post("/api/auth/verify-otp", verifyLimiter, wrap(async (req, res) => {
  const b = req.body || {};
  const email = normEmail(b.email);
  const code = String(b.otp || "").trim();

  if (!isEmail(email) || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: "Enter the 6-digit OTP." });
  }

  const row = await Otp.findOne({ email }).lean();
  if (!row) return res.status(400).json({ error: "No active OTP. Please request a new one." });

  if (new Date(row.expiresAt) < new Date()) {
    await Otp.deleteOne({ email });
    return res.status(400).json({ error: "OTP expired. Please request a new one." });
  }
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    await Otp.deleteOne({ email });
    return res.status(429).json({ error: "Too many wrong attempts. Please request a new OTP." });
  }

  const match = crypto.timingSafeEqual(
    Buffer.from(row.codeHash, "hex"),
    Buffer.from(hashOtp(email, code), "hex")
  );
  if (!match) {
    await Otp.updateOne({ email }, { $inc: { attempts: 1 } });
    const left = OTP_MAX_ATTEMPTS - row.attempts - 1;
    return res.status(400).json({ error: left > 0 ? `Incorrect OTP. ${left} attempt(s) left.` : "Incorrect OTP. Please request a new one." });
  }

  // Consume atomically so the same OTP can't be used twice
  const consumed = await Otp.findOneAndDelete({ email, codeHash: row.codeHash });
  if (!consumed) return res.status(400).json({ error: "OTP already used. Please request a new one." });

  const now = new Date();
  let user;
  if (row.purpose === "register") {
    const p = row.payload;
    user = await User.findOneAndUpdate(
      { email },
      { $setOnInsert: { name: p.name, role: p.role, enrollmentNo: p.enrollment }, $set: { lastLoginAt: now } },
      { upsert: true, new: true }
    );
  } else {
    user = await User.findOneAndUpdate({ email }, { $set: { lastLoginAt: now } }, { new: true });
  }
  if (!user) return res.status(404).json({ error: "Account not found." });

  setSession(res, user);
  res.json({
    ok: true,
    user: { name: user.name, email: user.email, role: user.role },
    redirect: user.role === "teacher" ? "/dashboard.html" : "/experiments.html",
  });
}));

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie(COOKIE, { httpOnly: true, secure: IS_PROD, sameSite: "lax", path: "/" });
  res.json({ ok: true });
});

app.get("/api/auth/me", (req, res) => {
  const u = getUser(req);
  res.json({ user: u ? { name: u.name, email: u.email, role: u.role } : null });
});

// ---------- Student progress API ----------
app.post("/api/progress/start", requireAuth, wrap(async (req, res) => {
  const id = practicalId((req.body || {}).practicalId);
  if (!id) return res.status(400).json({ error: "Invalid practical." });
  if (req.user.role !== "student") return res.json({ ok: true, skipped: true });

  const now = new Date();
  await Progress.updateOne(
    { user: req.user.uid, practicalId: id },
    {
      $inc: { visits: 1 },
      $set: { lastActivityAt: now },
      $setOnInsert: { status: "started", firstOpenedAt: now },
    },
    { upsert: true }
  );
  res.json({ ok: true });
}));

app.post("/api/progress/complete", requireAuth, wrap(async (req, res) => {
  const b = req.body || {};
  const id = practicalId(b.practicalId);
  if (!id) return res.status(400).json({ error: "Invalid practical." });
  if (req.user.role !== "student") return res.json({ ok: true, skipped: true });

  const now = new Date();
  const update = {
    $set: { status: "completed", lastActivityAt: now },
    $setOnInsert: { firstOpenedAt: now, visits: 1 },
  };

  if (b.score !== undefined && b.score !== null && b.total !== undefined && b.total !== null) {
    const s = Number(b.score), t = Number(b.total);
    if (!Number.isInteger(s) || !Number.isInteger(t) || t < 1 || t > 100 || s < 0 || s > t) {
      return res.status(400).json({ error: "Invalid quiz score." });
    }
    update.$set.quizScore = s;
    update.$set.quizTotal = t;
    update.$max = { bestScorePct: Math.round((s / t) * 10000) / 100 };
  }

  const filter = { user: req.user.uid, practicalId: id };
  await Progress.updateOne(filter, update, { upsert: true });
  // Keep the first completion time
  await Progress.updateOne({ ...filter, completedAt: null }, { $set: { completedAt: now } });
  res.json({ ok: true });
}));

app.get("/api/progress/me", requireAuth, wrap(async (req, res) => {
  const rows = await Progress.find({ user: req.user.uid }).sort({ practicalId: 1 }).lean();
  res.json({ practicals: PRACTICAL_LIST, progress: rows.map(mapProgress) });
}));

// ---------- Teacher API ----------
app.get("/api/teacher/students", requireTeacher, wrap(async (req, res) => {
  const [students, stats] = await Promise.all([
    User.find({ role: "student" }).sort({ name: 1 }).lean(),
    Progress.aggregate([
      {
        $group: {
          _id: "$user",
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          started: { $sum: 1 },
          avgScore: { $avg: "$bestScorePct" },
          lastActivity: { $max: "$lastActivityAt" },
        },
      },
    ]),
  ]);

  const byUser = new Map(stats.map((s) => [String(s._id), s]));
  res.json({
    totalPracticals: PRACTICALS.length,
    students: students.map((u) => {
      const s = byUser.get(String(u._id)) || {};
      return {
        id: String(u._id),
        name: u.name,
        email: u.email,
        enrollment_no: u.enrollmentNo,
        created_at: u.createdAt,
        last_login_at: u.lastLoginAt,
        completed: s.completed || 0,
        started: s.started || 0,
        avg_score: s.avgScore === null || s.avgScore === undefined ? null : Math.round(s.avgScore * 10) / 10,
        last_activity: s.lastActivity || null,
      };
    }),
  });
}));

app.get("/api/teacher/students/:id", requireTeacher, wrap(async (req, res) => {
  if (!isObjectId(req.params.id)) return res.status(400).json({ error: "Invalid student." });

  const u = await User.findOne({ _id: req.params.id, role: "student" }).lean();
  if (!u) return res.status(404).json({ error: "Student not found." });

  const rows = await Progress.find({ user: u._id }).sort({ practicalId: 1 }).lean();
  res.json({
    student: {
      id: String(u._id), name: u.name, email: u.email, enrollment_no: u.enrollmentNo,
      created_at: u.createdAt, last_login_at: u.lastLoginAt,
    },
    practicals: PRACTICAL_LIST,
    progress: rows.map(mapProgress),
  });
}));

app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));

// ---------- Page guard + static site ----------
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (!PROTECTED.some((r) => r.test(req.path))) return next();
  if (getUser(req)) return next();
  res.redirect(`/login.html?next=${encodeURIComponent(req.originalUrl)}`);
});

app.use(express.static(PUBLIC_DIR, { extensions: ["html"] }));
app.use((req, res) => res.status(404).send("Page not found"));

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid request body." });
  console.error("[error]", err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

// ---------- Start ----------
init()
  .then(() => {
    if (!process.env.RESEND_API_KEY && process.env.OTP_DEBUG !== "true") {
      console.warn("[warn] RESEND_API_KEY missing and OTP_DEBUG is off — OTP emails will fail.");
    }
    app.listen(PORT, () => console.log(`RasayanVerse running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start:", err);
    process.exit(1);
  });