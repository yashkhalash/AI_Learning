"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, Save, Clock, CalendarClock } from "lucide-react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [time, setTime] = useState("08:00");
  const [startDate, setStartDate] = useState("");
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setEmail(d.reminderEmail || "");
        setTime(d.reminderTime || "08:00");
        setStartDate(d.startDate || "");
        setLastSent(d.lastReminderSentAt);
      });
  }, []);

  async function save() {
    setSaving(true);
    setStatus(null);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderEmail: email, reminderTime: time, startDate }),
    });
    setSaving(false);
    setStatus(res.ok ? "Saved ✅" : "Failed to save");
  }

  async function sendTest() {
    setSending(true);
    setStatus(null);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test-email", email }),
    });
    const json = await res.json();
    setSending(false);
    setStatus(json.ok ? "Test email sent ✅ check your inbox" : `Failed: ${json.error}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-white">Settings</h1>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm text-slate-300 mb-1.5">
            <Mail size={14} /> Reminder email address
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-panel2 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-accent"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Daily reminder + completion confirmations are sent here. SMTP credentials themselves are configured server-side in <code className="text-accent2">.env.local</code> (never entered in the UI, for security).
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-slate-300 mb-1.5">
            <Clock size={14} /> Preferred reminder time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-panel2 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-accent"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Used by the cron script (<code className="text-accent2">npm run cron</code>) or your external scheduler to decide when to fire the reminder.
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-slate-300 mb-1.5">
            <CalendarClock size={14} /> Roadmap start date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-panel2 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-accent"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Changing this only affects newly-generated schedules going forward; use the Calendar page to move individual days.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent to-accent2 text-bg text-sm font-semibold disabled:opacity-50"
          >
            <Save size={14} /> {saving ? "Saving..." : "Save settings"}
          </button>
          <button
            onClick={sendTest}
            disabled={sending || !email}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-semibold text-slate-200 disabled:opacity-50"
          >
            <Send size={14} /> {sending ? "Sending..." : "Send test email"}
          </button>
        </div>

        {status && <p className="text-sm text-slate-300">{status}</p>}
        {lastSent && <p className="text-xs text-slate-500">Last reminder sent: {new Date(lastSent).toLocaleString()}</p>}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-2">How the daily reminder actually fires</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Since this is a personal, self-hosted app, scheduling is done outside of Next.js's request/response cycle. Two options are included:
        </p>
        <ul className="text-xs text-slate-400 list-disc pl-5 mt-2 space-y-1">
          <li><code className="text-accent2">npm run cron</code> — runs a lightweight Node process (node-cron) that calls the reminder API at your chosen time, every day, as long as it's running.</li>
          <li>Deploy to Vercel and use the included <code className="text-accent2">vercel.json</code> Cron entry to hit <code className="text-accent2">/api/reminder</code> automatically — no separate process needed.</li>
        </ul>
      </motion.div>
    </div>
  );
}
