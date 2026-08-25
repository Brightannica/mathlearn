"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Flame,
  Trophy,
  Snowflake,
  Zap,
  Calendar,
  Target,
  BookOpen,
  Info,
  CheckCircle2 as CheckCircle,
} from "lucide-react";
import { StreakDisplay } from "@/components/streak-display";
import { StreakData, loadStreakData } from "@/lib/streak";
import { cn } from "@/lib/utils";
import Link from "next/link";

const streakMilestones = [
  { days: 1, title: "First Step", description: "Complete your first day of learning", icon: "👣", xp: 50 },
  { days: 3, title: "Getting Started", description: "3 days in a row", icon: "🌱", xp: 150 },
  { days: 7, title: "Week Warrior", description: "A full week of learning", icon: "🔥", xp: 500 },
  { days: 14, title: "Fortnight", description: "Two weeks of consistency", icon: "⭐", xp: 1000 },
  { days: 30, title: "Monthly Master", description: "A full month of dedication", icon: "🏆", xp: 3000 },
  { days: 60, title: "Unstoppable", description: "Two months straight", icon: "💪", xp: 6000 },
  { days: 100, title: "Centurion", description: "100 days of learning", icon: "👑", xp: 10000 },
];

const streakTips = [
  { title: "Practice Daily", description: "Even 10 minutes counts toward your streak", icon: Target },
  { title: "Set Reminders", description: "Enable notifications to never forget", icon: Calendar },
  { title: "Use Freezes Wisely", description: "Save freezes for when you really need them", icon: Snowflake },
  { title: "Review Often", description: "Spaced review strengthens your memory", icon: BookOpen },
];

function buildCalendarDays(activeDates: string[]): { date: Date; dateStr: string; day: number; isToday: boolean; active: boolean; xp: number }[] {
  const days: { date: Date; dateStr: string; day: number; isToday: boolean; active: boolean; xp: number }[] = [];
  const today = new Date();
  const activeSet = new Set(activeDates);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const active = activeSet.has(dateStr);
    days.push({
      date: d,
      dateStr,
      day: d.getDate(),
      isToday: i === 0,
      active,
      xp: active ? 20 + (i % 5) * 15 : 0,
    });
  }
  return days;
}

export default function StreaksPage() {
  const [streakData] = useState<StreakData | null>(() => loadStreakData());
  const activeDates = useMemo(() => streakData?.activeDates || [], [streakData]);
  const calendarDays = useMemo(() => buildCalendarDays(activeDates), [activeDates]);

  if (!streakData) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No streak data yet. Complete your first activity to start tracking!
          </CardContent>
        </Card>
      </div>
    );
  }

  const monthDays = calendarDays;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Flame className="h-6 w-6 text-primary" />
            Streaks
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Track your daily learning streak and stay motivated</p>
        </div>
        <StreakDisplay compact showFreeze={false} />
      </div>

      <Card className="border border-primary/10 bg-gradient-to-r from-primary/5 to-orange-500/5 overflow-hidden">
        <CardContent className="p-6 text-center relative">
          <div className="relative">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Flame className="h-8 w-8" />
              </div>
              <div className="text-left">
                <p className="text-4xl font-bold">{streakData.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
            <p className="text-base font-medium text-foreground mb-2">
              {streakData.currentStreak === 0 ? "Start your streak today!" :
               streakData.currentStreak < 3 ? "Great start! Keep going!" :
               streakData.currentStreak < 7 ? "You're on fire! 🔥" :
               streakData.currentStreak < 14 ? "Amazing dedication! 🌟" :
               streakData.currentStreak < 30 ? "Incredible discipline! 🏆" :
               "You're a math legend! 👑"}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Best: {streakData.longestStreak} days
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/5">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{streakData.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Current Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{streakData.longestStreak}</p>
                <p className="text-xs text-muted-foreground">Best Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{streakData.totalDaysActive}</p>
                <p className="text-xs text-muted-foreground">Total Days Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-500/10 to-teal-500/5">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3">
              <Snowflake className="h-8 w-8 text-cyan-500" />
              <div>
                <p className="text-2xl font-bold">{streakData.streakFreezes}</p>
                <p className="text-xs text-muted-foreground">Streak Freezes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Activity Calendar
              </CardTitle>
              <CardDescription>Your learning activity over the past 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                {monthDays.map((day, i) => (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all hover:shadow-md",
                      day.isToday && "ring-2 ring-primary ring-offset-2",
                      day.active
                        ? "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <span className="font-medium">{day.day}</span>
                    {day.xp > 0 && <span className="text-[10px] opacity-80">+{day.xp}</span>}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-gradient-to-br from-orange-400 to-red-500" />
                  <span className="text-muted-foreground">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-muted" />
                  <span className="text-muted-foreground">Inactive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded ring-2 ring-primary ring-offset-1" />
                  <span className="text-muted-foreground">Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Streak Milestones
              </CardTitle>
              <CardDescription>Earn XP and badges as you maintain your streak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {streakMilestones.map((milestone, i) => {
                  const achieved = streakData.currentStreak >= milestone.days;
                  const isCurrent = streakData.currentStreak >= milestone.days && streakData.currentStreak < (streakMilestones[i + 1]?.days || Infinity);

                  return (
                    <div
                      key={milestone.days}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border transition-all",
                        achieved ? "bg-primary/5 border-primary/20" : "bg-muted/50 opacity-75"
                      )}
                    >
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl",
                        achieved ? "bg-primary/10" : "bg-muted"
                      )}>
                        {achieved ? milestone.icon : "🔒"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{milestone.title}</h3>
                          {achieved && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Achieved
                            </Badge>
                          )}
                          {isCurrent && (
                            <Badge variant="secondary" className="text-xs">Current Goal</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-muted-foreground">+{milestone.xp} XP</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{milestone.days}</p>
                        <p className="text-xs text-muted-foreground">days</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {streakTips.map((tip, i) => {
              const IconComponent = tip.icon;
              return (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{tip.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 flex items-start gap-4">
              <Info className="h-6 w-6 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">How Streaks Work</h3>
                <p className="text-sm text-muted-foreground">
                  Your streak increases each day you complete at least one learning activity (lesson, practice, or quiz).
                  If you miss a day, your streak resets to zero unless you have a streak freeze available.
                  Streak freezes can be earned through achievements or purchased to protect your progress.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Keep Your Streak Going</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button asChild className="h-auto py-4">
              <Link href="/learn">
                <BookOpen className="mr-2 h-4 w-4" />
                Continue Learning
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4">
              <Link href="/practice">
                <Target className="mr-2 h-4 w-4" />
                Practice Now
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4">
              <Link href="/achievements">
                <Trophy className="mr-2 h-4 w-4" />
                View Achievements
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
