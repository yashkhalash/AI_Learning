"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { useProgress } from "@/lib/useProgress";

export default function HistoryPage() {
  const { data, roadmap, loading } = useProgress();

  if (loading || !data) {
    return <div className="flex items-center justify-center h-[60vh] text-slate-400">Loading history...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Activity History</h1>

      {data.history.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-slate-500">
          No activity yet — mark a day complete to see it here.
        </div>
      ) : (
        <div className="glass rounded-2xl p-2 sm:p-4">
          <div className="relative pl-6 space-y-4 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
            {data.history.map((h, i) => {
              const rd = roadmap.find((r) => r.day === h.day);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="relative"
                >
                  <span
                    className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                      h.action === "completed" ? "bg-good" : "bg-slate-600"
                    }`}
                  >
                    {h.action === "completed" ? (
                      <CheckCircle2 size={12} className="text-bg" />
                    ) : (
                      <XCircle size={12} className="text-bg" />
                    )}
                  </span>
                  <div className="bg-panel2/60 rounded-xl p-3">
                    <p className="text-sm text-white font-medium">
                      Day {h.day}: {rd?.topic || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {h.action === "completed" ? "Marked complete" : "Unmarked"} · {new Date(h.at).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
