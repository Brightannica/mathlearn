"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy, Award, Flame, Star, Zap, Target, Lock, CheckCircle2,
  Sparkles, BookOpen, Brain, Users, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getProgressForAllSafe, checkNewAchievements, Achievement,
} from "@/lib/achievements";

const rarityColor: Record<string, string> = {
  common: "from-zinc-400 to-zinc-500",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-amber-400 to-orange-500",
};

const rarityBorder: Record<string, string> = {
  common: "border-zinc-700",
  rare: "border-blue-500/30",
  epic: "border-purple-500/30",
  legendary: "border-amber-500/30",
};

const rarityText: Record<string, string> = {
  common: "text-zinc-300",
  rare: "text-blue-300",
  epic: "text-purple-300",
  legendary: "text-amber-300",
};

const categoryIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  problems: Target,
  streak: Flame,
  xp: Zap,
  topic: BookOpen,
  social: Users,
};

export default function AchievementsPage() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState<"all" | "earned" | "locked">("all");
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    const newOnes = checkNewAchievements();
    if (newOnes.length > 0) {
      newOnes.forEach((a) => {
        toast({
          title: `achievement unlocked: ${a.title}`,
          description: a.description,
        });
      });
    }
    setTick((t) => t + 1);
  }, [toast]);

  const all = getProgressForAllSafe();
  void tick;

  const earned = all.filter((a) => a.earned);
  const locked = all.filter((a) => !a.earned);
  const completionPct = Math.round((earned.length / all.length) * 100);

  const filtered = all.filter((a) => {
    if (filter === "earned" && !a.earned) return false;
    if (filter === "locked" && a.earned) return false;
    if (category !== "all" && a.achievement.category !== category) return false;
    return true;
  });

  const categories = [
    { id: "all", name: "all" },
    { id: "problems", name: "problems" },
    { id: "streak", name: "streaks" },
    { id: "xp", name: "xp" },
    { id: "topic", name: "topics" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// milestones</div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-7 w-7" />
            achievements
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">unlock badges as you progress. track your milestones.</p>
        </div>
      </div>

      <div className="grid gap-px bg-zinc-800/60 border border-zinc-800/60 grid-cols-3">
        <div className="bg-[#0d0d0d] p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">earned</div>
          <div className="text-2xl font-bold text-[#c4f000] mt-1">{earned.length}</div>
        </div>
        <div className="bg-[#0d0d0d] p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">total</div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{all.length}</div>
        </div>
        <div className="bg-[#0d0d0d] p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">completion</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{completionPct}%</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "earned", "locked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors",
                filter === f
                  ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                "px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors",
                category === c.id
                  ? "border-zinc-500 text-zinc-100"
                  : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(({ achievement, earned, progress }) => {
          const CatIcon = categoryIcon[achievement.category] || Trophy;
          const pct = Math.round((progress.current / progress.target) * 100);
          return (
            <div
              key={achievement.id}
              className={cn(
                "border bg-[#0d0d0d] p-5 transition-all relative overflow-hidden",
                earned ? rarityBorder[achievement.rarity] : "border-zinc-800/40",
                !earned && "opacity-60"
              )}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r" style={{
                background: earned ? `linear-gradient(to right, var(--tw-gradient-stops))` : "transparent",
              }}>
                <div className={cn("h-full bg-gradient-to-r", earned ? rarityColor[achievement.rarity] : "bg-zinc-800")} />
              </div>

              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  "w-12 h-12 flex items-center justify-center text-2xl border",
                  earned ? rarityBorder[achievement.rarity] : "border-zinc-800"
                )}>
                  {earned ? achievement.icon : <Lock className="h-4 w-4 text-zinc-600" />}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", rarityText[achievement.rarity])}>
                    {achievement.rarity}
                  </Badge>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                    <CatIcon className="h-2.5 w-2.5" />
                    {achievement.category}
                  </div>
                </div>
              </div>

              <h3 className={cn("font-semibold", earned ? "text-zinc-100" : "text-zinc-500")}>{achievement.title}</h3>
              <p className="text-xs text-zinc-500 mt-1">{achievement.description}</p>

              {!earned && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">progress</span>
                    <span className="text-zinc-400 font-mono">
                      {progress.current}/{progress.target}
                    </span>
                  </div>
                  <div className="h-1.5 bg-zinc-900">
                    <div className="h-full bg-[#c4f000] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}

              {earned && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-[#c4f000]">
                  <CheckCircle2 className="h-3 w-3" />
                  earned
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-12 text-center">
          <Trophy className="h-8 w-8 mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-500 text-sm">no achievements match those filters</p>
        </div>
      )}
    </div>
  );
}
