"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Zap, Target, Sparkles, ArrowRight, Calendar, CheckCircle2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { getState, subscribe, pingActivity, markProblemSolved } from "@/lib/local-state";
import { getPerformance, getOverallStats } from "@/lib/adaptive-difficulty";
import { checkNewAchievements, getCustomContext, getProgressForAllSafe } from "@/lib/achievements";
import Link from "next/link";

export function DashboardStats() {
  const [tick, setTick] = useState(0);
  const [newAchievements, setNewAchievements] = useState<{ title: string; description: string }[]>([]);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    const newOnes = checkNewAchievements();
    if (newOnes.length > 0) {
      setNewAchievements(newOnes.map((a) => ({ title: a.title, description: a.description })));
      setTimeout(() => setNewAchievements([]), 5000);
    }
  }, [tick]);

  const state = getState();
  void tick;
  const overall = getOverallStats();
  const perf = getPerformance();
  const ctx = getCustomContext();
  const progress = getProgressForAllSafe();
  const earnedCount = progress.filter((p) => p.earned).length;

  const xpToNext = 100 - ((state.xp || 0) % 100);
  const level = state.level || 1;

  return (
    <div className="space-y-4">
      {newAchievements.length > 0 && (
        <div className="border border-[#c4f000]/40 bg-[#c4f000]/10 p-3 flex items-center gap-3">
          <div className="p-2 bg-[#c4f000]/20 border border-[#c4f000]/30">
            <Trophy className="h-4 w-4 text-[#c4f000]" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-[#c4f000]">
              achievement unlocked: {newAchievements[0]?.title}
            </div>
            <div className="text-xs text-zinc-400">{newAchievements[0]?.description}</div>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-[#c4f000]">
            <Link href="/achievements">view all</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-px bg-zinc-800/60 border border-zinc-800/60 grid-cols-2 sm:grid-cols-4">
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">level</div>
            <Zap className="h-3.5 w-3.5 text-[#c4f000]" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{level}</div>
          <div className="mt-2 h-1 bg-zinc-900">
            <div className="h-full bg-[#c4f000]" style={{ width: `${(state.xp || 0) % 100}%` }} />
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">{(state.xp || 0) % 100}/100 · {xpToNext} to next</div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">streak</div>
            <Flame className="h-3.5 w-3.5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{state.streak || 0}d</div>
          <div className="text-[10px] text-zinc-500 mt-2">best: {(state.longestStreak || 0)}d</div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">accuracy</div>
            <Target className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">
            {overall.totalAttempts > 0 ? Math.round(overall.overallAccuracy * 100) : 0}%
          </div>
          <div className="text-[10px] text-zinc-500 mt-2">{overall.totalCorrect}/{overall.totalAttempts} correct</div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">badges</div>
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{earnedCount}</div>
          <div className="text-[10px] text-zinc-500 mt-2">achievements earned</div>
        </div>
      </div>
    </div>
  );
}
