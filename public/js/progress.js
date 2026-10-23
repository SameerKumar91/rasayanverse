(() => {
  const match = location.pathname.match(/practical-(\d{1,2})/);
  if (!match) return;
  const practicalId = Number(match[1]);

  const post = (url, body) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    }).then(async (r) => {
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Request failed");
      return d;
    });

  let button = null;

  function setCompleted() {
    if (!button) return;
    button.textContent = "✓ Practical Completed";
    button.classList.add("done");
    button.disabled = true;
  }

  async function complete(score, total) {
    const body = { practicalId };
    if (Number.isInteger(score) && Number.isInteger(total)) {
      body.score = score;
      body.total = total;
    }
    await post("/api/progress/complete", body);
    setCompleted();
  }

  function renderButton(alreadyDone) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "rv-progress-btn";
    button.textContent = "✓ Mark Practical as Completed";
    button.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "Saving...";
      try {
        await complete();
      } catch (err) {
        button.disabled = false;
        button.textContent = "Retry — Mark as Completed";
        console.error("[progress]", err);
      }
    });
    document.body.appendChild(button);
    if (alreadyDone) setCompleted();
  }

  // Call this from your quiz code: window.RasayanProgress.complete(score, total)
  window.RasayanProgress = {
    complete: (score, total) => complete(score, total).catch((e) => console.error("[progress]", e)),
  };

  (async () => {
    try {
      const { user } = await fetch("/api/auth/me", { credentials: "same-origin" }).then((r) => r.json());
      if (!user || user.role !== "student") return;
      await post("/api/progress/start", { practicalId });
      const mine = await fetch("/api/progress/me", { credentials: "same-origin" }).then((r) => r.json());
      const done = mine.progress.some((p) => p.practical_id === practicalId && p.status === "completed");
      renderButton(done);
    } catch (err) {
      console.warn("[progress] tracking unavailable:", err.message);
    }
  })();
})();