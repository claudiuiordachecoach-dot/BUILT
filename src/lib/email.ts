import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "claudiuiordache.coach@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendMessageNotification(clientName: string, message: string) {
  if (!process.env.GMAIL_APP_PASSWORD) return;

  await transporter.sendMail({
    from: '"BUILT AI" <claudiuiordache.coach@gmail.com>',
    to: "claudiuiordache.coach@gmail.com",
    subject: `💬 Mesaj nou de la ${clientName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #0A0A0A; padding: 24px; border-radius: 8px;">
          <p style="color: #C0392B; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px;">BUILT AI — Mesaj Nou</p>
          <h2 style="color: #F5F5F5; margin: 0 0 16px; font-size: 18px;">${clientName} ți-a scris</h2>
          <div style="background: #111; border: 1px solid #252525; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
            <p style="color: #ccc; margin: 0; font-size: 14px; line-height: 1.6;">"${message}"</p>
          </div>
          <a href="https://built-ai-command-center.vercel.app/dashboard/clients"
             style="display: inline-block; background: #C0392B; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: bold;">
            Răspunde →
          </a>
        </div>
      </div>
    `,
  });
}
