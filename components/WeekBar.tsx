"use client";

import { motion } from "framer-motion";

export default function WeekBar({
  week,
  title,
  range,
  percent,
  completed,
  total,
}: {
  week: number;
  title: string;
  range: string;
  percent: number;
  completed: number;
  total: number;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-white">
            Week {week} — {title}
          </p>
          <p className="text-xs text-slate-500">{range}</p>
        </div>
        <span className="text-sm font-bold text-accent2">{percent}%</span>
      </div>
      <div className="h-2.5 bg-panel2 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent2"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <p className="text-[11px] text-slate-500 mt-1.5">
        {completed}/{total} days done
      </p>
    </div>
  );
}
