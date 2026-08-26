"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap, ArrowRight, Sparkles, RefreshCw, CheckCircle2, XCircle, Clock, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateQuiz, GeneratedProblem } from "@/lib/problem-generator";
import { recordAttempt } from "@/lib/adaptive-difficulty";
import { markProblemSolved, getState, subscribe } from "@/lib/local-state";

export function QuickPractice() {
  const [tick, setTick] = useState(0);
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [problem, setProblem] = useState<GeneratedProblem | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (phase === "idle") {
      const next = generateQuiz("mixed", 1, "mixed")[0];
      setProblem(next);
    }
  }, [phase]);

  const start = () => {
    setPhase("playing");
    setSelected(null);
    setShowFeedback(false);
    setCorrectCount(0);
    setQuestionCount(0);
    setStreak(0);
    const next = generateQuiz("mixed", 1, "mixed")[0];
    setProblem(next);
  };

  const handleAnswer = (answer: string) => {
    if (showFeedback || !problem) return;
    const isCorrect = String(answer) === String(problem.answer);
    setSelected(answer);
    setShowFeedback(true);
    recordAttempt(problem.topic, problem.difficulty, isCorrect);
    setQuestionCount((c) => c + 1);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setStreak((s) => s + 1);
      markProblemSolved(problem.id, problem.xp, 1);
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    setSelected(null);
    setShowFeedback(false);
    const nextProblem = generateQuiz("mixed", 1, "mixed")[0];
    setProblem(nextProblem);
  };

  const done = () => {
    setPhase("done");
  };

  if (phase === "done") {
    const accuracy = questionCount > 0 ? Math.round((correctCount / questionCount) * 100) : 0;
    return (
      <Card className="border-zinc-800/60 bg-[#0d0d0d]">
        <CardContent className="pt-5">
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 border border-[#c4f000]/30 bg-[#c4f000]/5">
              <Sparkles className="h-6 w-6 text-[#c4f000]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">quick practice complete</h3>
              <p className="text-2xl font-bold text-[#c4f000] mt-1">{correctCount}/{questionCount} correct · {accuracy}%</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={start} className="bg-[#c4f000] text-black hover:bg-[#b3d800]">
                <RefreshCw className="h-4 w-4 mr-2" /> another round
              </Button>
              <Button onClick={() => setPhase("idle")} variant="outline" className="border-zinc-800">
                back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === "playing" && problem) {
    return (
      <Card className="border-zinc-800/60 bg-[#0d0d0d]">
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">{questionCount + 1}</Badge>
              <span>·</span>
              <span className="capitalize">{problem.topic}</span>
              <span>·</span>
              <Badge variant="outline" className={cn("text-[10px] uppercase",
                problem.difficulty === "easy" ? "text-emerald-400 border-emerald-400/30" :
                problem.difficulty === "medium" ? "text-amber-400 border-amber-400/30" :
                "text-rose-400 border-rose-400/30"
              )}>{problem.difficulty}</Badge>
            </div>
            {streak > 1 && (
              <span className="text-orange-400 flex items-center gap-1">
                <Zap className="h-3 w-3" /> {streak} streak
              </span>
            )}
          </div>

          <p className="text-zinc-100 text-base leading-relaxed">{problem.question}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {problem.choices.map((choice, i) => {
              const isSelected = selected === choice;
              const isCorrect = String(choice) === String(problem.answer);
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(choice)}
                  disabled={showFeedback}
                  className={cn(
                    "p-3 text-left border transition-colors text-sm",
                    !showFeedback && "hover:border-zinc-600",
                    showFeedback && isCorrect && "border-emerald-500 bg-emerald-500/10",
                    showFeedback && isSelected && !isCorrect && "border-rose-500 bg-rose-500/10",
                    showFeedback && !isSelected && !isCorrect && "border-zinc-800 opacity-50",
                    !showFeedback && isSelected && "border-[#c4f000] bg-[#c4f000]/5",
                    !showFeedback && !isSelected && "border-zinc-800"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-5 h-5 shrink-0 flex items-center justify-center text-[10px] font-mono",
                      showFeedback && isCorrect ? "bg-emerald-500 text-black" :
                      showFeedback && isSelected && !isCorrect ? "bg-rose-500 text-white" :
                      "bg-zinc-800 text-zinc-400"
                    )}>
                      {showFeedback && isCorrect ? "✓" :
                       showFeedback && isSelected && !isCorrect ? "✗" :
                       String.fromCharCode(65 + i)}
                    </span>
                    <span className="font-mono text-xs">{choice}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className="space-y-2">
              <div className={cn(
                "p-2.5 border text-xs",
                selected === String(problem.answer)
                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                  : "border-rose-500/30 bg-rose-500/5 text-rose-300"
              )}>
                {selected === String(problem.answer) ? "correct! +" + problem.xp + " XP" : "the answer was " + problem.answer}
              </div>
              <div className="flex gap-2">
                <Button onClick={next} className="flex-1 bg-[#c4f000] text-black hover:bg-[#b3d800]">
                  <ArrowRight className="h-3.5 w-3.5 mr-1" /> next
                </Button>
                <Button onClick={done} variant="outline" className="border-zinc-800">
                  finish
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-800/60 bg-[#0d0d0d]">
      <CardContent className="pt-5 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#c4f000]" />
          <span className="font-semibold text-sm">quick practice</span>
          <Badge variant="outline" className="ml-auto border-zinc-700 text-zinc-400 text-[10px]">
            1 question
          </Badge>
        </div>

        {problem && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-300 line-clamp-2">{problem.question}</p>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px] capitalize">{problem.topic}</Badge>
              <Badge variant="outline" className={cn("text-[10px] uppercase",
                problem.difficulty === "easy" ? "text-emerald-400 border-emerald-400/30" :
                problem.difficulty === "medium" ? "text-amber-400 border-amber-400/30" :
                "text-rose-400 border-rose-400/30"
              )}>{problem.difficulty}</Badge>
            </div>
          </div>
        )}

        <Button onClick={start} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800]">
          <Zap className="h-4 w-4 mr-2" /> start quick practice
        </Button>
      </CardContent>
    </Card>
  );
}
