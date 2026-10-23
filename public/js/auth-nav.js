(() => {
  if (!document.querySelector('link[href="/css/auth.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/auth.css";
    document.head.appendChild(link);
  }

  const actions = document.querySelector(".navbar-actions");
  const mobileNav = document.getElementById("mobileNav");
  const onLoginPage = /\/login(\.html)?$/.test(location.pathname);
  if (mobileNav) document.body.classList.add("has-mobile-nav");

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      location.href = "/index.html";
    }
  }

  fetch("/api/auth/me", { credentials: "same-origin" })
    .then((r) => (r.ok ? r.json() : { user: null }))
    .catch(() => ({ user: null }))
    .then(({ user }) => {
      if (actions) {
        const wrap = document.createElement("div");
        wrap.className = "auth-nav";
        if (user) {
          const chip = document.createElement("a");
          chip.className = "auth-chip";
          chip.href = "/dashboard.html";
          chip.title = `${user.role === "teacher" ? "Teacher" : "Student"} dashboard`;
          chip.textContent = `${user.role === "teacher" ? "👩‍🏫" : "🎓"} ${user.name.split(" ")[0]}`;
          const out = document.createElement("button");
          out.type = "button";
          out.className = "auth-logout";
          out.textContent = "Logout";
          out.addEventListener("click", logout);
          wrap.append(chip, out);
        } else if (!onLoginPage) {
          const login = document.createElement("a");
          login.className = "auth-login";
          login.href = "/login.html";
          login.textContent = "Login";
          wrap.append(login);
        }
        actions.insertBefore(wrap, actions.firstChild);
      }

      if (mobileNav) {
        const anchor = mobileNav.querySelector(".mobile-lab-button");
        const add = (el) => (anchor ? mobileNav.insertBefore(el, anchor) : mobileNav.appendChild(el));
        if (user) {
          const dash = document.createElement("a");
          dash.className = "mobile-nav-link";
          dash.href = "/dashboard.html";
          dash.textContent = "My Dashboard";
          const out = document.createElement("a");
          out.className = "mobile-nav-link";
          out.href = "#";
          out.textContent = "Logout";
          out.addEventListener("click", (e) => { e.preventDefault(); logout(); });
          add(dash); add(out);
        } else {
          const login = document.createElement("a");
          login.className = "mobile-nav-link";
          login.href = "/login.html";
          login.textContent = "Login";
          add(login);
        }
      }
    });
})();