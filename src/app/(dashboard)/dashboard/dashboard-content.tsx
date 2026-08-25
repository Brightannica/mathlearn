"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckCircle2,
  Target,
  Zap,
  Star,
  Flame,
  TrendingUp,
  Award,
  Calendar,
  Trophy,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StreakDisplay } from "@/components/streak-display";
import { useDashboardData, useAchievements } from "@/hooks/use-supabase-data";
import { useDailyChallenge } from "@/hooks/use-daily-challenge";

const FALLBACK_RECENT_ACTIVITY = [
  { id: "1", title: "Completed: Linear Equations", description: "Lesson 3.2 - Solving for x", time: new Date(Date.now() - 7200000).toISOString(), status: "completed" },
  { id: "2", title: "Quiz: Quadratic Functions", description: "Scored 92% - Mastered!", time: new Date(Date.now() - 18000000).toISOString(), status: "completed" },
  { id: "3", title: "Practice Session", description: "Practiced factoring polynomials", time: new Date(Date.now() - 86400000).toISOString(), status: "in_progress" },
  { id: "4", title: "7-day streak achieved!", description: "Keep the momentum going", time: new Date(Date.now() - 86400000).toISOString(), status: "completed" },
  { id: "5", title: "Badge: Algebra Explorer", description: "Completed 10 algebra lessons", time: new Date(Date.now() - 172800000).toISOString(), status: "completed" },
];

const FALLBACK_SKILLS = [
  { name: "Linear Equations", mastery: 85, topic: "Algebra I", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: <Target className="h-4 w-4" /> },
  { name: "Quadratic Functions", mastery: 72, topic: "Algebra I", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: <Trophy className="h-4 w-4" /> },
  { name: "Geometry Basics", mastery: 91, topic: "Geometry", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: <BookOpen className="h-4 w-4" /> },
  { name: "Statistics & Probability", mastery: 45, topic: "Statistics", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: <TrendingUp className="h-4 w-4" /> },
];

const FALLBACK_ACHIEVEMENTS = [
  { name: "First Steps", description: "Complete your first lesson", icon: <Star className="h-4 w-4" />, earned: true, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { name: "Streak Master", description: "Maintain a 7-day streak", icon: <Flame className="h-4 w-4" />, earned: true, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  { name: "Algebra Expert", description: "Master all Algebra I topics", icon: <Award className="h-4 w-4" />, earned: false, progress: 65, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { name: "Problem Solver", description: "Complete 100 practice problems", icon: <Target className="h-4 w-4" />, earned: false, progress: 42, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
];

export default function DashboardContent() {
  const { stats, recentActivity } = useDashboardData();
  const { userAchievements } = useAchievements();
  const { challenge: dailyChallenge, completion: dailyCompletion, loading: dailyLoading, completing: dailyCompleting, completeChallenge } = useDailyChallenge();
  
  const levelInfo = {
    level: stats?.level || 7,
    progress: stats ? ((stats.totalXP % 500) / 500) * 100 : 36,
    nextXP: (stats?.level || 7) * 500,
    xpToNext: 500 - ((stats?.totalXP || 3180) % 500),
  };

  const streak = {
    currentStreak: stats?.currentStreak || 7,
    longestStreak: stats?.longestStreak || 12,
  };

  const activityItems = recentActivity.length > 0 ? recentActivity : FALLBACK_RECENT_ACTIVITY;
  const skillItems = FALLBACK_SKILLS;
  const achievementItems = userAchievements.length > 0
    ? userAchievements.map((ua) => ({
        name: ua.name,
        description: ua.description || "",
        icon: <Star className="h-4 w-4" />,
        earned: ua.user_progress?.completed || false,
        progress: ua.user_progress?.progress || 0,
        color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      }))
    : FALLBACK_ACHIEVEMENTS;

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 lg:flex-none">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Your learning hub and progress overview</p>
        </div>
        <StreakDisplay compact showFreeze={false} />
      </div>

      {/* Level Progress Banner */}
      <Card className="border border-primary/10 bg-gradient-to-r from-primary/5 to-amber-500/5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-base">
                {levelInfo.level}
              </div>
              <div>
                <p className="font-semibold text-sm">Level {levelInfo.level}</p>
                <p className="text-xs text-muted-foreground">{levelInfo.xpToNext} XP to next level</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{stats?.totalXP.toLocaleString() || "3,180"}</p>
              <p className="text-[11px] text-muted-foreground">Total XP</p>
            </div>
          </div>
          <Progress value={levelInfo.progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's XP" value={stats ? "+" + Math.floor((stats.totalXP % 150) + 50) : "120"} subtitle="Weekly Goal: 500" progress={stats ? Math.min(((stats.totalXP % 500) / 500) * 100, 100) : 24} color="from-amber-600 to-orange-600" />
        <StatCard title="Current Streak" value={`${streak.currentStreak} days`} subtitle={`Best: ${streak.longestStreak} days`} progress={Math.min(streak.currentStreak / Math.max(streak.longestStreak, 1) * 100, 100)} color="from-orange-600 to-red-600" />
        <StatCard title="Lessons Done" value={String(stats?.lessonsCompleted || 24)} subtitle="5 this week" progress={Math.min((stats?.lessonsCompleted || 24) * 3, 100)} color="from-emerald-600 to-teal-700" />
        <StatCard title="Accuracy" value="78%" subtitle="+12% improvement" progress={78} color="from-purple-600 to-indigo-700" />
      </div>

      {/* Daily Challenge */}
      <Card className="border-primary/10 bg-gradient-to-r from-primary/5 to-amber-500/5">
        <CardContent className="p-5">
          {dailyLoading ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading daily challenge...</p>
            </div>
          ) : !dailyChallenge ? (
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold text-sm">Daily Challenge</p>
                <p className="text-xs text-muted-foreground">No challenge available today</p>
              </div>
            </div>
          ) : dailyCompletion ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-semibold text-sm">Daily Challenge</p>
                  <p className="text-xs text-green-600 font-medium">Completed! +{dailyCompletion.xpEarned} XP</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">Daily Challenge</p>
                  <p className="text-xs text-muted-foreground">Exercise: {dailyChallenge.exercise_id ? dailyChallenge.exercise_id.slice(0, 8) : "N/A"} | XP Bonus: {dailyChallenge.xpBonus}</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => completeChallenge(dailyChallenge.id)}
                disabled={dailyCompleting}
              >
                {dailyCompleting ? "Completing..." : "Complete"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {activityItems.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3.5 rounded-lg border hover:border-primary/30 hover:bg-accent/30 transition-all">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", "bg-muted text-muted-foreground")}>
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm">{activity.title}</h3>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {new Date(activity.time).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="hover:shadow-md transition-shadow">
          <Card className="h-full">
            <StreakDisplay showFreeze={true} />
          </Card>
        </div>
      </div>

      {/* Skills & Achievements */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" />
              Skills Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillItems.map((skill, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", skill.color)}>
                      {skill.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{skill.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{skill.topic}</p>
                    </div>
                  </div>
                  <Badge variant={skill.mastery >= 80 ? "default" : "secondary"} className="text-[11px]">
                    {skill.mastery}%
                  </Badge>
                </div>
                <Progress value={skill.mastery / 100} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-primary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {achievementItems.slice(0, 4).map((achievement) => (
              <div key={achievement.name} className="flex items-start gap-3 p-3.5 rounded-lg border hover:border-primary/30 hover:bg-accent/30 transition-all">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", achievement.color)}>
                  {achievement.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm">{achievement.name}</h3>
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {achievement.earned ? "Earned" : "In Progress"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  {!achievement.earned && achievement.progress !== undefined && (
                    <div className="mt-1.5">
                      <Progress value={achievement.progress / 100} className="h-1" />
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{achievement.progress}% complete</p>
                    </div>
                  )}
                </div>
                {achievement.earned && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <ActionCard
              href="/learn"
              icon={<BookOpen className="h-4 w-4 text-amber-600" />}
              title="Explore Courses"
              description="Browse all available topics"
            />
            <ActionCard
              href="/practice"
              icon={<Target className="h-4 w-4 text-emerald-600" />}
              title="Start Practicing"
              description="Build mastery through repetition"
            />
            <ActionCard
              href="/visualizations"
              icon={<Zap className="h-4 w-4 text-purple-600" />}
              title="Interactive Tools"
              description="Explore math concepts visually"
            />
            <ActionCard
              href="/community"
              icon={<Award className="h-4 w-4 text-orange-600" />}
              title="Get Help"
              description="Ask questions in the community"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const StatCard = memo(function StatCard({
  title,
  value,
  subtitle,
  progress,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  progress?: number;
  color: string;
}) {
  return (
    <Card className="border-0 text-white overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${color}`} />
      <CardContent className="pt-5 pb-5 relative">
        <p className="text-[11px] font-medium opacity-90">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {subtitle && <p className="text-[11px] opacity-80 mt-0.5">{subtitle}</p>}
        {progress !== undefined && (
          <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
});
StatCard.displayName = "StatCard";

const ActionCard = memo(function ActionCard({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <Link href={href}>
      <Button variant="outline" className="w-full justify-start gap-2.5 h-auto py-3 hover:border-primary/50 transition-colors group">
        <div className="transition-transform group-hover:scale-105">{icon}</div>
        <div className="text-left">
          <p className="font-medium text-sm">{title}</p>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
        <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
      </Button>
    </Link>
  );
});
ActionCard.displayName = "ActionCard";
