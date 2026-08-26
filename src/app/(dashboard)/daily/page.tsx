"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, Calendar, ChevronRight, Lightbulb, Target, Zap, Flame, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateProblems, GeneratedProblem } from "@/lib/problem-generator";
import { recordAttempt } from "@/lib/adaptive-difficulty";
import { markProblemSolved, getState, subscribe } from "@/lib/local-state";
import { SolutionSteps } from "@/components/solution-steps";

const TODAY_KEY = "mathitout-potd-v1";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export default function ProblemOfTheDay() {
  const { toast } = useToast();
  const [problem, setProblem] = useState<GeneratedProblem | null>(null);
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Seeded by date for consistency
    const today = getTodayKey();
    const seed = Math.floor(new Date(today).getTime() / 86400000);
    const problems = generateProblems({ count: 1, seed, difficulty: "medium" });
    setProblem(problems[0]);

    // Check if already completed today
    if (typeof window !== "undefined") {
      const completedKey = localStorage.getItem(TODAY_KEY);
      if (completedKey === today) setCompleted(true);
      // Load streak
      const lastDate = localStorage.getItem("mathitout-potd-streak-date-v1");
      const streakCount = parseInt(localStorage.getItem("mathitout-potd-streak-v1") || "0", 10);
      if (lastDate) {
        const last = new Date(lastDate);
        const todayDate = new Date(today);
        const diff = Math.floor((todayDate.getTime() - last.getTime()) / 86400000);
        if (diff === 0) setStreak(streakCount);
        else if (diff === 1) setStreak(streakCount);
        else setStreak(0);
      }
    }
  }, []);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  const state = getState();
  void tick;

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-zinc-500 text-sm">generating today's problem...</div>
      </div>
    );
  }

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;
    const isCorrect = String(answer) === String(problem.answer);
    setSelectedAnswer(answer);
    setShowFeedback(true);
    recordAttempt(problem.topic, problem.difficulty, isCorrect);

    if (isCorrect) {
      markProblemSolved(problem.id, problem.xp * 2, 1);
      setCompleted(true);
      if (typeof window !== "undefined") {
        const today = getTodayKey();
        const lastDate = localStorage.getItem("mathitout-potd-streak-date-v1");
        let newStreak = 1;
        if (lastDate) {
          const last = new Date(lastDate);
          const todayDate = new Date(today);
          const diff = Math.floor((todayDate.getTime() - last.getTime()) / 86400000);
          if (diff === 1) {
            newStreak = streak + 1;
          } else if (diff === 0) {
            newStreak = streak;
          }
        }
        setStreak(newStreak);
        localStorage.setItem(TODAY_KEY, today);
        localStorage.setItem("mathitout-potd-streak-date-v1", today);
        localStorage.setItem("mathitout-potd-streak-v1", String(newStreak));
      }
      toast({
        title: "problem solved!",
        description: `+${problem.xp * 2} XP · ${problem.topic} master`,
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7" />
            problem of the day
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">a fresh challenge every day. 2× XP for getting it right.</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 border border-orange-500/30 bg-orange-500/5">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-mono">{streak} day{streak !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      <div className="border border-zinc-800/60 bg-[#0d0d0d]">
        <div className="p-5 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider",
              problem.difficulty === "easy" ? "text-emerald-400 border-emerald-400/30" :
              problem.difficulty === "medium" ? "text-amber-400 border-amber-400/30" :
              "text-rose-400 border-rose-400/30"
            )}>
              {problem.difficulty}
            </Badge>
            <span className="text-[10px] text-zinc-600 font-mono capitalize">{problem.topic}</span>
          </div>
          <span className="text-[10px] text-[#c4f000] font-mono">+{problem.xp * 2} XP</span>
        </div>

        <div className="p-6">
          {completed && !showFeedback ? (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex p-3 border border-emerald-500/30 bg-emerald-500/5">
                <Sparkles className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-emerald-400">today's problem solved</h2>
              <p className="text-zinc-500 text-sm">come back tomorrow for a new challenge</p>
            </div>
          ) : (
            <>
              <p className="text-lg text-zinc-100 leading-relaxed mb-6">{problem.question}</p>

              {!showFeedback && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-xs text-zinc-500 hover:text-amber-400 flex items-center gap-1.5"
                  >
                    <Lightbulb className="h-3 w-3" /> show hint
                  </button>
                </div>
              )}

              {showHint && !showFeedback && (
                <div className="p-3 border border-amber-500/30 bg-amber-500/5 text-sm text-amber-200 mb-4 flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>{problem.hint}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {problem.choices.map((choice, i) => {
                  const isSelected = selectedAnswer === choice;
                  const isCorrect = String(choice) === String(problem.answer);
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(choice)}
                      disabled={showFeedback || completed}
                      className={cn(
                        "p-4 text-left border transition-colors",
                        !showFeedback && !completed && "hover:border-zinc-600",
                        showFeedback && isCorrect && "border-emerald-500 bg-emerald-500/10",
                        showFeedback && isSelected && !isCorrect && "border-rose-500 bg-rose-500/10",
                        showFeedback && !isSelected && !isCorrect && "border-zinc-800 opacity-50",
                        !showFeedback && isSelected && "border-[#c4f000] bg-[#c4f000]/5",
                        !showFeedback && !isSelected && "border-zinc-800"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-6 h-6 shrink-0 flex items-center justify-center text-xs font-mono",
                          showFeedback && isCorrect ? "bg-emerald-500 text-black" :
                          showFeedback && isSelected && !isCorrect ? "bg-rose-500 text-white" :
                          "bg-zinc-800 text-zinc-400"
                        )}>
                          {showFeedback && isCorrect ? "✓" :
                           showFeedback && isSelected && !isCorrect ? "✗" :
                           String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm font-mono">{choice}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {showFeedback && (
                <div className="mt-4 space-y-3">
                  <div className={cn(
                    "p-3 border text-sm",
                    selectedAnswer === String(problem.answer)
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                      : "border-rose-500/30 bg-rose-500/5 text-rose-300"
                  )}>
                    {selectedAnswer === String(problem.answer)
                      ? <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> correct! +{problem.xp * 2} XP</span>
                      : <span>the answer was {String(problem.answer)}</span>}
                  </div>
                  <div className="p-3 border border-zinc-800 bg-[#0a0a0a] text-sm text-zinc-400">
                    {problem.explanation}
                  </div>
                  {!showSolution ? (
                    <Button
                      onClick={() => setShowSolution(true)}
                      variant="outline"
                      className="w-full border-zinc-800"
                    >
                      <ChevronRight className="h-3.5 w-3.5 mr-1" /> show step-by-step solution
                    </Button>
                  ) : (
                    <SolutionSteps problem={problem} onClose={() => setShowSolution(false)} />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Link href="/quiz" className="block">
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4 hover:border-[#c4f000] transition-colors">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-[#c4f000]" />
              <div>
                <h3 className="font-semibold text-sm">custom quiz</h3>
                <p className="text-xs text-zinc-500 mt-0.5">5–50 problems, your choice</p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/daily-drill" className="block">
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4 hover:border-[#c4f000] transition-colors">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-[#c4f000]" />
              <div>
                <h3 className="font-semibold text-sm">daily drill</h3>
                <p className="text-xs text-zinc-500 mt-0.5">5 problems, 5 topics</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
