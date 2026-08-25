"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Clock, Zap, CheckCircle2, BookOpen, Target, Code2, Trophy } from "lucide-react";
import { getAllCourses } from "@/lib/courses";
import { isLessonComplete, getCourseProgress, getState, subscribe } from "@/lib/local-state";

const subjectColor: Record<string, string> = {
  Algebra: "#c4f000",
  Geometry: "#60a5fa",
  Arithmetic: "#fbbf24",
  Statistics: "#a78bfa",
  Calculus: "#f472b6",
};

export default function LearnPage() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  const state = getState();
  void tick;
  const courses = getAllCourses();
  const totalLessons = courses.reduce((sum, c) => sum + c.units.reduce((u, unit) => u + unit.lessons.length, 0), 0);
  const completedLessons = courses.reduce((sum, c) => sum + c.units.flatMap((u) => u.lessons).filter((l) => isLessonComplete(c.slug, l.id)).length, 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// curriculum</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-7 w-7" />
          learn
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">structured courses, K through AP. each one a real sequence, not a pile of videos.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-zinc-800/60 border border-zinc-800/60">
        <div className="bg-[#0d0d0d] p-4">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">courses</div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{courses.length}</div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">lessons</div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{totalLessons}</div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">completed</div>
          <div className="text-2xl font-bold text-[#c4f000] mt-1">{completedLessons}</div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">progress</div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{overallProgress}%</div>
        </div>
      </div>

      {/* Course grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          const lessons = course.units.flatMap((u) => u.lessons);
          const progress = getCourseProgress(course.slug, lessons.length);
          const completed = lessons.filter((l) => isLessonComplete(course.slug, l.id)).length;
          const color = subjectColor[course.subject] || "#c4f000";
          return (
            <Link
              key={course.id}
              href={`/learn/${course.slug}`}
              className="group border border-zinc-800/60 bg-[#0d0d0d] hover:border-zinc-700 transition-colors flex flex-col"
            >
              <div className="p-5 border-b border-zinc-800/60">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-12 h-12 flex items-center justify-center text-xl font-bold border-2"
                    style={{ borderColor: color, color: color }}
                  >
                    {course.icon}
                  </div>
                  {completed > 0 && (
                    <Badge variant="outline" className="border-[#c4f000]/30 text-[#c4f000] text-[10px]">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> {completed}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-[#c4f000] transition-colors">
                  {course.title}
                </h3>
                <div className="text-xs text-zinc-500 mt-0.5">{course.subject} · grade {course.grade}</div>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed line-clamp-2">{course.description}</p>
              </div>
              <div className="px-5 py-3 mt-auto">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {course.totalXp} XP</span>
                  <span className="font-mono">{completed}/{lessons.length}</span>
                </div>
                <div className="h-1.5 bg-zinc-900">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${progress}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom CTAs */}
      <div className="grid sm:grid-cols-2 gap-4 pt-4">
        <Link
          href="/solve"
          className="border border-zinc-800/60 bg-[#0d0d0d] hover:border-[#c4f000] transition-colors p-5 flex items-center justify-between group"
        >
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">// want to skip ahead</div>
            <div className="text-lg font-semibold flex items-center gap-2">
              <Code2 className="h-5 w-5 text-[#c4f000]" /> jump to problem set
            </div>
            <div className="text-xs text-zinc-500 mt-1">write code. pass tests. earn XP.</div>
          </div>
          <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-[#c4f000] transition-colors" />
        </Link>
        <Link
          href="/practice"
          className="border border-zinc-800/60 bg-[#0d0d0d] hover:border-[#c4f000] transition-colors p-5 flex items-center justify-between group"
        >
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">// random drill</div>
            <div className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-[#c4f000]" /> quick practice
            </div>
            <div className="text-xs text-zinc-500 mt-1">a problem from your weak spots, right now.</div>
          </div>
          <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-[#c4f000] transition-colors" />
        </Link>
      </div>
    </div>
  );
}
