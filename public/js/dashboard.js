(() => {
  const root = document.getElementById("dashboardRoot");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const fmt = (d) => (d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—");
  const pad = (n) => String(n).padStart(2, "0");

  async function getJSON(url) {
    const r = await fetch(url, { credentials: "same-origin" });
    if (r.status === 401) {
      location.href = "/login.html?next=/dashboard.html";
      throw new Error("Not logged in");
    }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || "Failed to load data");
    return d;
  }

  function badge(status) {
    if (status === "completed") return '<span class="badge badge-done">Completed</span>';
    if (status === "started") return '<span class="badge badge-progress">In progress</span>';
    return '<span class="badge badge-none">Not started</span>';
  }

  function scoreText(p) {
    if (!p || p.quiz_score === null || p.quiz_score === undefined) return "—";
    return `${p.quiz_score}/${p.quiz_total} (best ${p.best_score_pct}%)`;
  }

  // ---------- Student ----------
  async function renderStudent(user) {
    const { practicals, progress } = await getJSON("/api/progress/me");
    const byId = new Map(progress.map((p) => [p.practical_id, p]));
    const done = progress.filter((p) => p.status === "completed").length;
    const inProgress = progress.filter((p) => p.status === "started").length;
    const scores = progress.map((p) => p.best_score_pct).filter((v) => v !== null);
    const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) + "%" : "—";
    const pct = Math.round((done / practicals.length) * 100);

    root.innerHTML = `
      <div class="dash-head">
        <div>
          <span class="eyebrow">STUDENT DASHBOARD</span>
          <h1>Welcome, ${esc(user.name)}</h1>
          <p>Track your virtual practical progress.</p>
        </div>
        <a class="button button-primary" href="/experiments.html">Continue Practicals →</a>
      </div>
      <div class="dash-stats">
        <div class="dash-stat"><strong>${done}/${practicals.length}</strong><span>Completed</span></div>
        <div class="dash-stat"><strong>${inProgress}</strong><span>In progress</span></div>
        <div class="dash-stat"><strong>${avg}</strong><span>Average quiz score</span></div>
      </div>
      <div class="progress-track" aria-label="${pct}% complete"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="status-grid">
        ${practicals.map((pr) => {
          const p = byId.get(pr.id);
          return `
            <a class="status-card" href="/experiments/practical-${pad(pr.id)}/index.html">
              <span class="status-num">${pad(pr.id)}</span>
              <h3>${esc(pr.name)}</h3>
              ${badge(p && p.status)}
              <small>${p && p.best_score_pct !== null ? `Best quiz: ${p.best_score_pct}%` : "&nbsp;"}</small>
            </a>`;
        }).join("")}
      </div>`;
  }

  // ---------- Teacher ----------
  async function renderTeacher(user) {
    const { students, totalPracticals } = await getJSON("/api/teacher/students");
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const active = students.filter((s) => s.last_activity && new Date(s.last_activity).getTime() > weekAgo).length;
    const avgDone = students.length
      ? (students.reduce((a, s) => a + s.completed, 0) / students.length).toFixed(1)
      : "0";

    root.innerHTML = `
      <div class="dash-head">
        <div>
          <span class="eyebrow">TEACHER DASHBOARD</span>
          <h1>Student Progress</h1>
          <p>Logged in as ${esc(user.name)} (${esc(user.email)})</p>
        </div>
        <button type="button" class="button button-secondary" id="exportCsv">⬇ Export CSV</button>
      </div>
      <div class="dash-stats">
        <div class="dash-stat"><strong>${students.length}</strong><span>Registered students</span></div>
        <div class="dash-stat"><strong>${avgDone}/${totalPracticals}</strong><span>Avg. practicals completed</span></div>
        <div class="dash-stat"><strong>${active}</strong><span>Active in last 7 days</span></div>
      </div>
      <div class="dash-toolbar">
        <input type="search" id="studentSearch" placeholder="Search by name, email or enrollment..." aria-label="Search students">
      </div>
      <div class="table-wrap">
        <table class="dash-table">
          <thead><tr>
            <th>Student</th><th>Enrollment</th><th>Completed</th><th>Avg. Quiz</th><th>Last Active</th><th></th>
          </tr></thead>
          <tbody id="studentRows"></tbody>
        </table>
      </div>
      <div id="studentDetail"></div>`;

    const tbody = document.getElementById("studentRows");

    function draw(list) {
      if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-cell">No students found.</td></tr>`;
        return;
      }
      tbody.innerHTML = list.map((s) => `
        <tr>
          <td><strong>${esc(s.name)}</strong><br><small>${esc(s.email)}</small></td>
          <td>${esc(s.enrollment_no || "—")}</td>
          <td>
            <div class="mini-track"><div class="mini-fill" style="width:${Math.round((s.completed / totalPracticals) * 100)}%"></div></div>
            <small>${s.completed}/${totalPracticals} (${s.started} opened)</small>
          </td>
          <td>${s.avg_score !== null ? s.avg_score + "%" : "—"}</td>
          <td>${fmt(s.last_activity || s.last_login_at)}</td>
          <td><button type="button" class="link-button" data-view="${s.id}">View →</button></td>
        </tr>`).join("");
    }

    draw(students);

    document.getElementById("studentSearch").addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      draw(students.filter((s) =>
        `${s.name} ${s.email} ${s.enrollment_no || ""}`.toLowerCase().includes(q)));
    });

    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-view]");
        if (btn) loadDetail(btn.dataset.view);
    });

    document.getElementById("exportCsv").addEventListener("click", () => exportCsv(students, totalPracticals));
  }

  async function loadDetail(id) {
    const box = document.getElementById("studentDetail");
    box.innerHTML = `<div class="dash-loading">Loading student...</div>`;
    try {
        const { student, practicals, progress } = await getJSON(`/api/teacher/students/${encodeURIComponent(id)}`);
      const byId = new Map(progress.map((p) => [p.practical_id, p]));
      box.innerHTML = `
        <div class="detail-card">
          <div class="dash-head">
            <div>
              <span class="eyebrow">STUDENT DETAIL</span>
              <h2>${esc(student.name)}</h2>
              <p>${esc(student.email)} · Enrollment: ${esc(student.enrollment_no || "—")} · Joined ${fmt(student.created_at)}</p>
            </div>
          </div>
          <div class="table-wrap">
            <table class="dash-table">
              <thead><tr><th>#</th><th>Practical</th><th>Status</th><th>Visits</th><th>Quiz</th><th>Last Activity</th><th>Completed</th></tr></thead>
              <tbody>
                ${practicals.map((pr) => {
                  const p = byId.get(pr.id);
                  return `<tr>
                    <td>${pad(pr.id)}</td>
                    <td>${esc(pr.name)}</td>
                    <td>${badge(p && p.status)}</td>
                    <td>${p ? p.visits : 0}</td>
                    <td>${scoreText(p)}</td>
                    <td>${fmt(p && p.last_activity_at)}</td>
                    <td>${fmt(p && p.completed_at)}</td>
                  </tr>`;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>`;
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      box.innerHTML = `<div class="dash-error">${esc(err.message)}</div>`;
    }
  }

  function exportCsv(students, total) {
    // Prefix risky leading characters to prevent spreadsheet formula injection
    const cell = (v) => {
      let s = String(v ?? "");
      if (/^[=+\-@]/.test(s)) s = "'" + s;
      return `"${s.replace(/"/g, '""')}"`;
    };
    const header = ["Name", "Email", "Enrollment", `Completed (of ${total})`, "Opened", "Avg Quiz %", "Last Active"];
    const lines = [header.map(cell).join(",")].concat(students.map((s) => [
      s.name, s.email, s.enrollment_no || "", s.completed, s.started,
      s.avg_score ?? "", s.last_activity ? new Date(s.last_activity).toISOString() : "",
    ].map(cell).join(",")));
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `rasayanverse-progress-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  (async () => {
    try {
      const { user } = await getJSON("/api/auth/me");
      if (!user) { location.href = "/login.html?next=/dashboard.html"; return; }
      if (user.role === "teacher") await renderTeacher(user);
      else await renderStudent(user);
    } catch (err) {
      root.innerHTML = `<div class="dash-error">${esc(err.message)}</div>`;
    }
  })();
})();