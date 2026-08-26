"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2, XCircle, ArrowRight, RotateCcw, Brain, Sparkles,
  ChevronRight, Lightbulb, Zap, Target, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateQuiz, GeneratedProblem } from "@/lib/problem-generator";
import { recordAttempt, getPerformance } from "@/lib/adaptive-difficulty";
import { markProblemSolved, getState, subscribe } from "@/lib/local-state";
import { SolutionSteps } from "@/components/solution-steps";

type QuizConfig = {
  topic: string | "mixed";
  difficulty: "easy" | "medium" | "hard" | "mixed" | "adaptive";
  numQuestions: number;
};

export default function QuizPage() {
  const { toast } = useToast();
  const [phase, setPhase] = useState<"setup" | "playing" | "results">("setup");
  const [config, setConfig] = useState<QuizConfig>({
    topic: "mixed",
    difficulty: "adaptive",
    numQuestions: 10,
  });
  const [questions, setQuestions] = useState<GeneratedProblem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; selected: string; correct: boolean; time: number }[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const state = getState();
  void tick;

  const startQuiz = useCallback(() => {
    let diff = config.difficulty;
    if (diff === "adaptive") {
      const perf = getPerformance();
      const overall = Object.values(perf).reduce((s, p) => s + p.accuracy, 0) / Math.max(Object.values(perf).length, 1);
      if (overall >= 0.8) diff = "hard";
      else if (overall >= 0.5) diff = "medium";
      else diff = "easy";
    }
    const qs = generateQuiz(config.topic, config.numQuestions, diff as "easy" | "medium" | "hard" | "mixed");
    setQuestions(qs);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswers([]);
    setStartTime(Date.now());
    setPhase("playing");
  }, [config]);

  const handleAnswer = useCallback((answer: string) => {
    if (showFeedback) return;
    const q = questions[currentIdx];
    const isCorrect = String(answer) === String(q.answer);
    setSelectedAnswer(answer);
    setShowFeedback(true);
    setShowHint(false);
    recordAttempt(q.topic, q.difficulty, isCorrect);
    setAnswers((prev) => [...prev, { questionId: q.id, selected: answer, correct: isCorrect, time: Date.now() - startTime }]);
    if (isCorrect) {
      markProblemSolved(q.id, q.xp, 1);
    }
  }, [questions, currentIdx, showFeedback, startTime]);

  const handleNext = useCallback(() => {
    if (currentIdx + 1 >= questions.length) {
      setPhase("results");
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  }, [currentIdx, questions.length]);

  const totalCorrect = answers.filter((a) => a.correct).length;
  const totalTime = answers.reduce((s, a) => s + a.time, 0) / 1000;
  const xpEarned = answers.reduce((s, a) => {
    if (a.correct) {
      const q = questions.find((q) => q.id === a.questionId);
      return s + (q?.xp || 0);
    }
    return s;
  }, 0);

  if (phase === "setup") {
    return (
      <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// dynamic practice</div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-7 w-7" />
            start a quiz
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">unlimited unique problems. generated fresh every time.</p>
        </div>

        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5 space-y-5">
          <div>
            <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2 block">topic</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: "mixed", label: "Mixed", icon: "⚡" },
                { id: "algebra", label: "Algebra", icon: "ƒ" },
                { id: "arithmetic", label: "Arithmetic", icon: "∑" },
                { id: "geometry", label: "Geometry", icon: "△" },
                { id: "statistics", label: "Statistics", icon: "σ" },
                { id: "calculus", label: "Calculus", icon: "∫" },
                { id: "trigonometry", label: "Trigonometry", icon: "∠" },
                { id: "word-problems", label: "Word Problems", icon: "📖" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setConfig((c) => ({ ...c, topic: t.id }))}
                  className={cn(
                    "px-3 py-2 text-xs border transition-colors text-left",
                    config.topic === t.id
                      ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                      : "border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  )}
                >
                  <span className="mr-1.5">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2 block">difficulty</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: "adaptive", label: "Adaptive" },
                { id: "easy", label: "Easy" },
                { id: "medium", label: "Medium" },
                { id: "hard", label: "Hard" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setConfig((c) => ({ ...c, difficulty: d.id as QuizConfig["difficulty"] }))}
                  className={cn(
                    "px-3 py-2 text-xs border transition-colors",
                    config.difficulty === d.id
                      ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                      : "border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2 block">number of questions</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[5, 10, 20, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => setConfig((c) => ({ ...c, numQuestions: n }))}
                  className={cn(
                    "px-3 py-2 text-xs border transition-colors",
                    config.numQuestions === n
                      ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                      : "border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={startQuiz} className="w-full h-12 bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold">
            start quiz <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const accuracy = (totalCorrect / questions.length) * 100;
    return (
      <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// results</div>
          <h1 className="text-3xl font-bold tracking-tight">quiz complete</h1>
        </div>

        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-6">
          <div className="grid grid-cols-3 gap-px bg-zinc-800/60 border border-zinc-800/60">
            <div className="bg-[#0d0d0d] p-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">score</div>
              <div className="text-3xl font-bold text-[#c4f000] mt-1 font-mono">{Math.round(accuracy)}%</div>
            </div>
            <div className="bg-[#0d0d0d] p-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">correct</div>
              <div className="text-3xl font-bold text-zinc-100 mt-1 font-mono">{totalCorrect}/{questions.length}</div>
            </div>
            <div className="bg-[#0d0d0d] p-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">xp earned</div>
              <div className="text-3xl font-bold text-emerald-400 mt-1 font-mono">+{xpEarned}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={startQuiz} className="flex-1 bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold">
            <RotateCcw className="mr-2 h-4 w-4" /> new quiz
          </Button>
          <Button onClick={() => setPhase("setup")} variant="outline" className="border-zinc-800">
            change settings
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
            question {currentIdx + 1} / {questions.length}
          </div>
          <Progress value={((currentIdx + (showFeedback ? 1 : 0)) / questions.length) * 100} className="w-32 h-1" />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider",
            q.difficulty === "easy" ? "text-emerald-400 border-emerald-400/30" :
            q.difficulty === "medium" ? "text-amber-400 border-amber-400/30" :
            "text-rose-400 border-rose-400/30"
          )}>
            {q.difficulty}
          </Badge>
          <span className="text-[10px] text-zinc-600 font-mono capitalize">{q.topic}</span>
        </div>
      </div>

      <div className="border border-zinc-800/60 bg-[#0d0d0d]">
        <div className="p-6 sm:p-8">
          <p className="text-lg text-zinc-100 leading-relaxed mb-6">{q.question}</p>

          {!showFeedback && (
            <div className="flex items-center gap-2 mb-4">
              <Button
                onClick={() => setShowHint(true)}
                variant="ghost"
                size="sm"
                className="text-zinc-500 hover:text-amber-400"
              >
                <Lightbulb className="h-3.5 w-3.5 mr-1" /> show hint
              </Button>
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
                      {showFeedback && isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                       showFeedback && isSelected && !isCorrect ? <XCircle className="h-3.5 w-3.5" /> :
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
                {selectedAnswer === String(q.answer) ? (
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> correct! +{q.xp} XP</span>
                ) : (
                  <span className="flex items-center gap-2"><XCircle className="h-4 w-4" /> correct answer: {String(q.answer)}</span>
                )}
              </div>
              <div className="p-3 border border-zinc-800 bg-[#0a0a0a] text-sm text-zinc-400">
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" /> explanation
                </div>
                {q.explanation}
              </div>
              {!showSolution ? (
                <Button
                  onClick={() => setShowSolution(true)}
                  variant="outline"
                  className="w-full border-zinc-800 hover:border-zinc-700"
                >
                  <ChevronRight className="h-3.5 w-3.5 mr-1" /> show step-by-step solution
                </Button>
              ) : (
                <SolutionSteps problem={q} onClose={() => setShowSolution(false)} />
              )}
              <Button onClick={handleNext} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold">
                {currentIdx + 1 >= questions.length ? "see results" : "next question"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
