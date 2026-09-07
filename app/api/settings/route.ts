import { NextRequest, NextResponse } from "next/server";
import { readData, updateSettings, getStats } from "@/lib/store";
import { sendTestEmail } from "@/lib/mailer";

export async function GET() {
  try {
    const data = readData();
    const stats = getStats(data);
    return NextResponse.json({
      reminderEmail: data.reminderEmail,
      reminderTime: data.reminderTime,
      startDate: data.startDate,
      paceDays: data.paceDays,
      lastReminderSentAt: data.lastReminderSentAt,
      totalDays: stats.totalDays,
      totalDurationDays: stats.totalDurationDays,
      projectedEndDate: stats.projectedEndDate,
    });
  } catch (e) {
    console.error("GET /api/settings failed:", e);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "test-email") {
      try {
        await sendTestEmail(body.email || readData().reminderEmail);
        return NextResponse.json({ ok: true });
      } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
      }
    }

    const data = updateSettings({
      reminderEmail: body.reminderEmail,
      reminderTime: body.reminderTime,
      startDate: body.startDate,
      paceDays: body.paceDays !== undefined ? Number(body.paceDays) : undefined,
    });
    const stats = getStats(data);

    return NextResponse.json({
      ok: true,
      data,
      totalDurationDays: stats.totalDurationDays,
      projectedEndDate: stats.projectedEndDate,
    });
  } catch (e) {
    console.error("POST /api/settings failed:", e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
