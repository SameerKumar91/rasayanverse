const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    role: { type: String, required: true, enum: ["student", "teacher"] },
    enrollmentNo: { type: String, trim: true, maxlength: 30, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  codeHash: { type: String, required: true },
  purpose: { type: String, required: true, enum: ["login", "register"] },
  payload: { type: mongoose.Schema.Types.Mixed, default: null },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, required: true },
});
// MongoDB deletes expired OTPs automatically
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  practicalId: { type: Number, required: true, min: 1, max: 15 },
  status: { type: String, enum: ["started", "completed"] },
  visits: { type: Number },
  quizScore: { type: Number, default: null },
  quizTotal: { type: Number, default: null },
  bestScorePct: { type: Number, default: null },
  firstOpenedAt: { type: Date },
  lastActivityAt: { type: Date },
  completedAt: { type: Date, default: null },
});
progressSchema.index({ user: 1, practicalId: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
const Otp = mongoose.model("Otp", otpSchema);
const Progress = mongoose.model("Progress", progressSchema);

async function init() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  await Promise.all([User.init(), Otp.init(), Progress.init()]); // build indexes
  console.log("[db] MongoDB connected");
}

module.exports = { init, User, Otp, Progress };