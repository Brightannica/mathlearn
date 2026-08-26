"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Flame, Trophy, Zap, Crown, Medal, Search, ChevronRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { getState, subscribe } from "@/lib/local-state";

type Student = {
  rank: number;
  id: string;
  name: string;
  grade: string;
  xp: number;
  streak: number;
  weeklyXP: number;
  isYou: boolean;
};

const MOCK_NAMES = [
  "Emma W.", "Liam C.", "Sofia M.", "Noah B.", "Ava P.", "Oliver H.", "Mia S.",
  "James K.", "Charlotte L.", "Benjamin T.", "Amelia R.", "Lucas G.", "Harper J.",
  "Ethan D.", "Evelyn S.", "Alexander M.", "Abigail F.", "Daniel P.", "Emily H.", "Matthew N.",
  "Elizabeth K.", "Jackson B.", "Sofia L.", "David W.", "Avery R.", "Joseph T.", "Ella M.",
  "Samuel C.", "Scarlett G.", "Henry F.", "Grace P.", "Owen H.", "Chloe B.", "Wyatt D.",
];

const GRADES = ["5", "6", "7", "8", "9", "10", "11", "12"];

function generateMockLeaderboard(currentUserXp: number, currentUserName: string): Student[] {
  // Seed based on day so it's stable per day
  const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const rng = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };
  const students: Student[] = [];
  for (let i = 0; i < MOCK_NAMES.length; i++) {
    const xp = Math.floor(rng(i) * 6000) + 500;
    students.push({
      rank: 0,
      id: `mock-${i}`,
      name: MOCK_NAMES[i],
      grade: GRADES[Math.floor(rng(i + 100) * GRADES.length)],
      xp,
      streak: Math.floor(rng(i + 200) * 25) + 1,
      weeklyXP: Math.floor(rng(i + 300) * 500) + 50,
      isYou: false,
    });
  }
  students.push({
    rank: 0,
    id: "you",
    name: currentUserName,
    grade: "9",
    xp: currentUserXp,
    streak: 0,
    weeklyXP: 0,
    isYou: true,
  });
  students.sort((a, b) => b.xp - a.xp);
  students.forEach((s, i) => (s.rank = i + 1));
  return students;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"global" | "weekly">("global");
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [tick, setTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  const state = getState();
  void tick;

  const userName = session?.user?.name || "You";
  const userXp = state.xp || 3180;

  const students = useMemo(() => generateMockLeaderboard(userXp, userName), [userXp, userName]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const sorted = useMemo(() => {
    const base = tab === "global" ? [...students].sort((a, b) => b.xp - a.xp) : [...students].sort((a, b) => b.weeklyXP - a.weeklyXP);
    return base.filter((s) => {
      if (gradeFilter !== "all" && s.grade !== gradeFilter) return false;
      if (search.trim() && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [students, tab, gradeFilter, search]);

  const top3 = sorted.slice(0, 3);
  const you = sorted.find((s) => s.isYou);
  const youRank = you?.rank;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// rankings</div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-7 w-7" />
            leaderboard
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">see how you stack up. climb the ranks.</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} className="border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900">
          <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
          refresh
        </Button>
      </div>

      {you && (
        <div className="border border-[#c4f000]/40 bg-[#c4f000]/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c4f000] flex items-center justify-center text-black font-bold">
              #{youRank}
            </div>
            <div>
              <div className="font-semibold">your rank</div>
              <div className="text-xs text-zinc-500">keep practicing to climb higher</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#c4f000] font-mono">{userXp.toLocaleString()}</div>
            <div className="text-xs text-zinc-500">XP</div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search..."
            className="pl-9 bg-[#0d0d0d] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
          />
        </div>
        <div className="flex gap-1.5">
          {(["global", "weekly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors",
                tab === t
                  ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="px-3 py-1.5 bg-[#0d0d0d] border border-zinc-800 text-zinc-100 text-sm focus:border-[#c4f000] focus:outline-none"
        >
          <option value="all">all grades</option>
          {GRADES.map((g) => <option key={g} value={g}>grade {g}</option>)}
        </select>
      </div>

      {top3.length === 3 && (
        <div className="grid grid-cols-3 gap-px bg-zinc-800/60 border border-zinc-800/60">
          {[
            { student: top3[1], icon: Medal, iconColor: "text-zinc-400" },
            { student: top3[0], icon: Crown, iconColor: "text-yellow-400" },
            { student: top3[2], icon: Medal, iconColor: "text-amber-700" },
          ].map(({ student, icon: Icon, iconColor }, displayIdx) => {
            const ranks = [2, 1, 3];
            const rank = ranks[displayIdx];
            const isFirst = rank === 1;
            return (
              <div key={student.id} className="bg-[#0d0d0d] p-5 relative">
                <Icon className={cn("h-6 w-6 absolute top-3 right-3", iconColor)} />
                <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">// rank {rank}</div>
                <div className="flex flex-col items-center mt-3">
                  <div className="relative">
                    <Avatar className={cn("h-16 w-16", isFirst && "ring-2 ring-[#c4f000] ring-offset-2 ring-offset-[#0d0d0d]")}>
                      <AvatarFallback className="bg-zinc-800 text-zinc-200 font-semibold text-lg">{student.name[0]}</AvatarFallback>
                    </Avatar>
                    {isFirst && (
                      <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 h-5 w-5 text-[#c4f000]" />
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <div className={cn("font-semibold", isFirst && "text-[#c4f000]")}>{student.name}</div>
                    <Badge variant="outline" className="text-[10px] mt-1 border-zinc-700 text-zinc-400">grade {student.grade}</Badge>
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-2xl font-bold text-zinc-100 font-mono">
                      {tab === "global" ? student.xp.toLocaleString() : student.weeklyXP.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">{tab === "global" ? "total XP" : "this week"}</div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-orange-400">
                    <Flame className="h-3 w-3" />
                    <span className="font-mono">{student.streak}d</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="border border-zinc-800/60 bg-[#0d0d0d]">
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
          <h3 className="font-semibold text-sm">{tab === "global" ? "all-time" : "this week"}</h3>
          <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">{sorted.length} shown</span>
        </div>
        <div className="divide-y divide-zinc-800/40 max-h-[600px] overflow-y-auto">
          {sorted.map((s) => (
            <div
              key={s.id}
              className={cn(
                "flex items-center gap-4 p-3 hover:bg-zinc-900/40 transition-colors",
                s.isYou && "bg-[#c4f000]/5 border-l-2 border-[#c4f000]"
              )}
            >
              <div className={cn(
                "w-8 h-8 shrink-0 flex items-center justify-center font-mono font-bold text-xs",
                s.rank === 1 ? "bg-yellow-500 text-black" :
                s.rank === 2 ? "bg-zinc-300 text-black" :
                s.rank === 3 ? "bg-amber-700 text-white" :
                s.isYou ? "bg-[#c4f000] text-black" : "text-zinc-500"
              )}>
                {s.rank}
              </div>
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-zinc-800 text-zinc-200 font-semibold">{s.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn("font-medium text-sm truncate", s.isYou && "text-[#c4f000]")}>
                    {s.name}{s.isYou && " (you)"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                  <Badge variant="outline" className="text-[9px] border-zinc-800 text-zinc-500">grade {s.grade}</Badge>
                  <span className="flex items-center gap-1"><Flame className="h-2.5 w-2.5 text-orange-400" />{s.streak}d</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold font-mono text-sm">
                  {tab === "global" ? s.xp.toLocaleString() : s.weeklyXP.toLocaleString()}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">{tab === "global" ? "XP" : "/wk"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
