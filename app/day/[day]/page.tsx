"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Loader2,
  ExternalLink,
  StickyNote,
  CalendarDays,
} from "lucide-react";
import { useProgress } from "@/lib/useProgress";
import PageLoader from "@/components/PageLoader";

type Resource = { title: string; url: string; type: string };
type LearnContent = { explanation: string; resources: Resource[] };

export default function DayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dayNum = Number(params.day);

  const { data, roadmap, loading, toggleDay, setNote, setSchedule } = useProgress();
  const [learn, setLearn] = useState<LearnContent | null>(null);
  const [learnLoading, setLearnLoading] = useState(false);
  const [learnError, setLearnError] = useState<string | null>(null);

  const roadmapDay = roadmap.find((d) => d.day === dayNum);
  const status = data?.days[dayNum];

  useEffect(() => {
    if (!roadmapDay || learn || learnLoading) return;
    fetchLearnContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmapDay]);

  async function fetchLearnContent() {
    setLearnLoading(true);
    setLearnError(null);
    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: dayNum }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load learning content");
      setLearn(json);
    } catch (e: any) {
      setLearnError(e.message || "Something went wrong");
    } finally {
      setLearnLoading(false);
    }
  }

  if (loading || !data) {
    return <PageLoader label="Loading day details..." />;
  }

  if (!roadmapDay) {
    return (
      <div className="glass rounded-2xl p-8 text-center space-y-3">
        <p className="text-slate-300">Day {dayNum} doesn't exist in the roadmap.</p>
        <button onClick={() => router.push("/")} className="text-accent2 underline text-sm">
          Back to dashboard
        </button>
      </div>
    );
  }

  const completed = !!status?.completed;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass rounded-3xl p-6 sm:p-8 border ${completed ? "border-good/30" : "border-white/5"}`}
      >
        <div className="flex items-start gap-4">
          <button
            onClick={() => toggleDay(dayNum)}
            className={`mt-1 shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
              completed ? "bg-good border-good" : "border-slate-500 hover:border-accent2"
            }`}
            aria-label="Toggle complete"
          >
            {completed && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Check size={20} className="text-bg" strokeWidth={3} />
              </motion.span>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-panel2 text-accent2">
                Day {roadmapDay.day} · Week {roadmapDay.week}
              </span>
              {status?.scheduledDate && (
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <CalendarDays size={11} /> {status.scheduledDate}
                </span>
              )}
              {completed && <span className="text-[11px] text-good font-semibold">✓ Completed</span>}
            </div>
            <h1 className={`text-xl font-bold ${completed ? "text-slate-400 line-through" : "text-white"}`}>
              {roadmapDay.topic}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              <span className="text-slate-500">Task:</span> {roadmapDay.miniTask}
            </p>
          </div>
        </div>

        <div className="bg-panel2/60 rounded-xl p-4 mt-6">
          <p className="text-sm text-slate-300 leading-relaxed">
            <span className="text-accent font-semibold">Senior note: </span>
            {roadmapDay.seniorNote}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass rounded-2xl p-5 sm:p-6"
      >
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles size={15} className="text-accent2" />
          <h2 className="text-sm font-bold text-accent2">Learn this topic</h2>
        </div>

        {learnLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-3">
            <Loader2 size={16} className="animate-spin" />
            Fetching explanation & resources...
          </div>
        )}

        {learnError && (
          <div className="text-sm text-red-400 flex items-center justify-between gap-2">
            <span>{learnError}</span>
            <button onClick={fetchLearnContent} className="underline shrink-0 hover:text-red-300">
              Retry
            </button>
          </div>
        )}

        {learn && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{learn.explanation}</p>
            {learn.resources.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Resources</p>
                {learn.resources.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-300 hover:text-accent2 bg-panel2/60 rounded-lg px-3 py-2 transition-colors"
                  >
                    <ExternalLink size={13} className="shrink-0 text-slate-500" />
                    <span className="truncate flex-1">{r.title}</span>
                    <span className="shrink-0 text-[10px] uppercase text-slate-500">{r.type}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-5 sm:p-6"
      >
        <div className="flex items-center gap-1.5 mb-3">
          <StickyNote size={15} className="text-slate-400" />
          <h2 className="text-sm font-bold text-slate-300">Your notes</h2>
        </div>
        <textarea
          defaultValue={status?.note || ""}
          onBlur={(e) => setNote(dayNum, e.target.value)}
          placeholder="What did you build today? Any blockers, insights..."
          className="w-full bg-panel2 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 outline-none focus:ring-1 focus:ring-accent resize-none"
          rows={4}
        />

        <div className="mt-4 pt-4 border-t border-white/5">
          <label className="text-xs text-slate-500 mb-2 block">Scheduled date</label>
          <input
            type="date"
            defaultValue={status?.scheduledDate || ""}
            onChange={(e) => e.target.value && setSchedule(dayNum, e.target.value)}
            className="bg-panel2 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </motion.div>
    </div>
  );
}
