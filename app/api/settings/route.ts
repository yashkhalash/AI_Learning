import { NextRequest, NextResponse } from "next/server";
import { readData, updateSettings } from "@/lib/store";
import { sendTestEmail } from "@/lib/mailer";

export async function GET() {
  try {
    const data = readData();
    return NextResponse.json({
      reminderEmail: data.reminderEmail,
      reminderTime: data.reminderTime,
      startDate: data.startDate,
      lastReminderSentAt: data.lastReminderSentAt,
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
    });

    return NextResponse.json({ ok: true, data });
  } catch (e) {
    console.error("POST /api/settings failed:", e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
