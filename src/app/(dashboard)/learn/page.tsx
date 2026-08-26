"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, Target, Brain, BookOpen, ChevronRight, RotateCcw,
  ArrowRight, Lightbulb, Zap, CheckCircle2, XCircle, BookText, GraduationCap, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getAllCourses } from "@/lib/courses";
import { getProblems, getProblemsByTopic } from "@/lib/problems";
import { getState, subscribe, isSolved, markLessonComplete, getCourseProgress, markProblemSolved } from "@/lib/local-state";
import { getWeakestTopics, getPerformance, getOverallStats } from "@/lib/adaptive-difficulty";

export default function LearnPage() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  const state = getState();
  void tick;
  const courses = getAllCourses();
  const problems = getProblems();
  const perf = getPerformance();
  const overall = getOverallStats();
  const weakest = getWeakestTopics(3);

  const subjectColor: Record<string, string> = {
    Algebra: "#c4f000", "Pre-Algebra": "#34d399", Geometry: "#60a5fa",
    Arithmetic: "#fbbf24", Statistics: "#a78bfa", Trigonometry: "#fb923c",
    Calculus: "#f472b6",
  };

  const totalLessons = courses.reduce((s, c) => s + c.units.reduce((u, unit) => u + unit.lessons.length, 0), 0);
  const completedLessons = courses.reduce((s, c) => s + c.units.flatMap((u) => u.lessons).filter((l) => isSolved(c.slug + "-" + l.id) || false).length, 0);
  const solvedProblems = problems.filter((p) => isSolved(p.slug)).length;

  const recommendedNext = useMemo(() => {
    if (weakest.length > 0) {
      const topic = weakest[0];
      const course = courses.find((c) => c.subject.toLowerCase() === topic.toLowerCase());
      if (course) return { type: "course", title: `Review ${course.title}`, href: `/learn/${course.slug}`, color: course.color };
    }
    const unsolved = problems.find((p) => !isSolved(p.slug));
    if (unsolved) return { type: "problem", title: unsolved.title, href: `/solve?p=${unsolved.slug}`, color: subjectColor[unsolved.topic] || "#c4f000" };
    return null;
  }, [weakest, problems, courses]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// your learning hub</div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-7 w-7" />
            learn
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">courses, problems, and adaptive practice — all in one place.</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-px bg-zinc-800/60 border border-zinc-800/60 grid-cols-2 sm:grid-cols-4">
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">courses</div>
              <div className="text-2xl font-bold text-zinc-100 mt-1">{courses.length}</div>
            </div>
            <BookOpen className="h-5 w-5 text-zinc-700" />
          </div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">lessons</div>
              <div className="text-2xl font-bold text-zinc-100 mt-1">{completedLessons}/{totalLessons}</div>
            </div>
            <Target className="h-5 w-5 text-zinc-700" />
          </div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">problems solved</div>
              <div className="text-2xl font-bold text-[#c4f000] mt-1">{solvedProblems}</div>
            </div>
            <Zap className="h-5 w-5 text-zinc-700" />
          </div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">accuracy</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {overall.totalAttempts > 0 ? Math.round(overall.overallAccuracy * 100) : 0}%
              </div>
            </div>
            <TrendingUp className="h-5 w-5 text-zinc-700" />
          </div>
        </div>
      </div>

      {/* Recommended next */}
      {recommendedNext && (
        <Link href={recommendedNext.href} className="block">
          <div
            className="border p-4 hover:opacity-90 transition-opacity flex items-center justify-between"
            style={{ borderColor: recommendedNext.color, background: `${recommendedNext.color}08` }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 border" style={{ borderColor: recommendedNext.color, color: recommendedNext.color }}>
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">recommended for you</div>
                <div className="font-semibold mt-0.5">{recommendedNext.title}</div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-zinc-400" />
          </div>
        </Link>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Link href="/daily-drill" className="block group">
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4 hover:border-[#c4f000] transition-colors">
            <Brain className="h-5 w-5 text-[#c4f000] mb-2" />
            <h3 className="font-semibold text-sm">daily drill</h3>
            <p className="text-xs text-zinc-500 mt-1">5 fresh problems every day</p>
          </div>
        </Link>
        <Link href="/quiz" className="block group">
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4 hover:border-[#c4f000] transition-colors">
            <Target className="h-5 w-5 text-[#c4f000] mb-2" />
            <h3 className="font-semibold text-sm">custom quiz</h3>
            <p className="text-xs text-zinc-500 mt-1">pick topic, difficulty, and length</p>
          </div>
        </Link>
        <Link href="/review" className="block group">
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4 hover:border-[#c4f000] transition-colors">
            <RotateCcw className="h-5 w-5 text-[#c4f000] mb-2" />
            <h3 className="font-semibold text-sm">spaced review</h3>
            <p className="text-xs text-zinc-500 mt-1">FSRS-powered review queue</p>
          </div>
        </Link>
      </div>

      {/* Courses */}
      <div>
        <h2 className="text-lg font-semibold mb-4">courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((course) => {
            const lessons = course.units.flatMap((u) => u.lessons);
            const progress = getCourseProgress(course.slug, lessons.length);
            const color = subjectColor[course.subject] || "#c4f000";
            return (
              <Link key={course.id} href={`/learn/${course.slug}`} className="block group">
                <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5 hover:border-zinc-600 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-12 h-12 flex items-center justify-center text-xl font-bold border-2"
                      style={{ borderColor: color, color }}
                    >
                      {course.icon}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-500 font-mono">grade {course.grade}</div>
                      <div className="text-[10px] text-zinc-600 font-mono">{lessons.length} lessons</div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-zinc-100 group-hover:text-[#c4f000] transition-colors">{course.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{course.description}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                      <span>progress</span>
                      <span className="font-mono">{progress}%</span>
                    </div>
                    <div className="h-1 bg-zinc-900">
                      <div className="h-full transition-all" style={{ width: `${progress}%`, backgroundColor: color }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Performance overview */}
      {Object.keys(perf).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">your performance</h2>
          <div className="border border-zinc-800/60 bg-[#0d0d0d]">
            <div className="p-4 border-b border-zinc-800/60">
              <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">// per-topic accuracy</div>
            </div>
            <div className="p-4 space-y-3">
              {Object.values(perf).map((p) => (
                <div key={p.topic} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 capitalize w-24">{p.topic}</span>
                  <div className="flex-1 h-2 bg-zinc-900">
                    <div
                      className={cn("h-full",
                        p.accuracy >= 0.8 ? "bg-emerald-500" :
                        p.accuracy >= 0.5 ? "bg-amber-500" : "bg-rose-500"
                      )}
                      style={{ width: `${p.accuracy * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 font-mono w-16 text-right">
                    {Math.round(p.accuracy * 100)}% ({p.correct}/{p.attempts})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
