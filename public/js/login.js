(() => {
  const $ = (id) => document.getElementById(id);
  const state = { role: "student", mode: "login", email: "", timer: null };

  const params = new URLSearchParams(location.search);
  const nextRaw = params.get("next") || "";
  const safeNext = /^\/(?![\/\\])/.test(nextRaw) ? nextRaw : "";
  if (params.get("mode") === "register") state.mode = "register";

  const requestForm = $("requestForm");
  const verifyForm = $("verifyForm");
  const msg = $("authMessage");

  function showMessage(text, type = "info") {
    msg.textContent = text || "";
    msg.className = "auth-message" + (text ? ` ${type}` : "");
  }

  async function api(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  function updateView() {
    const reg = state.mode === "register";
    document.querySelectorAll(".auth-tab").forEach((t) => {
      const active = t.dataset.role === state.role;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".register-only").forEach((el) => {
      el.hidden = !reg || (el.classList.contains("student-only") && state.role !== "student");
    });
    const roleLabel = state.role === "teacher" ? "Teacher" : "Student";
    $("authTitle").textContent = reg ? `Create ${roleLabel.toLowerCase()} account` : `${roleLabel} login`;
    $("authSubtitle").textContent = reg
      ? "We'll verify your email with a one-time password."
      : "Log in with a one-time password sent to your email.";
    $("switchText").textContent = reg ? "Already have an account?" : "New to RasayanVerse?";
    $("modeSwitch").textContent = reg ? "Log in" : "Create an account";
    showMessage("");
  }

  function startCooldown(seconds) {
    const btn = $("resendBtn");
    clearInterval(state.timer);
    let left = seconds;
    btn.disabled = true;
    btn.textContent = `Resend OTP in ${left}s`;
    state.timer = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(state.timer);
        btn.disabled = false;
        btn.textContent = "Resend OTP";
      } else {
        btn.textContent = `Resend OTP in ${left}s`;
      }
    }, 1000);
  }

  function buildRequestBody() {
    const email = $("emailInput").value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error("Enter a valid email address.");
    const body = { email, mode: state.mode, role: state.role };
    if (state.mode === "register") {
      body.name = $("nameInput").value.trim();
      body.enrollment = $("enrollmentInput").value.trim();
      if (body.name.length < 2) throw new Error("Enter your full name.");
      if (state.role === "student" && !body.enrollment) throw new Error("Enter your enrollment number.");
    }
    return body;
  }

  document.querySelectorAll(".auth-tab").forEach((tab) =>
    tab.addEventListener("click", () => { state.role = tab.dataset.role; updateView(); })
  );

  $("modeSwitch").addEventListener("click", () => {
    state.mode = state.mode === "login" ? "register" : "login";
    updateView();
  });

  requestForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("requestBtn");
    btn.disabled = true;
    btn.textContent = "Sending...";
    try {
      const body = buildRequestBody();
      const data = await api("/api/auth/request-otp", body);
      state.email = body.email;
      requestForm.hidden = true;
      $("authTabs").hidden = true;
      verifyForm.hidden = false;
      $("otpEmail").textContent = state.email;
      $("otpInput").value = "";
      $("otpInput").focus();
      showMessage(data.message, "success");
      startCooldown(60);
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Send OTP →";
    }
  });

  $("otpInput").addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
  });

  verifyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const otp = $("otpInput").value.trim();
    if (!/^\d{6}$/.test(otp)) return showMessage("Enter the 6-digit OTP.", "error");
    const btn = $("verifyBtn");
    btn.disabled = true;
    btn.textContent = "Verifying...";
    try {
      const data = await api("/api/auth/verify-otp", { email: state.email, otp });
      showMessage("Verified! Redirecting...", "success");
      location.href = safeNext || data.redirect;
    } catch (err) {
      showMessage(err.message, "error");
      btn.disabled = false;
      btn.textContent = "Verify & Continue";
    }
  });

  $("resendBtn").addEventListener("click", async () => {
    try {
      const data = await api("/api/auth/request-otp", buildRequestBody());
      showMessage(data.message, "success");
      startCooldown(60);
    } catch (err) {
      showMessage(err.message, "error");
    }
  });

  $("changeEmailBtn").addEventListener("click", () => {
    clearInterval(state.timer);
    verifyForm.hidden = true;
    requestForm.hidden = false;
    $("authTabs").hidden = false;
    showMessage("");
    $("emailInput").focus();
  });

  // Already logged in? Skip the login page.
  fetch("/api/auth/me", { credentials: "same-origin" })
    .then((r) => r.json())
    .then(({ user }) => {
      if (user) location.replace(safeNext || (user.role === "teacher" ? "/dashboard.html" : "/experiments.html"));
    })
    .catch(() => {});

  updateView();
})();