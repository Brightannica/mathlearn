"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Flame,
  Target,
  Award,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import { loadStreakData, StreakData } from "@/lib/streak";
import { StreakDisplay } from "@/components/streak-display";
import { useDashboardData, useUserProgress, useTopics } from "@/hooks/use-supabase-data";
import dynamic from "next/dynamic";

const DynamicCharts = dynamic(() => import("./charts"), { ssr: false, loading: () => <div>Loading charts...</div> });

function buildWeeklyData(stats: { totalXP: number; lessonsCompleted: number } | null): { week: string; xp: number; lessons: number }[] {
  if (!stats) {
    return [
      { week: "W1", xp: 320, lessons: 3 },
      { week: "W2", xp: 450, lessons: 5 },
      { week: "W3", xp: 380, lessons: 4 },
      { week: "W4", xp: 520, lessons: 6 },
      { week: "W5", xp: 610, lessons: 7 },
      { week: "W6", xp: 480, lessons: 5 },
      { week: "W7", xp: 720, lessons: 8 },
    ];
  }

  const totalXP = stats.totalXP || 0;
  const totalLessons = stats.lessonsCompleted || 0;
  const weeks = 7;
  const avgXP = Math.round(totalXP / weeks);
  const avgLessons = Math.round(totalLessons / weeks);

  return Array.from({ length: weeks }, (_, i) => ({
    week: `W${i + 1}`,
    xp: Math.max(100, avgXP + Math.round((Math.random() - 0.5) * avgXP * 0.6)),
    lessons: Math.max(1, avgLessons + Math.round((Math.random() - 0.5) * avgLessons * 0.6)),
  }));
}

export default function ProgressPage() {
  const { stats, loading } = useDashboardData();
  const { progress, loading: progressLoading } = useUserProgress();
  const { topics } = useTopics();
  const [streakData] = useState<StreakData | null>(() => loadStreakData());

  const topicMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of topics) {
      map[t.id] = t.name;
    }
    return map;
  }, [topics]);

  const weeklyData = useMemo(() => buildWeeklyData(stats), [stats]);

  const topicMastery = useMemo(() => {
    if (progressLoading || !progress.length) {
      return [
        { topic: "Algebra", mastery: 85 },
        { topic: "Geometry", mastery: 72 },
        { topic: "Statistics", mastery: 45 },
        { topic: "Calculus", mastery: 30 },
      ];
    }

    const masteryMap = new Map<string, number[]>();
    for (const p of progress) {
      if (p.topicId) {
        const arr = masteryMap.get(p.topicId) || [];
        arr.push(p.mastery);
        masteryMap.set(p.topicId, arr);
      }
    }

    return Array.from(masteryMap.entries()).map(([topicId, masteryList]) => ({
      topic: topicMap[topicId] || topicId,
      mastery: Math.round(masteryList.reduce((a, b) => a + b, 0) / masteryList.length),
    }));
  }, [progress, progressLoading, topicMap]);

  const skills = useMemo(() => {
    if (progressLoading || !progress.length) {
      return [
        { name: "Linear Equations", mastery: 90, trend: "+5%" },
        { name: "Quadratic Functions", mastery: 75, trend: "+12%" },
        { name: "Geometry Basics", mastery: 88, trend: "+3%" },
        { name: "Statistics", mastery: 42, trend: "+18%" },
        { name: "Fractions", mastery: 95, trend: "+2%" },
        { name: "Exponents", mastery: 68, trend: "+8%" },
      ];
    }

    const seen = new Set<string>();
    const result: { name: string; mastery: number; trend: string }[] = [];
    for (const p of progress) {
      if (p.topicId && !seen.has(p.topicId)) {
        seen.add(p.topicId);
        result.push({
          name: topicMap[p.topicId] || p.topicId,
          mastery: Math.round(p.mastery),
          trend: p.mastery >= 80 ? "+5%" : p.mastery >= 50 ? "+12%" : "+18%",
        });
      }
    }
    return result;
  }, [progress, progressLoading, topicMap]);

  const difficultyBreakdown = useMemo(() => {
    if (!skills.length) {
      return [
        { name: "Easy", value: 45, color: "#22c55e" },
        { name: "Medium", value: 35, color: "#f59e0b" },
        { name: "Hard", value: 20, color: "#ef4444" },
      ];
    }

    const high = skills.filter(s => s.mastery >= 80).length;
    const mid = skills.filter(s => s.mastery >= 50 && s.mastery < 80).length;
    const low = skills.filter(s => s.mastery < 50).length;
    const total = skills.length || 1;

    return [
      { name: "Easy", value: Math.round((high / total) * 100), color: "#22c55e" },
      { name: "Medium", value: Math.round((mid / total) * 100), color: "#f59e0b" },
      { name: "Hard", value: Math.round((low / total) * 100), color: "#ef4444" },
    ];
  }, [skills]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Progress
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Track mastery, streaks, and growth over time</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <CalendarDays className="mr-2 h-4 w-4" />
            Past 30 days
          </Button>
        </div>
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-8 w-20 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total XP" value={(stats?.totalXP || 3180).toLocaleString()} icon={<TrendingUp className="h-5 w-5" />} trend="+720 this week" color="bg-primary/10 text-primary" />
        <StatCard
          title="Current Streak"
          value={`${streakData?.currentStreak ?? stats?.currentStreak ?? 0} days`}
          icon={<Flame className="h-5 w-5" />}
          trend={`Best: ${streakData?.longestStreak ?? stats?.longestStreak ?? 0} days`}
          color="bg-orange-500/10 text-orange-500"
        />
        <StatCard title="Lessons Done" value={String(stats?.lessonsCompleted || 24)} icon={<Target className="h-5 w-5" />} trend="+3 this week" color="bg-green-500/10 text-green-500" />
        <StatCard title="Accuracy" value="87%" icon={<Award className="h-5 w-5" />} trend="+5% from last" color="bg-purple-500/10 text-purple-500" />
        </div>
      )}
      {!loading && (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <DynamicCharts weeklyData={weeklyData} topicMastery={topicMastery} difficultyBreakdown={difficultyBreakdown} skills={skills} streakData={streakData} />
        </div>

        <div>
          <StreakDisplay showFreeze={true} />
        </div>
      </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: { title: string; value: string; icon: React.ReactNode; trend?: string; color: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && <p className="text-xs text-green-600 dark:text-green-400">{trend}</p>}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
