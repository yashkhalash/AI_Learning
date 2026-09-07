"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, Save, Clock, CalendarClock, Gauge } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function SettingsPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [time, setTime] = useState("08:00");
  const [startDate, setStartDate] = useState("");
  const [paceDays, setPaceDays] = useState(1);
  const [totalDays, setTotalDays] = useState(0);
  const [totalDurationDays, setTotalDurationDays] = useState(0);
  const [projectedEndDate, setProjectedEndDate] = useState("");
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);

  // Live preview of duration/end-date as the user edits pace/start date, before saving.
  const previewSpanDays = totalDays ? Math.round((totalDays - 1) * paceDays) + 1 : totalDurationDays;
  const previewEndDate = (() => {
    if (!startDate || !totalDays) return projectedEndDate;
    const d = new Date(startDate + "T00:00:00");
    d.setDate(d.getDate() + Math.round((totalDays - 1) * paceDays));
    return d.toISOString().slice(0, 10);
  })();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setEmail(d.reminderEmail || "");
        setTime(d.reminderTime || "08:00");
        setStartDate(d.startDate || "");
        setPaceDays(d.paceDays || 1);
        setTotalDays(d.totalDays || 0);
        setTotalDurationDays(d.totalDurationDays || 0);
        setProjectedEndDate(d.projectedEndDate || "");
        setLastSent(d.lastReminderSentAt);
      });
  }, []);

  async function save() {
    setSaving(true);
    setStatus(null);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderEmail: email, reminderTime: time, startDate, paceDays }),
    });
    const json = await res.json().catch(() => null);
    setSaving(false);
    if (res.ok) {
      setTotalDurationDays(json?.totalDurationDays || totalDurationDays);
      setProjectedEndDate(json?.projectedEndDate || projectedEndDate);
      setStatus("Saved ✅");
      toast.success("Settings saved — calendar re-synced to your new pace");
    } else {
      setStatus("Failed to save");
      toast.error(json?.error || "Failed to save settings");
    }
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
    if (json.ok) toast.success("Test email sent — check your inbox");
    else toast.error(json.error || "Failed to send test email");
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
            Saving a new start date (or pace, below) re-lays out the whole calendar from that date — it overwrites any
            individual reschedules you made on the Calendar page. Use the Calendar page afterwards for one-off tweaks.
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-slate-300 mb-1.5">
            <Gauge size={14} /> Pace — days per topic
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={paceDays}
              onChange={(e) => setPaceDays(Math.max(0.5, Number(e.target.value) || 1))}
              className="w-28 bg-panel2 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-accent"
            />
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Daily", value: 1 },
                { label: "Every 2 days", value: 2 },
                { label: "Twice/week", value: 3.5 },
                { label: "Weekly", value: 7 },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPaceDays(p.value)}
                  className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                    paceDays === p.value ? "bg-gradient-to-r from-accent to-accent2 text-bg font-semibold" : "bg-panel2 text-slate-400 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Defaults to 1 topic/day, but the {totalDays || 30}-day curriculum doesn't have to run in {totalDays || 30}{" "}
            calendar days — stretch it out (e.g. 2 days/topic) or compress it. At{" "}
            <span className="text-accent2 font-medium">{paceDays}</span> day{paceDays === 1 ? "" : "s"}/topic you'll
            span <span className="text-accent2 font-medium">{previewSpanDays}</span> calendar days
            {previewEndDate && (
              <>
                {" "}
                — finishing around <span className="text-accent2 font-medium">{previewEndDate}</span>
              </>
            )}
            . Save to apply.
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
