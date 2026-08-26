"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, Brain, Flame, Sparkles, RotateCcw, Lightbulb, Clock, ChevronRight, Home, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateDailyDrill, GeneratedProblem } from "@/lib/problem-generator";
import { recordAttempt } from "@/lib/adaptive-difficulty";
import { markProblemSolved, getState, subscribe } from "@/lib/local-state";
import { SolutionSteps } from "@/components/solution-steps";

const DAILY_KEY = "mathitout-daily-done-v1";

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export default function DailyDrillPage() {
  const [questions, setQuestions] = useState<GeneratedProblem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; correct: boolean }[]>([]);
  const [phase, setPhase] = useState<"intro" | "playing" | "results">("intro");
  const [completed, setCompleted] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const key = localStorage.getItem(DAILY_KEY);
      if (key === getTodayKey()) {
        setCompleted(true);
        setQuestions(generateDailyDrill());
        setPhase("results");
      } else {
        setQuestions(generateDailyDrill());
      }
    }
  }, []);

  const state = getState();
  void tick;

  const handleStart = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswers([]);
    setPhase("playing");
  };

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;
    const q = questions[currentIdx];
    const isCorrect = String(answer) === String(q.answer);
    setSelectedAnswer(answer);
    setShowFeedback(true);
    recordAttempt(q.topic, q.difficulty, isCorrect);
    setAnswers((prev) => [...prev, { questionId: q.id, correct: isCorrect }]);
    if (isCorrect) {
      markProblemSolved(q.id, q.xp, 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      if (typeof window !== "undefined") {
        localStorage.setItem(DAILY_KEY, getTodayKey());
      }
      setCompleted(true);
      setPhase("results");
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const correctCount = answers.filter((a) => a.correct).length;
  const xpEarned = answers.reduce((s, a) => {
    if (a.correct) {
      const q = questions.find((q) => q.id === a.questionId);
      return s + (q?.xp || 0);
    }
    return s;
  }, 0);

  if (phase === "intro") {
    return (
      <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// daily drill</div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-7 w-7" />
            today's practice
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">5 fresh problems. generated just for you. every day.</p>
        </div>

        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-6">
          <div className="grid grid-cols-3 gap-px bg-zinc-800/60 border border-zinc-800/60 mb-4">
            <div className="bg-[#0d0d0d] p-3 text-center">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">questions</div>
              <div className="text-xl font-bold text-zinc-100 mt-1 font-mono">5</div>
            </div>
            <div className="bg-[#0d0d0d] p-3 text-center">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">topics</div>
              <div className="text-xl font-bold text-zinc-100 mt-1 font-mono">5</div>
            </div>
            <div className="bg-[#0d0d0d] p-3 text-center">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">max xp</div>
              <div className="text-xl font-bold text-[#c4f000] mt-1 font-mono">85</div>
            </div>
          </div>

          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>2 easy warm-ups to get started</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
              <span>2 medium-difficulty problems</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-rose-400" />
              <span>1 hard problem to challenge you</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Sparkles className="h-3.5 w-3.5 text-[#c4f000]" />
              <span>New problems every day at midnight</span>
            </div>
          </div>

          {state.streak > 0 && (
            <div className="mb-4 p-3 border border-orange-500/30 bg-orange-500/5 flex items-center gap-2 text-sm">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-zinc-300">Complete today to extend your {state.streak}-day streak</span>
            </div>
          )}

          <Button onClick={handleStart} className="w-full h-12 bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold">
            <Play className="mr-2 h-4 w-4" /> start daily drill
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const accuracy = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
    return (
      <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// daily complete</div>
          <h1 className="text-3xl font-bold tracking-tight">nice work</h1>
          {completed && (
            <p className="text-zinc-500 text-sm mt-1">come back tomorrow for a fresh set of problems</p>
          )}
        </div>

        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-6">
          <div className="grid grid-cols-3 gap-px bg-zinc-800/60 border border-zinc-800/60">
            <div className="bg-[#0d0d0d] p-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">score</div>
              <div className="text-3xl font-bold text-[#c4f000] mt-1 font-mono">{Math.round(accuracy)}%</div>
            </div>
            <div className="bg-[#0d0d0d] p-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">correct</div>
              <div className="text-3xl font-bold text-zinc-100 mt-1 font-mono">{correctCount}/{questions.length}</div>
            </div>
            <div className="bg-[#0d0d0d] p-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">xp earned</div>
              <div className="text-3xl font-bold text-emerald-400 mt-1 font-mono">+{xpEarned}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild className="flex-1 bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" /> back to dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-zinc-800">
            <Link href="/quiz">custom quiz</Link>
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];
  if (!q) return null;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
            {currentIdx + 1} / {questions.length}
          </div>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div key={i} className={cn("h-1 w-6", i < currentIdx ? "bg-[#c4f000]" : i === currentIdx ? "bg-[#c4f000]/50" : "bg-zinc-800")} />
            ))}
          </div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider",
          q.difficulty === "easy" ? "text-emerald-400 border-emerald-400/30" :
          q.difficulty === "medium" ? "text-amber-400 border-amber-400/30" :
          "text-rose-400 border-rose-400/30"
        )}>
          {q.difficulty}
        </Badge>
      </div>

      <div className="border border-zinc-800/60 bg-[#0d0d0d]">
        <div className="p-6 sm:p-8">
          <p className="text-lg text-zinc-100 leading-relaxed mb-6">{q.question}</p>

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
              <span>{q.hint}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.choices.map((choice, i) => {
              const isSelected = selectedAnswer === choice;
              const isCorrect = String(choice) === String(q.answer);
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(choice)}
                  disabled={showFeedback}
                  className={cn(
                    "p-4 text-left border transition-colors",
                    !showFeedback && "hover:border-zinc-600",
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
                selectedAnswer === String(q.answer)
                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                  : "border-rose-500/30 bg-rose-500/5 text-rose-300"
              )}>
                {selectedAnswer === String(q.answer)
                  ? <span>correct! +{q.xp} XP</span>
                  : <span>the answer was {String(q.answer)}</span>}
              </div>
              <div className="p-3 border border-zinc-800 bg-[#0a0a0a] text-sm text-zinc-400">
                {q.explanation}
              </div>
              {!showSolution ? (
                <Button
                  onClick={() => setShowSolution(true)}
                  variant="outline"
                  className="w-full border-zinc-800"
                >
                  show step-by-step solution
                </Button>
              ) : (
                <SolutionSteps problem={q} onClose={() => setShowSolution(false)} />
              )}
              <Button onClick={handleNext} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold">
                {currentIdx + 1 >= questions.length ? "finish" : "next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
