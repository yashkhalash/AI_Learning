import { NextRequest, NextResponse } from "next/server";
import { readData, setDayCompletion, setDayNote, setDaySchedule, getStats } from "@/lib/store";
import { sendCompletionEmail } from "@/lib/mailer";
import { ROADMAP } from "@/lib/roadmap";

export async function GET() {
  const data = readData();
  const stats = getStats(data);
  return NextResponse.json({ data, stats, roadmap: ROADMAP });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, day } = body;

  if (!day || typeof day !== "number") {
    return NextResponse.json({ error: "day is required" }, { status: 400 });
  }

  let data;
  if (action === "toggle" || action === "complete" || action === "uncomplete") {
    const completed = action === "complete" ? true : action === "uncomplete" ? false : !readData().days[day]?.completed;
    data = setDayCompletion(day, completed);

    if (completed && data.reminderEmail) {
      const stats = getStats(data);
      const roadmapDay = ROADMAP.find((d) => d.day === day);
      if (roadmapDay) {
        sendCompletionEmail({ to: data.reminderEmail, day: roadmapDay, overallPercent: stats.overallPercent }).catch(
          (e) => console.error("Completion email failed:", e.message)
        );
      }
    }
  } else if (action === "note") {
    data = setDayNote(day, body.note || "");
  } else if (action === "schedule") {
    data = setDaySchedule(day, body.scheduledDate);
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const stats = getStats(data);
  return NextResponse.json({ data, stats });
}
