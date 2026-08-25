"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Zap, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadStreakData, recordActivity, StreakData } from "@/lib/streak";

interface StreakDisplayProps {
  compact?: boolean;
  showFreeze?: boolean;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function StreakDisplay({ compact = false, showFreeze = true }: StreakDisplayProps) {
  const [streak, setStreak] = useState<StreakData | null>(() => {
    if (typeof window === "undefined") return null;
    return recordActivity();
  });

  useEffect(() => {
    // Refresh streak data when window regains focus
    const handleFocus = () => {
      const data = loadStreakData();
      setStreak(data);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const getStreakMessage = () => {
    if (!streak) return "";
    if (streak.currentStreak === 0) return "Start your streak today!";
    if (streak.currentStreak < 3) return "Great start! Keep going!";
    if (streak.currentStreak < 7) return "You&apos;re on fire! 🔥";
    if (streak.currentStreak < 14) return "Amazing dedication! 🌟";
    if (streak.currentStreak < 30) return "Incredible discipline! 🏆";
    return "You&apos;re a math legend! 👑";
  };

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const isActive = streak?.activeDates.includes(dateStr) || false;
      const isToday = i === 0;
      days.push({
        name: DAY_NAMES[d.getDay()],
        active: isActive,
        today: isToday,
      });
    }
    return days;
  };

  if (!streak) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full">
          <Flame className={cn("h-5 w-5", streak.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground")} />
          <span className="font-bold text-orange-600 dark:text-orange-400">{streak.currentStreak}</span>
          <span className="text-xs text-orange-600/80 dark:text-orange-400/80">day streak</span>
        </div>
        {showFreeze && streak.streakFreezes > 0 && (
          <Badge variant="outline" className="gap-1">
            <Snowflake className="h-3 w-3 text-cyan-500" />
            {streak.streakFreezes}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full transition-all",
              streak.currentStreak > 0
                ? "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg"
                : "bg-muted text-muted-foreground"
            )}>
              <Flame className={cn("h-7 w-7", streak.currentStreak > 0 && "animate-pulse")} />
            </div>
            <div>
              <p className="text-3xl font-bold">{streak.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Best Streak</p>
            <p className="text-xl font-bold flex items-center gap-1 justify-end">
              <Trophy className="h-4 w-4 text-yellow-500" />
              {streak.longestStreak}
            </p>
          </div>
        </div>

        <p className="text-sm text-center text-muted-foreground italic">{getStreakMessage()}</p>

        <div className="flex items-center justify-between gap-1">
          {getWeekDays().map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">{day.name}</span>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                day.today && !day.active && "ring-2 ring-primary ring-offset-2",
                day.active
                  ? "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md"
                  : "bg-muted text-muted-foreground"
              )}>
                {day.active ? <Flame className="h-4 w-4" /> : ""}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">
              <span className="font-bold">{streak.totalDaysActive}</span>
              <span className="text-muted-foreground"> days active</span>
            </span>
          </div>
          {showFreeze && (
            <div className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-cyan-500" />
              <span className="text-sm">
                <span className="font-bold">{streak.streakFreezes}</span>
                <span className="text-muted-foreground"> freezes</span>
              </span>
            </div>
          )}
        </div>

        {showFreeze && streak.streakFreezes > 0 && streak.currentStreak > 0 && (
          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-3">
            <p className="text-xs text-cyan-700 dark:text-cyan-300">
              <Snowflake className="h-3 w-3 inline mr-1" />
              Use a streak freeze to protect your streak if you miss a day.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
