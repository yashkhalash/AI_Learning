"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, ListChecks, Mail } from "lucide-react";
import { useMemo, useState } from "react";
import { useProgress } from "@/lib/useProgress";
import { WEEKS } from "@/lib/roadmap";
import ProgressRing from "@/components/ProgressRing";
import WeekBar from "@/components/WeekBar";
import DayCard from "@/components/DayCard";
import PageLoader from "@/components/PageLoader";

export default function DashboardPage() {
  const { data, stats, roadmap, loading, toggleDay, setNote } = useProgress();
  const [weekFilter, setWeekFilter] = useState<number | "all">("all");
  const [search, setSearch] = useState("");

  const filteredDays = useMemo(() => {
    return roadmap.filter((d) => {
      if (weekFilter !== "all" && d.week !== weekFilter) return false;
      if (search && !d.topic.toLowerCase().includes(search.toLowerCase()) && !`day ${d.day}`.includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [roadmap, weekFilter, search]);

  if (loading || !data || !stats) {
    return <PageLoader label="Loading your roadmap..." />;
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8"
      >
        <ProgressRing percent={stats.overallPercent} size={170} label="Overall" sublabel={`${stats.completedCount}/${stats.totalDays} days`} />

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <StatCard icon={<Flame className="text-warn" size={20} />} label="Current Streak" value={`${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"}`} />
          <StatCard icon={<Trophy className="text-accent2" size={20} />} label="Days Completed" value={`${stats.completedCount} / ${stats.totalDays}`} />
          <StatCard icon={<ListChecks className="text-good" size={20} />} label="Days Remaining" value={`${stats.totalDays - stats.completedCount}`} />
        </div>
      </motion.div>

      {!data.reminderEmail && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-4 flex items-center gap-3 border border-warn/30"
        >
          <Mail size={18} className="text-warn shrink-0" />
          <p className="text-sm text-slate-300">
            No reminder email configured yet. Go to <a href="/settings" className="text-accent2 underline">Settings</a> to enable daily reminder emails.
          </p>
        </motion.div>
      )}

      {/* Weekly breakdown */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Weekly Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WEEKS.map((w) => (
            <WeekBar
              key={w.week}
              week={w.week}
              title={w.title}
              range={w.range}
              percent={stats.byWeek[w.week]?.percent || 0}
              completed={stats.byWeek[w.week]?.completed || 0}
              total={stats.byWeek[w.week]?.total || 0}
            />
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-white">Daily Modules</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a topic or day..."
            className="glass rounded-full px-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:ring-1 focus:ring-accent"
          />
          <select
            value={weekFilter}
            onChange={(e) => setWeekFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="glass rounded-full px-3 py-1.5 text-sm text-slate-200 outline-none"
          >
            <option value="all">All Weeks</option>
            {WEEKS.map((w) => (
              <option key={w.week} value={w.week}>
                Week {w.week}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDays.map((d) => (
          <DayCard key={d.day} day={d} status={data.days[d.day]} onToggle={toggleDay} onNoteChange={setNote} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-panel2/60 rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-panel flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
