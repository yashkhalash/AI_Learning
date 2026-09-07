import nodemailer from "nodemailer";
import { RoadmapDay } from "./roadmap";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env.local"
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function baseTemplate(title: string, bodyHtml: string) {
  return `
  <div style="margin:0;padding:0;background:#0b0f1a;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
      <div style="background:linear-gradient(135deg,#7c5cff,#22d3ee);border-radius:16px;padding:2px;">
        <div style="background:#121828;border-radius:14px;padding:32px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;padding:8px 16px;border-radius:999px;background:rgba(124,92,255,0.15);color:#a78bfa;font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">
              30-Day AI Engineer Roadmap
            </div>
          </div>
          <h1 style="color:#ffffff;font-size:22px;margin:0 0 16px;text-align:center;">${title}</h1>
          ${bodyHtml}
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid #232b40;text-align:center;">
            <p style="color:#64748b;font-size:12px;margin:0;">Sent by your personal AI Roadmap Tracker · Keep the streak alive 🔥</p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export async function sendDailyReminderEmail(params: {
  to: string;
  todaysDays: RoadmapDay[];
  overallPercent: number;
  completedCount: number;
  totalDays: number;
  streak: number;
  dashboardUrl?: string;
}) {
  const { to, todaysDays, overallPercent, completedCount, totalDays, streak, dashboardUrl } = params;

  const dayRows = todaysDays
    .map(
      (d) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #232b40;color:#e2e8f0;font-weight:600;">Day ${d.day}</td>
        <td style="padding:12px;border-bottom:1px solid #232b40;color:#cbd5e1;">
          ${d.topic}<br/>
          <span style="color:#94a3b8;font-size:13px;">Task: ${d.miniTask}</span>
        </td>
      </tr>`
    )
    .join("");

  const body = `
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;text-align:center;margin:0 0 24px;">
      Good morning! Here's what's on deck today. ${streak > 0 ? `You're on a <b style="color:#34d399;">${streak}-day streak</b> 🔥` : "Let's start a new streak today!"}
    </p>

    <div style="background:#0d1220;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;color:#94a3b8;font-size:13px;margin-bottom:8px;">
        <span>Overall Progress</span>
        <span style="color:#22d3ee;font-weight:700;">${overallPercent}%</span>
      </div>
      <div style="background:#1a2236;border-radius:999px;height:10px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,#7c5cff,#22d3ee);height:10px;width:${overallPercent}%;border-radius:999px;"></div>
      </div>
      <p style="color:#64748b;font-size:12px;margin:8px 0 0;">${completedCount} of ${totalDays} days complete</p>
    </div>

    <table style="width:100%;border-collapse:collapse;">
      ${dayRows || `<tr><td style="padding:12px;color:#94a3b8;">No days scheduled for today — you're ahead or the roadmap is complete 🎉</td></tr>`}
    </table>

    <div style="text-align:center;margin-top:28px;">
      <a href="${dashboardUrl || "#"}" style="display:inline-block;background:linear-gradient(135deg,#7c5cff,#22d3ee);color:#0b0f1a;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:14px;">
        Open Dashboard →
      </a>
    </div>
  `;

  const html = baseTemplate("Your Daily Roadmap Reminder", body);

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `📅 Daily Reminder — ${todaysDays.length ? `Day ${todaysDays.map((d) => d.day).join(" & ")}` : "AI Roadmap"} (${overallPercent}% complete)`,
    html,
  });
}

export async function sendTestEmail(to: string) {
  const html = baseTemplate(
    "Test Email ✅",
    `<p style="color:#cbd5e1;font-size:15px;text-align:center;">Your SMTP configuration works. Daily reminders will look like this.</p>`
  );
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "✅ AI Roadmap Tracker — Test Email",
    html,
  });
}

export async function sendCompletionEmail(params: { to: string; day: RoadmapDay; overallPercent: number }) {
  const { to, day, overallPercent } = params;
  const body = `
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;text-align:center;">
      🎉 Nice work! You just marked <b style="color:#34d399;">Day ${day.day}: ${day.topic}</b> as complete.
    </p>
    <div style="background:#0d1220;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
      <span style="color:#22d3ee;font-size:28px;font-weight:800;">${overallPercent}%</span>
      <p style="color:#64748b;font-size:12px;margin:4px 0 0;">of the roadmap complete</p>
    </div>
  `;
  const html = baseTemplate("Day Completed", body);
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `✅ Day ${day.day} complete — ${overallPercent}% overall`,
    html,
  });
}
