# 🚀 AI Engineer Roadmap Tracker

A personal, self-hosted **Next.js 14** app (App Router + API routes as the backend)
to track your progress through the **30-Day AI Engineer Roadmap**, with:

- 📊 **Dynamic, animated dashboard** — overall %, per-week %, streaks, remaining days
- ✅ Mark each of the 30 days complete/incomplete, with per-day personal notes
- 📅 **Calendar view** — days are auto-scheduled from your start date; you can
  manually mark complete right from the calendar, or drag a day onto a new date
- 🕓 **History timeline** of everything you've completed/unmarked, with timestamps
- ✉️ **Daily reminder emails** (HTML template) via your own SMTP account, plus a
  "day completed 🎉" confirmation email
- 📱 Fully responsive, glassmorphism + gradient UI, animated with Framer Motion

Content on every page (day topics, mini-tasks, senior notes, week checkpoints)
is pulled directly from your uploaded **30-Day-AI-Engineer-Roadmap.docx**.

---

## 1. Install

```bash
npm install
```

## 2. Configure SMTP (for the reminder + completion emails)

Copy the example env file and fill in your real SMTP credentials:

```bash
cp .env.example .env.local
```

```ini
SMTP_HOST=smtp.gmail.com       # or your provider's SMTP host
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password    # Gmail: create an "App Password", not your login password
SMTP_FROM=your_email@gmail.com

REMINDER_TO_EMAIL=your_email@gmail.com   # default recipient (editable later in Settings)
APP_URL=http://localhost:3000
CRON_SECRET=some_random_string           # optional, protects /api/reminder
```

> Credentials are **never** entered in the UI — they live only in `.env.local`
> on your machine/server, which is git-ignored.

## 3. Run it

```bash
npm run dev        # http://localhost:3000
```

Go to **Settings** in the app, set your reminder email + preferred time, and
click **"Send test email"** to confirm SMTP works.

## 4. Turn on the daily reminder schedule

Since Next.js has no built-in cron, pick ONE of these:

**Option A — local/VPS, always-on process**
```bash
npm run build && npm run start     # terminal 1: the app
npm run cron                       # terminal 2: fires the reminder at your chosen time
```
`npm run cron` checks your saved reminder time every minute and calls
`/api/reminder` once per day at that time.

**Option B — deploy to Vercel**
`vercel.json` already includes a Cron entry hitting `/api/reminder` daily at
08:00 UTC — edit the schedule string to your timezone/time, then just deploy:
```bash
vercel deploy
```
(Set the same env vars from `.env.example` in the Vercel project settings.)

---

## Project structure

```
app/
  page.tsx              → Dashboard (progress rings, week bars, day cards)
  calendar/page.tsx      → Calendar view + manual complete/reschedule
  history/page.tsx       → Activity timeline
  settings/page.tsx      → Reminder email/time, start date, test email
  api/progress/route.ts  → GET progress+stats, POST complete/note/schedule
  api/settings/route.ts  → GET/POST reminder settings, test email trigger
  api/reminder/route.ts  → Sends the daily reminder email (called by cron)
components/              → Navbar, ProgressRing, WeekBar, DayCard, BackgroundFX
lib/
  roadmap.ts             → All 30 days + weeks, extracted from your .docx
  store.ts               → JSON-file backed persistence (data/progress.json)
  mailer.ts              → Nodemailer + HTML email templates
  useProgress.ts          → Client hook wrapping the progress API
scripts/cron.js          → Standalone node-cron scheduler (Option A above)
```

Progress is stored in `data/progress.json` (auto-created on first run) — no
external database needed. Swap `lib/store.ts` for a real DB later if you want
multi-device sync.

## Tech stack

Next.js 14 (App Router, API routes as backend) · React 18 · TypeScript ·
Tailwind CSS · Framer Motion · Nodemailer · node-cron · lucide-react icons.
# AI_Learning
