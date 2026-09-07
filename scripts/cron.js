/**
 * Standalone daily reminder scheduler.
 *
 * Run alongside your Next.js server (e.g. `npm run start` in one terminal,
 * `npm run cron` in another / as a pm2 process / as a systemd service).
 *
 * It reads the reminder time from the same progress.json used by the app
 * and hits the /api/reminder endpoint every minute to check if it's time
 * to send. This avoids re-implementing schedule logic in two places.
 */
require("dotenv").config({ path: ".env.local" });
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET || "";
const DATA_FILE = path.join(process.cwd(), "data", "progress.json");

function getReminderTime() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    return data.reminderTime || "08:00";
  } catch {
    return "08:00";
  }
}

let lastFiredMinute = null;

console.log(`[cron] Watching for reminder time, checking every minute. App URL: ${APP_URL}`);

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const current = `${hh}:${mm}`;
  const target = getReminderTime();
  const key = `${now.toISOString().slice(0, 10)}-${current}`;

  if (current === target && lastFiredMinute !== key) {
    lastFiredMinute = key;
    console.log(`[cron] Firing reminder at ${current}`);
    try {
      const url = `${APP_URL}/api/reminder${CRON_SECRET ? `?secret=${CRON_SECRET}` : ""}`;
      const res = await fetch(url, { method: "POST" });
      const json = await res.json();
      console.log("[cron] Reminder result:", json);
    } catch (err) {
      console.error("[cron] Failed to send reminder:", err.message);
    }
  }
});
