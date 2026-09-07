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
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function defaultData(): ProgressData {
  const startDate = todayISO();
  const days: Record<number, DayStatus> = {};
  for (const d of ROADMAP) {
    days[d.day] = {
      day: d.day,
      completed: false,
      completedAt: null,
      scheduledDate: addDays(startDate, d.day - 1),
      note: "",
    };
  }
  return {
    startDate,
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

    // Heal data if roadmap length ever changes / missing days
    let changed = false;
    for (const d of ROADMAP) {
      if (!parsed.days[d.day]) {
        parsed.days[d.day] = {
          day: d.day,
          completed: false,
          completedAt: null,
          scheduledDate: addDays(parsed.startDate, d.day - 1),
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

export function updateSettings(partial: Partial<Pick<ProgressData, "reminderEmail" | "reminderTime" | "startDate">>) {
  const data = readData();
  Object.assign(data, partial);
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

  return {
    totalDays: TOTAL_DAYS,
    completedCount: completedDays.length,
    overallPercent,
    byWeek,
    currentStreak,
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
