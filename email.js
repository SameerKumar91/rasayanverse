const OTP_DEBUG = process.env.OTP_DEBUG === "true";

async function sendOtpEmail(to, code, minutes) {
  if (OTP_DEBUG) console.log(`[OTP DEBUG] ${to} -> ${code}`);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "RasayanVerse <onboarding@resend.dev>";

  if (!apiKey) {
    if (OTP_DEBUG) return;
    throw new Error("RESEND_API_KEY is not configured");
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:14px">
      <h2 style="color:#1554a3;margin:0 0 6px">RasayanVerse</h2>
      <p style="color:#475569;margin:0 0 18px">Virtual Chemistry Lab</p>
      <p>Your one-time password is:</p>
      <p style="font-size:32px;font-weight:800;letter-spacing:8px;color:#0f172a;margin:10px 0">${code}</p>
      <p style="color:#64748b;font-size:13px">This code expires in ${minutes} minutes. If you didn't request it, ignore this email.</p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Your RasayanVerse OTP: ${code}`,
        html,
        text: `Your RasayanVerse OTP is ${code}. It expires in ${minutes} minutes.`,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend ${res.status}: ${body}`);
    }
  } catch (err) {
    // In demo mode the OTP is already in the logs, so don't block login.
    if (OTP_DEBUG) {
      console.warn("[email] send failed (OTP_DEBUG on, continuing):", err.message);
      return;
    }
    throw err;
  }
}

module.exports = { sendOtpEmail };