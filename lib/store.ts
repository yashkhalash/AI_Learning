import fs from "fs";
import path from "path";
import { ROADMAP, TOTAL_DAYS } from "./roadmap";

// On Vercel (and most serverless platforms) the deployment bundle is read-only —
// only /tmp is writable, and it's ephemeral per-instance. Writing under process.cwd()
// there throws EROFS, which is what was causing the 500 on GET /api/progress
// (readData() heals missing days and immediately tries to persist them).
const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const DATA_DIR = isServerless ? path.join("/tmp", "ai-roadmap-data") : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "progress.json");
const SEED_FILE = path.join(process.cwd(), "data", "progress.json");

export type DayStatus = {
  day: number;
  completed: boolean;
  completedAt: string | null; // ISO date the user marked it done
  scheduledDate: string | null; // ISO date this day is calendar-mapped to
  note: string;
};

export type ProgressData = {
  startDate: string; // ISO date roadmap started
  paceDays: number; // calendar days between consecutive roadmap days (1 = one topic/day, 2 = one topic every 2 days, ...)
  days: Record<number, DayStatus>;
  history: { day: number; action: "completed" | "uncompleted"; at: string }[];
  reminderEmail: string;
  reminderTime: string; // "HH:mm" 24h
  lastReminderSentAt: string | null;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, n: number): string {
  // Do the arithmetic in UTC end-to-end — mixing a local-time constructor with
  // toISOString() (UTC) shifted every date back a day on servers east of UTC.
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Where roadmap day `day` (1-indexed) lands on the calendar given a start date and pace.
function scheduleFor(startDate: string, day: number, paceDays: number): string {
  return addDays(startDate, Math.round((day - 1) * paceDays));
}

function defaultData(): ProgressData {
  const startDate = todayISO();
  const paceDays = 1;
  const days: Record<number, DayStatus> = {};
  for (const d of ROADMAP) {
    days[d.day] = {
      day: d.day,
      completed: false,
      completedAt: null,
      scheduledDate: scheduleFor(startDate, d.day, paceDays),
      note: "",
    };
  }
  return {
    startDate,
    paceDays,
    days,
    history: [],
    reminderEmail: process.env.REMINDER_TO_EMAIL || "",
    reminderTime: "08:00",
    lastReminderSentAt: null,
  };
}

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    // Seed from the bundled data/progress.json when it exists (e.g. first cold start
    // on a serverless instance), otherwise fall back to a fresh default.
    let seed = defaultData();
    if (SEED_FILE !== DATA_FILE && fs.existsSync(SEED_FILE)) {
      try {
        seed = JSON.parse(fs.readFileSync(SEED_FILE, "utf-8"));
      } catch {
        // ignore malformed seed, use default
      }
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
  }
}

export function readData(): ProgressData {
  try {
    ensureFile();
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ProgressData;

    // Heal data if roadmap length ever changes / missing days, or if this is a
    // pre-custom-pace data file missing the new paceDays field.
    let changed = false;
    if (!parsed.paceDays || parsed.paceDays < 1) {
      parsed.paceDays = 1;
      changed = true;
    }
    for (const d of ROADMAP) {
      if (!parsed.days[d.day]) {
        parsed.days[d.day] = {
          day: d.day,
          completed: false,
          completedAt: null,
          scheduledDate: scheduleFor(parsed.startDate, d.day, parsed.paceDays),
          note: "",
        };
        changed = true;
      }
    }
    if (changed) writeData(parsed);
    return parsed;
  } catch (e) {
    // Never let a filesystem hiccup (e.g. read-only fs) 500 the request —
    // fall back to an in-memory default so the app stays usable.
    console.error("readData failed, falling back to in-memory defaults:", (e as Error).message);
    return defaultData();
  }
}

export function writeData(data: ProgressData) {
  try {
    ensureFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("writeData failed (changes won't persist):", (e as Error).message);
  }
}

export function setDayCompletion(day: number, completed: boolean) {
  const data = readData();
  const entry = data.days[day];
  if (!entry) throw new Error("Invalid day");
  entry.completed = completed;
  entry.completedAt = completed ? new Date().toISOString() : null;
  data.history.unshift({
    day,
    action: completed ? "completed" : "uncompleted",
    at: new Date().toISOString(),
  });
  data.history = data.history.slice(0, 500);
  writeData(data);
  return data;
}

export function setDayNote(day: number, note: string) {
  const data = readData();
  const entry = data.days[day];
  if (!entry) throw new Error("Invalid day");
  entry.note = note;
  writeData(data);
  return data;
}

export function setDaySchedule(day: number, scheduledDate: string) {
  const data = readData();
  const entry = data.days[day];
  if (!entry) throw new Error("Invalid day");
  entry.scheduledDate = scheduledDate;
  writeData(data);
  return data;
}

export function updateSettings(
  partial: Partial<Pick<ProgressData, "reminderEmail" | "reminderTime" | "startDate" | "paceDays">>
) {
  const data = readData();
  const paceOrStartChanged =
    (partial.startDate !== undefined && partial.startDate !== data.startDate) ||
    (partial.paceDays !== undefined && partial.paceDays !== data.paceDays);

  Object.assign(data, partial);
  if (partial.paceDays !== undefined) {
    data.paceDays = Math.max(0.5, partial.paceDays);
  }

  // Re-lay the whole calendar out from the (possibly new) start date / pace.
  // This intentionally overwrites any individual reschedules made from the Calendar
  // page — customizing the overall pace is meant to reset the schedule to match it.
  if (paceOrStartChanged) {
    for (const d of ROADMAP) {
      const entry = data.days[d.day];
      if (entry) entry.scheduledDate = scheduleFor(data.startDate, d.day, data.paceDays);
    }
  }

  writeData(data);
  return data;
}

export function markReminderSentNow() {
  const data = readData();
  data.lastReminderSentAt = new Date().toISOString();
  writeData(data);
  return data;
}

export function getStats(data: ProgressData) {
  const completedDays = Object.values(data.days).filter((d) => d.completed);
  const overallPercent = Math.round((completedDays.length / TOTAL_DAYS) * 100);

  const byWeek: Record<number, { total: number; completed: number; percent: number }> = {};
  for (const d of ROADMAP) {
    if (!byWeek[d.week]) byWeek[d.week] = { total: 0, completed: 0, percent: 0 };
    byWeek[d.week].total += 1;
    if (data.days[d.day]?.completed) byWeek[d.week].completed += 1;
  }
  for (const w of Object.keys(byWeek)) {
    const k = Number(w);
    byWeek[k].percent = Math.round((byWeek[k].completed / byWeek[k].total) * 100);
  }

  const currentStreak = computeStreak(data);

  // Total calendar days the roadmap spans end-to-end at the current pace, and the
  // ISO date the last day lands on — used by Settings to show "finishes on ...".
  const totalDurationDays = Math.round((TOTAL_DAYS - 1) * data.paceDays) + 1;
  const projectedEndDate = scheduleFor(data.startDate, TOTAL_DAYS, data.paceDays);

  return {
    totalDays: TOTAL_DAYS,
    completedCount: completedDays.length,
    overallPercent,
    byWeek,
    currentStreak,
    paceDays: data.paceDays,
    totalDurationDays,
    projectedEndDate,
  };
}

function computeStreak(data: ProgressData): number {
  // Streak = consecutive days (by scheduledDate, going backward from today) that are completed
  let streak = 0;
  let cursor = todayISO();
  const byDate: Record<string, boolean> = {};
  for (const d of Object.values(data.days)) {
    if (d.scheduledDate) byDate[d.scheduledDate] = d.completed;
  }
  while (byDate[cursor]) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
