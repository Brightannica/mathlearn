"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Zap, Trophy, PenLine, Settings, BookOpen, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useDashboardData, useUserProgress, useAchievements, useTopics } from "@/hooks/use-supabase-data";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { stats, recentActivity, loading: dashboardLoading } = useDashboardData();
  const { progress, loading: progressLoading } = useUserProgress();
  const { userAchievements } = useAchievements();
  const { topics, loading: topicsLoading } = useTopics();

  const displayName = session?.user?.name || "User";
  const userGrade = (stats as { grade?: string } | null)?.grade || "—";
  const memberSince = useMemo(() => {
    const createdAt = (session?.user as { createdAt?: string } | undefined)?.createdAt;
    if (!createdAt) return "—";
    return new Date(createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [session?.user]);

  const topicMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of topics) {
      map[t.id] = t.name;
    }
    return map;
  }, [topics]);

  const skills = useMemo(() => {
    if (progressLoading || !progress.length) return [];
    const seen = new Set<string>();
    const result: { name: string; mastery: number }[] = [];
    for (const p of progress) {
      if (p.topicId && !seen.has(p.topicId)) {
        seen.add(p.topicId);
        result.push({
          name: topicMap[p.topicId] ?? p.topicId,
          mastery: Math.round(p.mastery),
        });
      }
    }
    return result;
  }, [progress, progressLoading, topicMap]);

  const activity = useMemo(() => {
    if (dashboardLoading || !recentActivity.length) return [];
    return recentActivity.map((a) => {
      const date = new Date(a.time);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const xpMatch = a.description.match(/(\d+)\s*xp/i);
      const xp = xpMatch ? parseInt(xpMatch[1], 10) : 0;
      return {
        date: dateStr,
        text: `${a.title}${a.description ? ` — ${a.description}` : ""}`,
        xp,
      };
    });
  }, [recentActivity, dashboardLoading]);

  const earnedBadges = useMemo(
    () => userAchievements.filter((a) => a.completed),
    [userAchievements]
  );

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-purple-600" />
        <CardContent className="-mt-12 pt-0">
          <div className="flex flex-col sm:flex-row sm: text-center sm:items-end gap-4">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">A</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left sm:pb-2 sm:text-center sm:items-end">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <p className="text-muted-foreground">Grade {userGrade} • Joined {memberSince}</p>
              <div className="flex gap-2 mt-2">
                {earnedBadges.length > 0
                  ? earnedBadges.slice(0, 2).map((b) => (
                      <Badge key={b.id} variant="secondary">{b.name}</Badge>
                    ))
                  : (
                    <>
                      <Badge variant="secondary">Algebra Explorer</Badge>
                      <Badge variant="secondary">Streak Starter</Badge>
                    </>
                  )}
              </div>
            </div>
            <div className="flex gap-2 pb-2">
              <Button variant="outline" size="sm" asChild><a href="/profile/edit"><PenLine className="h-4 w-4 mr-2" />Edit</a></Button>
              <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2" />Settings</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {dashboardLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-muted p-3 text-center animate-pulse">
                    <div className="h-5 w-5 mx-auto bg-muted-foreground/20 rounded mb-1" />
                    <div className="h-6 w-16 mx-auto bg-muted-foreground/20 rounded mb-1" />
                    <div className="h-3 w-12 mx-auto bg-muted-foreground/20 rounded" />
                  </div>
                ))
              : stats && (
                <>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <Zap className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="font-bold text-lg">{stats.totalXP.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <Flame className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="font-bold text-lg">{stats.currentStreak} days</p>
                    <p className="text-xs text-muted-foreground">Streak</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <Trophy className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="font-bold text-lg">#{stats.level}</p>
                    <p className="text-xs text-muted-foreground">Rank</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <BookOpen className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="font-bold text-lg">{stats.lessonsCompleted}</p>
                    <p className="text-xs text-muted-foreground">Lessons</p>
                  </div>
                </>
              )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-3">
          {progressLoading || topicsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 w-32 bg-muted-foreground/20 rounded animate-pulse" />
                    <div className="h-5 w-10 bg-muted-foreground/20 rounded animate-pulse" />
                  </div>
                  <div className="h-2 w-full bg-muted-foreground/20 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : skills.length > 0 ? (
            skills.map((s) => (
              <Card key={s.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{s.name}</span>
                    <Badge variant={s.mastery >= 70 ? "default" : "secondary"}>{s.mastery}%</Badge>
                  </div>
                  <Progress value={s.mastery} />
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No skills data yet. Start learning to track your progress!
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-2">
          {dashboardLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-4 flex items-center gap-4">
                  <div className="w-16 h-3 bg-muted-foreground/20 rounded animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-48 bg-muted-foreground/20 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-muted-foreground/20 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : activity.length > 0 ? (
            activity.map((a, i) => (
              <Card key={i}>
                <CardContent className="pt-4 flex items-center gap-4">
                  <div className="w-16 text-xs text-muted-foreground shrink-0">{a.date}</div>
                  <div className="flex-1 text-sm">{a.text}</div>
                  {a.xp > 0 && <Badge variant="secondary" className="gap-1"><Star className="h-3 w-3" />{a.xp}</Badge>}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-4 text-center text-muted-foreground">
                No recent activity yet. Start learning to see your activity here!
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
