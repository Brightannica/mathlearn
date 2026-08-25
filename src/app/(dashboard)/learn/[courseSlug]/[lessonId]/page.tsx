"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, Zap, Trophy, Lock } from "lucide-react";
import { getCourseBySlug } from "@/lib/courses";
import { markLessonComplete, isLessonComplete, getCourseProgress } from "@/lib/local-state";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { pingActivity } from "@/lib/local-state";

function renderBlock(block: any, idx: number) {
  switch (block.type) {
    case "heading":
      return <h2 key={idx} className="text-lg font-semibold text-zinc-100 mt-6 mb-2">{block.content}</h2>;
    case "text":
      return <p key={idx} className="text-zinc-300 leading-relaxed mb-3">{block.content}</p>;
    case "code":
      return (
        <pre key={idx} className="bg-[#0a0a0a] border border-zinc-800 p-4 my-3 overflow-x-auto text-sm font-mono text-[#c4f000]">
          {block.content}
        </pre>
      );
    case "math":
      return (
        <div key={idx} className="bg-zinc-900/50 border-l-2 border-[#c4f000] px-4 py-3 my-3 font-mono text-sm text-zinc-100 whitespace-pre-wrap">
          {block.content}
        </div>
      );
    case "callout":
      const colors: Record<string, string> = {
        tip: "border-[#c4f000]/40 bg-[#c4f000]/5 text-zinc-200",
        warning: "border-amber-500/40 bg-amber-500/5 text-amber-100",
        note: "border-sky-500/40 bg-sky-500/5 text-sky-100",
      };
      return (
        <div key={idx} className={cn("border px-4 py-3 my-3 text-sm", colors[block.variant] || colors.note)}>
          <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1">{block.variant}</div>
          <div>{block.content}</div>
        </div>
      );
    case "example":
      return (
        <div key={idx} className="border border-zinc-800 bg-zinc-900/30 my-3">
          <div className="px-4 py-2 border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">example</div>
          <div className="p-4 space-y-2">
            <div>
              <div className="text-xs text-zinc-600">problem</div>
              <div className="text-zinc-200">{block.problem}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-600">solution</div>
              <div className="text-[#c4f000] font-mono text-sm">{block.solution}</div>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function LessonPage({ params }: { params: Promise<{ courseSlug: string; lessonId: string }> }) {
  const { courseSlug, lessonId } = use(params);
  const course = getCourseBySlug(courseSlug);
  const { toast } = useToast();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    pingActivity();
  }, []);

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
  const currentIdx = flatLessons.findIndex((l) => l.id === lessonId);
  if (currentIdx === -1) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400">lesson not found</p>
        <Button asChild variant="outline" className="mt-4 border-zinc-800">
          <Link href={`/learn/${courseSlug}`}>back to course</Link>
        </Button>
      </div>
    );
  }

  const lesson = flatLessons[currentIdx];
  const prev = flatLessons[currentIdx - 1];
  const next = flatLessons[currentIdx + 1];
  const complete = isLessonComplete(courseSlug, lessonId);

  const handleComplete = () => {
    const next = markLessonComplete(courseSlug, lessonId, lesson.xp);
    toast({ title: "lesson complete", description: `+${lesson.xp} XP · streak: ${next.streak} days` });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-100">
          <Link href={`/learn/${courseSlug}`}>
            <ChevronLeft className="h-4 w-4 mr-1" /> back to {course.title}
          </Link>
        </Button>
        <div className="text-xs text-zinc-500 font-mono">
          lesson {currentIdx + 1} / {flatLessons.length}
        </div>
      </div>

      <div className="border border-zinc-800/60 bg-[#0d0d0d]">
        <div className="px-6 py-5 border-b border-zinc-800/60">
          <div className="text-xs text-zinc-500 mb-1">{course.title}</div>
          <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.duration} min</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {lesson.xp} XP</span>
            <span>·</span>
            <span>{lesson.description}</span>
          </div>
        </div>

        <div className="p-6">
          {lesson.blocks.map((block, idx) => renderBlock(block, idx))}
        </div>

        <div className="border-t border-zinc-800/60 px-6 py-4 flex items-center justify-between bg-zinc-900/30">
          <Button
            variant="outline"
            size="sm"
            disabled={!prev}
            asChild={!!prev}
            className="border-zinc-800"
          >
            {prev ? <Link href={`/learn/${courseSlug}/${prev.id}`}>
              <ChevronLeft className="h-4 w-4 mr-1" /> previous
            </Link> : <span><ChevronLeft className="h-4 w-4 mr-1 inline" /> previous</span>}
          </Button>

          <div className="flex items-center gap-2">
            {!complete ? (
              <Button
                onClick={handleComplete}
                className="bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> mark complete · +{lesson.xp} XP
              </Button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 border border-[#c4f000]/40 bg-[#c4f000]/5 text-[#c4f000] text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" /> completed
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={!next}
            asChild={!!next}
            className="border-zinc-800"
          >
            {next ? <Link href={`/learn/${courseSlug}/${next.id}`}>
              next <ChevronRight className="h-4 w-4 ml-1" />
            </Link> : <span>next <ChevronRight className="h-4 w-4 ml-1 inline" /></span>}
          </Button>
        </div>
      </div>

      {lesson.practiceProblemSlugs && lesson.practiceProblemSlugs.length > 0 && (
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#c4f000]" /> practice these
          </h3>
          <div className="space-y-1.5">
            {lesson.practiceProblemSlugs.map((slug) => (
              <Button
                key={slug}
                asChild
                variant="ghost"
                className="w-full justify-between h-auto py-2 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900/50"
              >
                <Link href={`/solve?p=${slug}`}>
                  <span className="font-mono text-xs">{slug}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
