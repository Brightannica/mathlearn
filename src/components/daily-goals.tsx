"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Target, Flame, Zap, BookOpen, Code2, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { getState, subscribe, markProblemSolved, pingActivity } from "@/lib/local-state";
import { getOverallStats } from "@/lib/adaptive-difficulty";

type Goal = {
  id: string;
  label: string;
  icon: "solved" | "xp" | "lesson" | "streak";
  target: number;
  current: number;
  unit: string;
};

const DAILY_KEY = "mathitout-daily-goals-v1";

type DailyState = {
  date: string;
  goals: { id: string; current: number }[];
  claimed: string[];
};

function loadDaily(): DailyState {
  const today = new Date().toISOString().split("T")[0];
  if (typeof window === "undefined") return { date: today, goals: [], claimed: [] };
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DailyState;
      if (parsed.date === today) return parsed;
    }
  } catch {}
  const fresh: DailyState = { date: today, goals: [], claimed: [] };
  saveDaily(fresh);
  return fresh;
}

function saveDaily(state: DailyState) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(DAILY_KEY, JSON.stringify(state)); } catch {}
}

export function DailyGoals() {
  const [tick, setTick] = useState(0);
  const [daily, setDaily] = useState<DailyState>(loadDaily);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    setDaily(loadDaily());
  }, [tick]);

  const state = getState();
  const overall = getOverallStats();
  void tick;

  const todaySolved = useMemo(() => {
    return (state.solved || []).filter((s) => {
      const d = new Date(s.solvedAt);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }).length;
  }, [state.solved, tick]);

  const goals: Goal[] = [
    { id: "solved", label: "solve problems", icon: "solved", target: 5, current: todaySolved, unit: "solved" },
    { id: "xp", label: "earn XP", icon: "xp", target: 100, current: state.solved?.slice(-5).reduce((s, x) => s + (x.xp || 0), 0) || 0, unit: "XP" },
    { id: "streak", label: "active today", icon: "streak", target: 1, current: state.lastActiveDate === new Date().toISOString().split("T")[0] ? 1 : 0, unit: "" },
  ];

  const totalCurrent = goals.reduce((s, g) => s + Math.min(g.current, g.target), 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const allDone = totalCurrent >= totalTarget;

  const claimGoal = (id: string) => {
    if (!allDone) return;
    if (daily.claimed.includes(id)) return;
    const updated = { ...daily, claimed: [...daily.claimed, id] };
    saveDaily(updated);
    setDaily(updated);
  };

  const iconFor = (icon: Goal["icon"]) => {
    switch (icon) {
      case "solved": return Target;
      case "xp": return Zap;
      case "lesson": return BookOpen;
      case "streak": return Flame;
    }
  };

  return (
    <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-zinc-500" />
          <span className="font-semibold text-sm">today's goals</span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px]",
            allDone ? "border-[#c4f000] text-[#c4f000]" : "border-zinc-700 text-zinc-400"
          )}
        >
          {totalCurrent}/{totalTarget}
        </Badge>
      </div>

      <div className="space-y-2">
        {goals.map((g) => {
          const Icon = iconFor(g.icon);
          const done = g.current >= g.target;
          const claimed = daily.claimed.includes(g.id);
          return (
            <div key={g.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={cn("flex items-center gap-1.5", done ? "text-zinc-100" : "text-zinc-400")}>
                  {done ? (
                    <CheckCircle2 className="h-3 w-3 text-[#c4f000]" />
                  ) : (
                    <Circle className="h-3 w-3 text-zinc-600" />
                  )}
                  {g.label}
                </span>
                <span className="text-zinc-500 font-mono text-[10px]">
                  {Math.min(g.current, g.target)}/{g.target} {g.unit}
                </span>
              </div>
              <div className="h-1 bg-zinc-900">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min((g.current / g.target) * 100, 100)}%`,
                    backgroundColor: done ? "#c4f000" : "#52525b",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {allDone && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-1 border border-[#c4f000]/30 bg-[#c4f000]/5 text-xs text-[#c4f000]">
            <CheckCircle2 className="h-3 w-3" /> all goals complete
          </div>
        </div>
      )}
    </div>
  );
}
