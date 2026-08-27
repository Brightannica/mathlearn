"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight, BookOpen, CheckCircle2, Circle, Sparkles, GraduationCap,
  Target, Trophy, Compass, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllCourses } from "@/lib/courses";
import { getProblems } from "@/lib/problems";
import { getState, subscribe, isSolved, markLessonComplete, getCourseProgress, pingActivity } from "@/lib/local-state";

type NodeType = "milestone" | "course" | "checkpoint" | "review";

type PathNode = {
  id: string;
  type: NodeType;
  title: string;
  description: string;
  href?: string;
  xp: number;
  icon: string;
  color: string;
  requires?: string[];
};

const PATH: PathNode[] = [
  {
    id: "start",
    type: "milestone",
    title: "welcome to mathitout",
    description: "begin your journey. complete 1 problem to unlock the rest of the path.",
    xp: 10,
    icon: "★",
    color: "#c4f000",
  },
  {
    id: "first-solve",
    type: "checkpoint",
    title: "first solve",
    description: "solve any problem in /solve",
    href: "/solve",
    xp: 20,
    icon: "✓",
    color: "#60a5fa",
    requires: ["start"],
  },
  {
    id: "pre-algebra",
    type: "course",
    title: "pre-algebra foundations",
    description: "integers, fractions, percentages. 6 lessons.",
    href: "/learn/pre-algebra",
    xp: 50,
    icon: "±",
    color: "#34d399",
    requires: ["first-solve"],
  },
  {
    id: "first-streak",
    type: "checkpoint",
    title: "3-day streak",
    description: "practice 3 days in a row",
    xp: 30,
    icon: "🔥",
    color: "#fb923c",
    requires: ["pre-algebra"],
  },
  {
    id: "algebra-1",
    type: "course",
    title: "algebra i",
    description: "linear equations, quadratics, polynomials. 6 lessons.",
    href: "/learn/algebra-1",
    xp: 80,
    icon: "ƒ",
    color: "#c4f000",
    requires: ["first-streak"],
  },
  {
    id: "code-10",
    type: "checkpoint",
    title: "code 10 problems",
    description: "solve 10 LeetCode-style problems in /solve",
    href: "/solve",
    xp: 50,
    icon: "⌨",
    color: "#a78bfa",
    requires: ["algebra-1"],
  },
  {
    id: "geometry",
    type: "course",
    title: "geometry",
    description: "shapes, proofs, pythagorean theorem. 4 lessons.",
    href: "/learn/geometry",
    xp: 60,
    icon: "△",
    color: "#60a5fa",
    requires: ["code-10"],
  },
  {
    id: "review-week",
    type: "review",
    title: "week 1 review",
    description: "use spaced repetition to review what you've learned",
    href: "/review",
    xp: 40,
    icon: "⟳",
    color: "#f472b6",
    requires: ["geometry"],
  },
  {
    id: "arithmetic",
    type: "course",
    title: "arithmetic & number theory",
    description: "primes, GCD/LCM, percentages. 4 lessons.",
    href: "/learn/arithmetic",
    xp: 40,
    icon: "∑",
    color: "#fbbf24",
    requires: ["review-week"],
  },
  {
    id: "perfect-quiz",
    type: "checkpoint",
    title: "perfect quiz",
    description: "get 100% on any quiz in /quiz",
    href: "/quiz",
    xp: 60,
    icon: "★",
    color: "#4ade80",
    requires: ["arithmetic"],
  },
  {
    id: "algebra-2",
    type: "course",
    title: "algebra ii",
    description: "polynomials, logs, sequences. 6 lessons.",
    href: "/learn/algebra-2",
    xp: 100,
    icon: "∑₂",
    color: "#22d3ee",
    requires: ["perfect-quiz"],
  },
  {
    id: "statistics",
    type: "course",
    title: "statistics",
    description: "mean, median, standard deviation. 2 lessons.",
    href: "/learn/statistics",
    xp: 60,
    icon: "σ",
    color: "#a78bfa",
    requires: ["algebra-2"],
  },
  {
    id: "trig",
    type: "course",
    title: "trigonometry",
    description: "unit circle, identities, law of sines. 4 lessons.",
    href: "/learn/trigonometry",
    xp: 80,
    icon: "∠",
    color: "#fb923c",
    requires: ["statistics"],
  },
  {
    id: "calculus",
    type: "course",
    title: "calculus",
    description: "derivatives, integrals, applications. 2 lessons.",
    href: "/learn/calculus",
    xp: 100,
    icon: "∫",
    color: "#f472b6",
    requires: ["trig"],
  },
  {
    id: "graduate",
    type: "milestone",
    title: "graduate",
    description: "you've completed the full path. keep going — there's always more to learn.",
    xp: 500,
    icon: "🎓",
    color: "#c4f000",
    requires: ["calculus"],
  },
];

export default function LearningPathPage() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    pingActivity();
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  const state = getState();
  void tick;
  const solvedCount = state.solved?.length || 0;
  const completedLessons = state.completedLessons || [];
  const streak = state.streak || 0;
  const xp = state.xp || 0;

  const isCompleted = (node: PathNode) => {
    if (node.id === "start") return true;
    if (node.id === "first-solve") return solvedCount >= 1;
    if (node.id === "pre-algebra") return getCourseProgress("pre-algebra", 6) >= 50;
    if (node.id === "first-streak") return streak >= 3;
    if (node.id === "algebra-1") return getCourseProgress("algebra-1", 6) >= 50;
    if (node.id === "code-10") return solvedCount >= 10;
    if (node.id === "geometry") return getCourseProgress("geometry", 4) >= 50;
    if (node.id === "review-week") return (state.solved?.length || 0) >= 15;
    if (node.id === "arithmetic") return getCourseProgress("arithmetic", 4) >= 50;
    if (node.id === "perfect-quiz") return xp >= 200;
    if (node.id === "algebra-2") return getCourseProgress("algebra-2", 6) >= 50;
    if (node.id === "statistics") return getCourseProgress("statistics", 2) >= 50;
    if (node.id === "trig") return getCourseProgress("trigonometry", 4) >= 50;
    if (node.id === "calculus") return getCourseProgress("calculus", 2) >= 50;
    if (node.id === "graduate") return xp >= 500;
    return false;
  };

  const isUnlocked = (node: PathNode) => {
    if (!node.requires) return true;
    return node.requires.every((req) => isCompleted(PATH.find((n) => n.id === req)!));
  };

  const completedCount = PATH.filter((n) => isCompleted(n)).length;
  const totalXp = PATH.reduce((s, n) => s + n.xp, 0);
  const earnedXp = PATH.filter((n) => isCompleted(n)).reduce((s, n) => s + n.xp, 0);

  return (
    <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// structured journey</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Compass className="h-7 w-7" />
          learning path
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">from zero to AP calc. follow the path, unlock each step.</p>
      </div>

      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#c4f000]" />
            <span className="text-sm font-semibold">progress</span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            {completedCount}/{PATH.length} · {earnedXp}/{totalXp} XP
          </div>
        </div>
        <div className="h-2 bg-zinc-900">
          <div
            className="h-full bg-[#c4f000] transition-all"
            style={{ width: `${(completedCount / PATH.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-zinc-800" />

        <div className="space-y-3">
          {PATH.map((node, i) => {
            const completed = isCompleted(node);
            const unlocked = isUnlocked(node);
            const isCurrent = unlocked && !completed && i > 0 && isCompleted(PATH[i - 1]);

            return (
              <div key={node.id} className="relative pl-14">
                {/* Timeline dot */}
                <div
                  className={cn(
                    "absolute left-2.5 w-5 h-5 flex items-center justify-center text-xs font-bold border-2",
                    completed
                      ? "border-[#c4f000] bg-[#c4f000] text-black"
                      : unlocked
                      ? "border-zinc-500 bg-zinc-800 text-zinc-300"
                      : "border-zinc-800 bg-[#0a0a0a] text-zinc-700"
                  )}
                  style={isCurrent ? { borderColor: node.color, backgroundColor: node.color, color: "#0a0a0a" } : {}}
                >
                  {completed ? "✓" : i + 1}
                </div>

                <div
                  className={cn(
                    "border p-4 transition-all",
                    completed
                      ? "border-[#c4f000]/30 bg-[#c4f000]/5"
                      : unlocked
                      ? "border-zinc-700 bg-[#0d0d0d] hover:border-zinc-600"
                      : "border-zinc-800/40 bg-[#0a0a0a] opacity-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 border flex items-center justify-center text-lg font-bold shrink-0"
                      style={{
                        borderColor: node.color,
                        color: completed ? "#0a0a0a" : node.color,
                        backgroundColor: completed ? node.color : "transparent",
                      }}
                    >
                      {node.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-zinc-100">{node.title}</h3>
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase tracking-wider"
                          style={{ borderColor: `${node.color}40`, color: node.color }}
                        >
                          {node.type.replace("_", " ")}
                        </Badge>
                        {completed && <CheckCircle2 className="h-3.5 w-3.5 text-[#c4f000]" />}
                        {isCurrent && (
                          <Badge className="bg-[#c4f000] text-black text-[10px]">current</Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mb-2">{node.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-600 font-mono">+{node.xp} XP</span>
                        {node.href && unlocked && (
                          <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-zinc-400 hover:text-[#c4f000]">
                            <Link href={node.href}>open <ArrowRight className="ml-1 h-3 w-3" /></Link>
                          </Button>
                        )}
                        {!unlocked && (
                          <span className="text-[10px] text-zinc-700 font-mono">locked</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {completedCount === PATH.length && (
        <div className="border border-[#c4f000]/40 bg-[#c4f000]/10 p-6 text-center space-y-3">
          <GraduationCap className="h-12 w-12 text-[#c4f000] mx-auto" />
          <h2 className="text-2xl font-bold text-[#c4f000]">path complete</h2>
          <p className="text-sm text-zinc-300">you've completed every step. keep practicing, keep growing.</p>
        </div>
      )}
    </div>
  );
}
