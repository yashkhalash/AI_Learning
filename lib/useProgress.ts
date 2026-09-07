"use client";

import { useCallback, useEffect, useState } from "react";
import { RoadmapDay } from "./roadmap";
import { ProgressData } from "./store";
import { useToast } from "@/components/Toast";

export type Stats = {
  totalDays: number;
  completedCount: number;
  overallPercent: number;
  byWeek: Record<number, { total: number; completed: number; percent: number }>;
  currentStreak: number;
};

export function useProgress() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapDay[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/progress", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load progress");
      setData(json.data);
      setStats(json.stats);
      setRoadmap(json.roadmap);
    } catch (e: any) {
      toast.error(e.message || "Failed to load your roadmap");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleDay = useCallback(
    async (day: number) => {
      try {
        const wasCompleted = !!data?.days[day]?.completed;
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "toggle", day }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to update day");
        setData(json.data);
        setStats(json.stats);
        toast.success(wasCompleted ? `Day ${day} marked incomplete` : `Day ${day} completed 🎉`);
      } catch (e: any) {
        toast.error(e.message || "Failed to update day");
      }
    },
    [data, toast]
  );

  const setNote = useCallback(
    async (day: number, note: string) => {
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "note", day, note }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to save note");
        setData(json.data);
        setStats(json.stats);
        toast.success("Note saved");
      } catch (e: any) {
        toast.error(e.message || "Failed to save note");
      }
    },
    [toast]
  );

  const setSchedule = useCallback(
    async (day: number, scheduledDate: string) => {
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "schedule", day, scheduledDate }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to reschedule day");
        setData(json.data);
        setStats(json.stats);
        toast.success(`Day ${day} rescheduled to ${scheduledDate}`);
      } catch (e: any) {
        toast.error(e.message || "Failed to reschedule day");
      }
    },
    [toast]
  );

  return { data, stats, roadmap, loading, refresh, toggleDay, setNote, setSchedule };
}
