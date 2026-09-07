"use client";

import { useCallback, useEffect, useState } from "react";
import { RoadmapDay } from "./roadmap";
import { ProgressData } from "./store";

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

  const refresh = useCallback(async () => {
    const res = await fetch("/api/progress", { cache: "no-store" });
    const json = await res.json();
    setData(json.data);
    setStats(json.stats);
    setRoadmap(json.roadmap);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleDay = useCallback(
    async (day: number) => {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", day }),
      });
      const json = await res.json();
      setData(json.data);
      setStats(json.stats);
    },
    []
  );

  const setNote = useCallback(async (day: number, note: string) => {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "note", day, note }),
    });
    const json = await res.json();
    setData(json.data);
    setStats(json.stats);
  }, []);

  const setSchedule = useCallback(async (day: number, scheduledDate: string) => {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "schedule", day, scheduledDate }),
    });
    const json = await res.json();
    setData(json.data);
    setStats(json.stats);
  }, []);

  return { data, stats, roadmap, loading, refresh, toggleDay, setNote, setSchedule };
}
