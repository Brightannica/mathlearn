"use client";

import { useState } from "react";
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
import { useDashboardData } from "@/hooks/use-supabase-data";
import dynamic from "next/dynamic";

const FALLBACK_WEEKLY = [
  { week: "W1", xp: 320, lessons: 3 },
  { week: "W2", xp: 450, lessons: 5 },
  { week: "W3", xp: 380, lessons: 4 },
  { week: "W4", xp: 520, lessons: 6 },
  { week: "W5", xp: 610, lessons: 7 },
  { week: "W6", xp: 480, lessons: 5 },
  { week: "W7", xp: 720, lessons: 8 },
];

const FALLBACK_MASTERY = [
  { topic: "Algebra", mastery: 85 },
  { topic: "Geometry", mastery: 72 },
  { topic: "Statistics", mastery: 45 },
  { topic: "Calculus", mastery: 30 },
];

const FALLBACK_SKILLS = [
  { name: "Linear Equations", mastery: 90, trend: "+5%" },
  { name: "Quadratic Functions", mastery: 75, trend: "+12%" },
  { name: "Geometry Basics", mastery: 88, trend: "+3%" },
  { name: "Statistics", mastery: 42, trend: "+18%" },
  { name: "Fractions", mastery: 95, trend: "+2%" },
  { name: "Exponents", mastery: 68, trend: "+8%" },
];

const DynamicCharts = dynamic(() => import("./charts"), { ssr: false, loading: () => <div>Loading charts...</div> });

export default function ProgressPage() {
  const { stats, loading } = useDashboardData();
  const [streakData] = useState<StreakData | null>(() => loadStreakData());
  const weeklyData = FALLBACK_WEEKLY;
  const topicMastery = FALLBACK_MASTERY;
  const difficultyBreakdown = [
    { name: "Easy", value: 45, color: "#22c55e" },
    { name: "Medium", value: 35, color: "#f59e0b" },
    { name: "Hard", value: 20, color: "#ef4444" },
  ];
  const skills = FALLBACK_SKILLS;

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
        {/* Charts - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          <DynamicCharts weeklyData={weeklyData} topicMastery={topicMastery} difficultyBreakdown={difficultyBreakdown} skills={skills} streakData={streakData} />
        </div>

        {/* Streak - 1 col */}
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
