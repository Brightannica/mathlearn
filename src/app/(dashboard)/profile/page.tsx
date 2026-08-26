"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Flame, Zap, Trophy, Settings, BookOpen, Star, Calendar, Hash, Code2, ChevronRight, Edit, LogOut, Award } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getState, subscribe, isSolved, getCourseProgress } from "@/lib/local-state";
import { getAllCourses } from "@/lib/courses";
import { getProblems } from "@/lib/problems";

function CalendarHeatmap({ activeDates }: { activeDates: string[] }) {
  const today = new Date();
  const days = useMemo(() => {
    const result: { date: string; active: boolean; isToday: boolean }[] = [];
    const set = new Set(activeDates);
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      result.push({
        date: dateStr,
        active: set.has(dateStr),
        isToday: i === 0,
      });
    }
    return result;
  }, [activeDates]);

  return (
    <div>
      <div className="grid grid-cols-[repeat(45,1fr)] gap-1">
        {days.map((d) => (
          <div
            key={d.date}
            title={d.date}
            className={cn(
              "aspect-square",
              d.active ? "bg-[#c4f000]" : "bg-zinc-900",
              d.isToday && "ring-1 ring-[#c4f000] ring-offset-1 ring-offset-[#0d0d0d]"
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mt-3 text-[10px] text-zinc-600 font-mono">
        <span>90 days ago</span>
        <div className="flex items-center gap-1">
          <span>less</span>
          <div className="w-3 h-3 bg-zinc-900" />
          <div className="w-3 h-3 bg-zinc-800" />
          <div className="w-3 h-3 bg-[#c4f000]/40" />
          <div className="w-3 h-3 bg-[#c4f000]" />
          <span>more</span>
        </div>
        <span>today</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [tick, setTick] = useState(0);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  const state = getState();
  void tick;
  const courses = getAllCourses();
  const problems = getProblems();
  const solvedCount = problems.filter((p) => isSolved(p.slug)).length;

  const displayName = session?.user?.name || "You";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image;
  const memberSince = useMemo(() => {
    const createdAt = (session?.user as { createdAt?: string } | undefined)?.createdAt;
    if (!createdAt) return "—";
    return new Date(createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [session?.user]);

  const levelXp = (state.xp || 0) % 100;
  const xpToNext = 100 - levelXp;

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl">
      {/* Header card */}
      <div className="border border-zinc-800/60 bg-[#0d0d0d] overflow-hidden">
        <div className="h-24 bg-[radial-gradient(circle_at_30%_50%,rgba(196,240,0,0.10),transparent_70%)]" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <Avatar className="h-20 w-20 border-4 border-[#0d0d0d]">
              {userImage ? <AvatarImage src={userImage} /> : <AvatarFallback className="bg-zinc-800 text-zinc-200 text-2xl font-bold">{displayName[0]?.toUpperCase()}</AvatarFallback>}
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <p className="text-sm text-zinc-500">{userEmail || "no email"} · joined {memberSince}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="border-[#c4f000]/30 text-[#c4f000]">
                  <Trophy className="h-3 w-3 mr-1" /> level {state.level || 1}
                </Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                  <Flame className="h-3 w-3 mr-1" /> {state.streak || 0} day streak
                </Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                  <Star className="h-3 w-3 mr-1" /> {(state.xp || 0).toLocaleString()} XP
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900">
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-2" /> settings
                </Link>
              </Button>
              <Button onClick={handleSignOut} variant="ghost" disabled={signingOut} className="text-zinc-500 hover:text-rose-400">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-px bg-zinc-800/60 border border-zinc-800/60 grid-cols-2 sm:grid-cols-4">
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-3.5 w-3.5 text-[#c4f000]" />
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">XP</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{(state.xp || 0).toLocaleString()}</div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">streak</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{state.streak || 0}d</div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center gap-2 mb-1">
            <Code2 className="h-3.5 w-3.5 text-sky-400" />
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">problems</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{solvedCount}/{problems.length}</div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">lessons</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{state.completedLessons?.length || 0}</div>
        </div>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="bg-zinc-900/40 border border-zinc-800/60 p-1">
          <TabsTrigger value="activity" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">activity</TabsTrigger>
          <TabsTrigger value="courses" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">courses</TabsTrigger>
          <TabsTrigger value="problems" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">problems</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4 mt-4">
          {/* Level progress */}
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">// level {state.level || 1}</div>
                <h3 className="font-semibold mt-1">level progress</h3>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono text-zinc-100">{levelXp}/100</div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{xpToNext} XP to next</div>
              </div>
            </div>
            <div className="h-2 bg-zinc-900">
              <div className="h-full bg-[#c4f000] transition-all" style={{ width: `${levelXp}%` }} />
            </div>
          </div>

          {/* Activity heatmap */}
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">// last 90 days</div>
                <h3 className="font-semibold mt-1">activity map</h3>
              </div>
              <div className="text-right text-sm">
                <span className="text-zinc-100 font-mono">{state.activeDates?.length || 0}</span>
                <span className="text-zinc-500 ml-1">active days</span>
              </div>
            </div>
            <CalendarHeatmap activeDates={state.activeDates || []} />
          </div>

          {/* Recent activity */}
          <div className="border border-zinc-800/60 bg-[#0d0d0d]">
            <div className="p-4 border-b border-zinc-800/60">
              <h3 className="font-semibold text-sm">recent achievements</h3>
            </div>
            <div className="divide-y divide-zinc-800/40">
              {state.solved?.slice(-5).reverse().map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-8 h-8 border border-[#c4f000]/30 bg-[#c4f000]/5 flex items-center justify-center">
                    <Code2 className="h-3.5 w-3.5 text-[#c4f000]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{s.slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</p>
                    <p className="text-xs text-zinc-500">solved · {s.attempts} attempt{s.attempts !== 1 ? "s" : ""}</p>
                  </div>
                  <Badge variant="outline" className="border-[#c4f000]/30 text-[#c4f000] text-[10px]">
                    <Zap className="h-3 w-3 mr-1" /> +{s.xp}
                  </Badge>
                </div>
              ))}
              {(!state.solved || state.solved.length === 0) && (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  <Award className="h-8 w-8 mx-auto text-zinc-700 mb-2" />
                  no activity yet. start solving problems to see your progress.
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-3 mt-4">
          {courses.map((course) => {
            const lessons = course.units.flatMap((u) => u.lessons);
            const progress = getCourseProgress(course.slug, lessons.length);
            return (
              <Link key={course.id} href={`/learn/${course.slug}`} className="block">
                <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4 hover:border-zinc-700 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 flex items-center justify-center text-xl font-bold border-2 shrink-0"
                      style={{ borderColor: course.color, color: course.color }}
                    >
                      {course.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-semibold group-hover:text-[#c4f000] transition-colors">{course.title}</h3>
                        <span className="text-[10px] text-zinc-600 font-mono">{progress}%</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 mb-2">
                        <span className="capitalize">{course.subject}</span>
                        <span>·</span>
                        <span>{lessons.length} lessons</span>
                      </div>
                      <div className="h-1.5 bg-zinc-900">
                        <div className="h-full transition-all" style={{ width: `${progress}%`, backgroundColor: course.color }} />
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-[#c4f000] transition-colors shrink-0" />
                  </div>
                </div>
              </Link>
            );
          })}
        </TabsContent>

        <TabsContent value="problems" className="space-y-2 mt-4">
          {(["easy", "medium", "hard"] as const).map((diff) => {
            const diffProblems = problems.filter((p) => p.difficulty === diff);
            const solved = diffProblems.filter((p) => isSolved(p.slug)).length;
            return (
              <div key={diff} className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2",
                      diff === "easy" ? "bg-emerald-500" : diff === "medium" ? "bg-amber-500" : "bg-rose-500"
                    )} />
                    <h3 className="font-semibold capitalize">{diff}</h3>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">{solved}/{diffProblems.length}</span>
                </div>
                <div className="h-1 bg-zinc-900">
                  <div
                    className={cn("h-full transition-all",
                      diff === "easy" ? "bg-emerald-500" : diff === "medium" ? "bg-amber-500" : "bg-rose-500"
                    )}
                    style={{ width: `${diffProblems.length ? (solved / diffProblems.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
          <div className="text-center pt-2">
            <Button asChild variant="outline" className="border-zinc-800 hover:border-[#c4f000]">
              <Link href="/solve">open problem set <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AvatarImage({ src }: { src: string }) {
  return <img src={src} alt="" className="aspect-square h-full w-full object-cover" />;
}
