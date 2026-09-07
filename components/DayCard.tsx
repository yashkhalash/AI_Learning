"use client";

import { motion } from "framer-motion";
import { Check, ChevronDown, StickyNote } from "lucide-react";
import { useState } from "react";
import { RoadmapDay } from "@/lib/roadmap";
import { DayStatus } from "@/lib/store";

export default function DayCard({
  day,
  status,
  onToggle,
  onNoteChange,
}: {
  day: RoadmapDay;
  status?: DayStatus;
  onToggle: (day: number) => void;
  onNoteChange: (day: number, note: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const completed = !!status?.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass rounded-2xl overflow-hidden border ${
        completed ? "border-good/30" : "border-white/5"
      }`}
    >
      <div className="p-4 flex items-start gap-3">
        <button
          onClick={() => onToggle(day.day)}
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

        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <motion.span animate={{ rotate: expanded ? 180 : 0 }}>
            <ChevronDown size={16} />
          </motion.span>
        </button>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4"
        >
          <div className="bg-panel2/60 rounded-xl p-3 mb-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-accent font-semibold">Senior note: </span>
              {day.seniorNote}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <StickyNote size={14} className="text-slate-500 mt-2 shrink-0" />
            <textarea
              defaultValue={status?.note || ""}
              onBlur={(e) => onNoteChange(day.day, e.target.value)}
              placeholder="Personal notes / what you built today..."
              className="w-full bg-panel2 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:ring-1 focus:ring-accent resize-none"
              rows={2}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
