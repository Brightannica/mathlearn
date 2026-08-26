"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Clock, TrendingUp, BarChart3, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { getState, subscribe } from "@/lib/local-state";
import { getPerformance, getOverallStats } from "@/lib/adaptive-difficulty";

type DayData = {
  date: string;
  count: number;
  isToday: boolean;
};

export function PracticeAnalytics() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  const state = getState();
  void tick;
  const overall = getOverallStats();
  const perf = getPerformance();

  // Build 90-day heatmap
  const days = useMemo(() => {
    const result: DayData[] = [];
    const activeSet = new Set(state.activeDates || []);
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      result.push({
        date: dateStr,
        count: activeSet.has(dateStr) ? 1 : 0,
        isToday: i === 0,
      });
    }
    return result;
  }, [state.activeDates]);

  // Hour distribution
  const hourDist = useMemo(() => {
    const dist = new Array(24).fill(0);
    for (const date of state.activeDates || []) {
      const d = new Date(date);
      dist[d.getHours()]++;
    }
    return dist;
  }, [state.activeDates]);

  const maxHour = Math.max(...hourDist, 1);
  const activeDays = (state.activeDates || []).length;
  const peakHour = hourDist.indexOf(maxHour);

  // Topic strengths/weaknesses
  const topics = Object.values(perf);
  const strong = topics.filter((t) => t.attempts >= 3 && t.accuracy >= 0.8).sort((a, b) => b.accuracy - a.accuracy);
  const weak = topics.filter((t) => t.attempts >= 3 && t.accuracy < 0.6).sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="space-y-4">
      {/* Key metrics */}
      <div className="grid gap-px bg-zinc-800/60 border border-zinc-800/60 grid-cols-2 sm:grid-cols-4">
        <div className="bg-[#0d0d0d] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="h-3 w-3 text-zinc-500" />
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">active days</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{activeDays}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">last 90 days</div>
        </div>
        <div className="bg-[#0d0d0d] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">accuracy</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100">
            {overall.totalAttempts > 0 ? Math.round(overall.overallAccuracy * 100) : 0}%
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">{overall.totalCorrect}/{overall.totalAttempts} correct</div>
        </div>
        <div className="bg-[#0d0d0d] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="h-3 w-3 text-[#c4f000]" />
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">total xp</div>
          </div>
          <div className="text-2xl font-bold text-[#c4f000]">{(state.xp || 0).toLocaleString()}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">level {state.level || 1}</div>
        </div>
        <div className="bg-[#0d0d0d] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3 w-3 text-orange-400" />
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">peak hour</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{peakHour}:00</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">{maxHour} active days</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-zinc-500" />
            <h3 className="font-semibold text-sm">activity heatmap</h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">last 90 days</span>
        </div>
        <div className="grid grid-cols-[repeat(45,1fr)] gap-1">
          {days.map((d) => (
            <div
              key={d.date}
              title={d.date}
              className={cn(
                "aspect-square",
                d.count > 0 ? "bg-[#c4f000]" : "bg-zinc-900",
                d.isToday && "ring-1 ring-[#c4f000] ring-offset-1 ring-offset-[#0a0a0a]"
              )}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 text-[10px] text-zinc-600 font-mono">
          <span>90 days ago</span>
          <div className="flex items-center gap-1">
            <span>less</span>
            <div className="w-3 h-3 bg-zinc-900" />
            <div className="w-3 h-3 bg-[#c4f000]/40" />
            <div className="w-3 h-3 bg-[#c4f000]" />
            <span>more</span>
          </div>
          <span>today</span>
        </div>
      </div>

      {/* Hour distribution */}
      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-zinc-500" />
          <h3 className="font-semibold text-sm">when you practice</h3>
        </div>
        <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 h-12 items-end">
          {hourDist.map((count, hour) => {
            const h = (count / maxHour) * 100;
            return (
              <div
                key={hour}
                title={`${hour}:00 — ${count} active days`}
                className={cn(
                  "w-full",
                  count === 0 ? "h-1" : ""
                )}
                style={{
                  height: count === 0 ? "4px" : `${Math.max(h, 8)}%`,
                  backgroundColor: count > 0 ? `rgba(196, 240, 0, ${0.3 + h / 150})` : "#1a1a1a",
                }}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[10px] text-zinc-600 font-mono">
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>11pm</span>
        </div>
      </div>

      {/* Strengths & weaknesses */}
      {topics.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
            <h3 className="font-semibold text-sm text-emerald-400 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> strengths
            </h3>
            {strong.length === 0 ? (
              <p className="text-xs text-zinc-500">no strong topics yet. keep practicing!</p>
            ) : (
              <div className="space-y-2">
                {strong.slice(0, 3).map((t) => (
                  <div key={t.topic} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 capitalize">{t.topic}</span>
                      <span className="text-emerald-400 font-mono">{Math.round(t.accuracy * 100)}%</span>
                    </div>
                    <div className="h-1 bg-zinc-900">
                      <div className="h-full bg-emerald-500" style={{ width: `${t.accuracy * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
            <h3 className="font-semibold text-sm text-rose-400 mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" /> needs work
            </h3>
            {weak.length === 0 ? (
              <p className="text-xs text-zinc-500">no weak topics. great job!</p>
            ) : (
              <div className="space-y-2">
                {weak.slice(0, 3).map((t) => (
                  <div key={t.topic} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 capitalize">{t.topic}</span>
                      <span className="text-rose-400 font-mono">{Math.round(t.accuracy * 100)}%</span>
                    </div>
                    <div className="h-1 bg-zinc-900">
                      <div className="h-full bg-rose-500" style={{ width: `${t.accuracy * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
