"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award, Flame, Star, Zap, Target, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { useAchievements } from "@/hooks/use-supabase-data";

const rarityColors: Record<string, string> = {
  common: "from-slate-400 to-slate-500",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-amber-400 to-orange-500",
};

const badges = [
  { name: "Geometry Guru", icon: Star, color: "bg-green-500" },
  { name: "Fraction Hero", icon: Target, color: "bg-blue-500" },
  { name: "Stats Whiz", icon: Award, color: "bg-purple-500" },
  { name: "Calc Crusher", icon: Zap, color: "bg-red-500" },
  { name: "Streak Star", icon: Flame, color: "bg-orange-500" },
  { name: "Quiz Champion", icon: Trophy, color: "bg-yellow-500" },
];

export default function AchievementsPage() {
  const { achievements, userAchievements, loading } = useAchievements();

  const earned = useMemo(() => achievements.filter((a) => userAchievements.some((ua) => ua.id === a.id && ua.completed)).length, [achievements, userAchievements]);

  const achievementsWithStatus = useMemo(() => achievements.map((a) => {
    const userAchievement = userAchievements.find((ua) => ua.id === a.id);
    return {
      id: a.id,
      name: a.name,
      desc: a.description || "",
      icon: a.icon,
      rarity: a.type === "STREAK" ? "rare" : a.type === "MASTERY" ? "epic" : "common",
      earned: userAchievement?.completed || false,
      progress: userAchievement?.progress || 0,
      date: userAchievement?.user_progress?.completed_at,
      color: a.color,
    };
  }), [achievements, userAchievements]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" /> Achievements
          </h1>
          <p className="text-muted-foreground mt-1">Earn badges as you learn and grow</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {earned}/{achievements.length} Unlocked
        </Badge>
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse flex items-center gap-3">
                  <div className="h-12 w-12 bg-muted rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-muted rounded" />
                    <div className="h-3 w-48 bg-muted rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!loading && (
        <Tabs defaultValue="achievements" className="w-full">
        <TabsList>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievementsWithStatus.map((a) => (
              <Card
                key={a.id}
                className={cn(
                  "relative overflow-hidden transition-all hover:shadow-lg",
                  !a.earned && "opacity-75"
                )}
              >
                <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", rarityColors[a.rarity])} />
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
                        rarityColors[a.rarity],
                        !a.earned && "grayscale"
                      )}
                    >
                       {a.earned ? <Trophy className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.desc}</p>
                      <Badge variant="outline" className="mt-1 capitalize text-[10px]">{a.rarity}</Badge>
                    </div>
                    {a.earned && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
                  </div>

                  {!a.earned && a.progress !== undefined && (
                    <div className="mt-4">
                      <Progress value={a.progress} className="h-2" />
                      <p className="mt-1 text-xs text-muted-foreground">{a.progress}% complete</p>
                    </div>
                  )}
                  {a.earned && a.date && (
                    <p className="mt-3 text-xs text-muted-foreground">Earned {a.date}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="badges">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((b) => (
              <Card key={b.name} className="overflow-hidden">
                <div className={cn("h-24 flex items-center justify-center", b.color)}>
                  <b.icon className="h-12 w-12 text-white" />
                </div>
                <CardContent className="pt-4 text-center">
                  <p className="font-semibold">{b.name}</p>
                  <Badge variant="secondary" className="mt-2">Equipped</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}
