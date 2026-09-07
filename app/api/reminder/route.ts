import { NextRequest, NextResponse } from "next/server";
import { readData, getStats, markReminderSentNow } from "@/lib/store";
import { sendDailyReminderEmail } from "@/lib/mailer";
import { ROADMAP } from "@/lib/roadmap";

// Protect this endpoint with a shared secret so random requests can't trigger emails.
function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured -> open (fine for personal/local use)
  const header = req.headers.get("x-cron-secret");
  const url = new URL(req.url);
  const qp = url.searchParams.get("secret");
  return header === secret || qp === secret;
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = readData();
    if (!data.reminderEmail) {
      return NextResponse.json({ skipped: true, reason: "No reminder email configured" });
    }

    const stats = getStats(data);
    const todayISO = new Date().toISOString().slice(0, 10);

    const todaysDays = ROADMAP.filter((d) => {
      const entry = data.days[d.day];
      return entry && entry.scheduledDate === todayISO && !entry.completed;
    });

    const pendingOverdue = ROADMAP.filter((d) => {
      const entry = data.days[d.day];
      return entry && entry.scheduledDate && entry.scheduledDate < todayISO && !entry.completed;
    });

    const daysToShow = [...todaysDays, ...pendingOverdue].slice(0, 5);

    await sendDailyReminderEmail({
      to: data.reminderEmail,
      todaysDays: daysToShow,
      overallPercent: stats.overallPercent,
      completedCount: stats.completedCount,
      totalDays: stats.totalDays,
      streak: stats.currentStreak,
      dashboardUrl: process.env.APP_URL || "http://localhost:3000",
    });
    markReminderSentNow();
    return NextResponse.json({ ok: true, sentTo: data.reminderEmail, days: daysToShow.map((d) => d.day) });
  } catch (e: any) {
    console.error("GET/POST /api/reminder failed:", e);
    return NextResponse.json({ ok: false, error: e.message || "Failed to send reminder" }, { status: 500 });
  }
}
