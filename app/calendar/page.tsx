"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useProgress } from "@/lib/useProgress";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function CalendarPage() {
  const { data, roadmap, loading, toggleDay, setSchedule } = useProgress();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() }; // month 0-indexed
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const dayByDate = useMemo(() => {
    const map: Record<string, number[]> = {};
    if (!data) return map;
    for (const [dayNum, status] of Object.entries(data.days)) {
      if (status.scheduledDate) {
        map[status.scheduledDate] = map[status.scheduledDate] || [];
        map[status.scheduledDate].push(Number(dayNum));
      }
    }
    return map;
  }, [data]);

  const grid = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(`${cursor.year}-${pad(cursor.month + 1)}-${pad(d)}`);
    }
    return cells;
  }, [cursor]);

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  if (loading || !data) {
    return <div className="flex items-center justify-center h-[60vh] text-slate-400">Loading calendar...</div>;
  }

  const todayISO = new Date().toISOString().slice(0, 10);
  const selectedDays = selectedDate ? dayByDate[selectedDate] || [] : [];

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))}
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-slate-300 hover:text-white"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-lg font-bold text-white">{monthLabel}</h2>
          <button
            onClick={() => setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))}
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-slate-300 hover:text-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-[11px] text-slate-500 font-semibold py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {grid.map((dateStr, i) => {
            if (!dateStr) return <div key={i} />;
            const days = dayByDate[dateStr] || [];
            const allDone = days.length > 0 && days.every((dn) => data.days[dn]?.completed);
            const someDone = days.length > 0 && days.some((dn) => data.days[dn]?.completed);
            const isToday = dateStr === todayISO;
            const isSelected = dateStr === selectedDate;

            return (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-colors
                  ${isSelected ? "ring-2 ring-accent2" : ""}
                  ${allDone ? "bg-good/20 text-good" : someDone ? "bg-warn/20 text-warn" : days.length ? "bg-panel2 text-slate-300" : "bg-panel2/40 text-slate-600"}
                  ${isToday ? "border border-accent2" : ""}
                `}
              >
                <span>{Number(dateStr.split("-")[2])}</span>
                {days.length > 0 && (
                  <span className="text-[9px] mt-0.5 opacity-80">
                    {days.map((d) => `D${d}`).join(",")}
                  </span>
                )}
                {allDone && <Check size={10} className="absolute top-1 right-1" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass rounded-2xl p-5"
          >
            <h3 className="font-bold text-white mb-3">{selectedDate}</h3>
            {selectedDays.length === 0 ? (
              <p className="text-sm text-slate-500">No roadmap day scheduled on this date.</p>
            ) : (
              <div className="space-y-2">
                {selectedDays.map((dn) => {
                  const rd = roadmap.find((r) => r.day === dn);
                  const completed = data.days[dn]?.completed;
                  return (
                    <div key={dn} className="flex items-center justify-between bg-panel2/60 rounded-xl p-3">
                      <div>
                        <p className="text-sm font-semibold text-white">Day {dn}: {rd?.topic}</p>
                        <p className="text-xs text-slate-500">{rd?.miniTask}</p>
                      </div>
                      <button
                        onClick={() => toggleDay(dn)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          completed ? "bg-good text-bg" : "bg-panel border border-slate-600 text-slate-300 hover:border-accent2"
                        }`}
                      >
                        {completed ? "✓ Completed" : "Mark complete"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-slate-500 mb-2">Reschedule a day to this date:</p>
              <div className="flex flex-wrap gap-2">
                {roadmap.map((r) => (
                  <button
                    key={r.day}
                    onClick={() => setSchedule(r.day, selectedDate)}
                    className="text-[11px] px-2 py-1 rounded-full bg-panel2 text-slate-400 hover:text-white hover:bg-accent/30"
                  >
                    Day {r.day}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
