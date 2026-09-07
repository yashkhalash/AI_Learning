"use client";

import { motion } from "framer-motion";
import { Check, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { RoadmapDay } from "@/lib/roadmap";
import { DayStatus } from "@/lib/store";

export default function DayCard({
  day,
  status,
  onToggle,
}: {
  day: RoadmapDay;
  status?: DayStatus;
  onToggle: (day: number) => void;
  onNoteChange: (day: number, note: string) => void;
}) {
  const router = useRouter();
  const completed = !!status?.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      onClick={() => router.push(`/day/${day.day}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/day/${day.day}`);
      }}
      className={`glass rounded-2xl overflow-hidden border cursor-pointer transition-colors hover:border-accent2/40 ${
        completed ? "border-good/30" : "border-white/5"
      }`}
    >
      <div className="p-4 flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(day.day);
          }}
          className={`mt-0.5 shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
            completed ? "bg-good border-good" : "border-slate-500 hover:border-accent2"
          }`}
          aria-label="Toggle complete"
        >
          {completed && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Check size={15} className="text-bg" strokeWidth={3} />
            </motion.span>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-panel2 text-accent2">
              Day {day.day}
            </span>
            {status?.scheduledDate && (
              <span className="text-[11px] text-slate-500">{status.scheduledDate}</span>
            )}
            {completed && (
              <span className="text-[11px] text-good font-semibold">✓ Done</span>
            )}
          </div>
          <p className={`mt-1 font-semibold text-sm ${completed ? "text-slate-400 line-through" : "text-white"}`}>
            {day.topic}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Task: {day.miniTask}</p>
        </div>

        <span className="shrink-0 w-7 h-7 flex items-center justify-center text-slate-400">
          <ArrowUpRight size={16} />
        </span>
      </div>
    </motion.div>
  );
}
