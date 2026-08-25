"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, Zap, Trophy, Lock, BookOpen } from "lucide-react";
import { getCourseBySlug } from "@/lib/courses";
import { isLessonComplete, getCourseProgress } from "@/lib/local-state";
import { cn } from "@/lib/utils";

export default function CourseDetailPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = use(params);
  const course = getCourseBySlug(courseSlug);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(unsub);
  }, []);
  void tick;

  if (!course) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400">course not found</p>
        <Button asChild variant="outline" className="mt-4 border-zinc-800">
          <Link href="/learn">back to courses</Link>
        </Button>
      </div>
    );
  }

  const flatLessons = course.units.flatMap((u) => u.lessons);
  const totalLessons = flatLessons.length;
  const completed = flatLessons.filter((l) => isLessonComplete(courseSlug, l.id)).length;
  const progress = getCourseProgress(courseSlug, totalLessons);

  return (
    <div className="space-y-6 animate-in fade-in">
      <Button asChild variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-100">
        <Link href="/learn">
          <ChevronLeft className="h-4 w-4 mr-1" /> all courses
        </Link>
      </Button>

      {/* Hero */}
      <div className="border border-zinc-800/60 bg-[#0d0d0d] overflow-hidden">
        <div className="px-6 py-8 border-b border-zinc-800/60 flex flex-col sm:flex-row sm:items-center gap-6">
          <div
            className="w-20 h-20 flex items-center justify-center text-3xl font-bold border-2"
            style={{ borderColor: course.color, color: course.color }}
          >
            {course.icon}
          </div>
          <div className="flex-1">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">// {course.subject}</div>
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-zinc-400 mt-2">{course.description}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
              <span>grade {course.grade}</span>
              <span>·</span>
              <span>{totalLessons} lessons</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {course.totalXp} total XP</span>
            </div>
          </div>
        </div>
        {progress > 0 && (
          <div className="px-6 py-3 bg-zinc-900/40 flex items-center gap-3">
            <div className="flex-1 h-2 bg-zinc-800">
              <div
                className="h-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: course.color }}
              />
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              {completed}/{totalLessons} · {progress}%
            </div>
          </div>
        )}
      </div>

      {/* Units */}
      <div className="space-y-4">
        {course.units.map((unit, unitIdx) => {
          const unitCompleted = unit.lessons.filter((l) => isLessonComplete(courseSlug, l.id)).length;
          return (
            <div key={unit.id} className="border border-zinc-800/60 bg-[#0d0d0d]">
              <div className="px-5 py-3 border-b border-zinc-800/60 flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">unit {unitIdx + 1}</div>
                  <h2 className="text-lg font-semibold text-zinc-100">{unit.title}</h2>
                </div>
                <div className="text-xs text-zinc-500 font-mono">{unitCompleted}/{unit.lessons.length}</div>
              </div>
              <div className="divide-y divide-zinc-800/60">
                {unit.lessons.map((lesson, lessonIdx) => {
                  const complete = isLessonComplete(courseSlug, lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      href={`/learn/${courseSlug}/${lesson.id}`}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-900/40 transition-colors group"
                    >
                      <div className="shrink-0">
                        {complete ? (
                          <CheckCircle2 className="h-5 w-5 text-[#c4f000]" />
                        ) : (
                          <Circle className="h-5 w-5 text-zinc-700" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500 font-mono">{String(lessonIdx + 1).padStart(2, "0")}</span>
                          <span className={cn("font-medium", complete ? "text-zinc-400" : "text-zinc-100")}>
                            {lesson.title}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">{lesson.description}</div>
                      </div>
                      <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.duration}m</span>
                        <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {lesson.xp}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-[#c4f000] transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
