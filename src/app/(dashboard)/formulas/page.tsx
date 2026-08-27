"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2, XCircle, ArrowRight, RotateCcw, Lightbulb, Target,
  ChevronRight, Trophy, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formulaSheets, Formula } from "@/lib/formulas";
import { getState, subscribe, markProblemSolved } from "@/lib/local-state";

const KEY = "mathitout-formula-progress-v1";

type Progress = Record<string, { correct: number; attempts: number }>;

function loadProgress(): Progress {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

function saveProgress(p: Progress) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}

type Question = {
  formula: Formula;
  sheetName: string;
  sheetSlug: string;
  masked: string;
  blanks: string[];
  hint: string;
};

function generateQuestion(formula: Formula, sheetName: string, sheetSlug: string): Question {
  // Extract the "= ... " portion and blank out the right side
  const eq = formula.latex.indexOf("=");
  const left = eq > -1 ? formula.latex.slice(0, eq + 1) : formula.latex;
  const right = eq > -1 ? formula.latex.slice(eq + 1) : "";
  return {
    formula,
    sheetName,
    sheetSlug,
    masked: eq > -1 ? left.trimEnd() + " ______" : formula.latex + " → ______",
    blanks: right.trim() ? [right.trim()] : [formula.name],
    hint: formula.when || formula.description,
  };
}

export default function FormulaPracticePage() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const [progress, setProgress] = useState<Progress>({});
  const [selectedSheet, setSelectedSheet] = useState<string>("algebra-1");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, xp: 0 });

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    setProgress(loadProgress());
  }, [tick]);

  useEffect(() => {
    const sheet = formulaSheets.find((s) => s.courseSlug === selectedSheet);
    if (!sheet) return;
    const shuffled = [...sheet.formulas].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 5).map((f) => generateQuestion(f, sheet.title, sheet.courseSlug)));
    setCurrentIdx(0);
    setUserAnswer("");
    setShowFeedback(false);
    setShowHint(false);
    setSessionStats({ correct: 0, total: 0, xp: 0 });
  }, [selectedSheet]);

  const state = getState();
  void tick;

  const currentQ = questions[currentIdx];
  const currentProgress = currentQ ? progress[`${currentQ.sheetSlug}:${currentQ.formula.name}`] : null;

  const handleAnswer = () => {
    if (!currentQ) return;
    const isCorrect = userAnswer.trim() === currentQ.blanks[0] ||
      currentQ.formula.name.toLowerCase().includes(userAnswer.trim().toLowerCase());
    setShowFeedback(true);
    setSessionStats((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
      xp: s.xp + (isCorrect ? 10 : 0),
    }));
    const key = `${currentQ.sheetSlug}:${currentQ.formula.name}`;
    setProgress((p) => {
      const updated = {
        ...p,
        [key]: {
          correct: (p[key]?.correct || 0) + (isCorrect ? 1 : 0),
          attempts: (p[key]?.attempts || 0) + 1,
        },
      };
      saveProgress(updated);
      return updated;
    });
    if (isCorrect) {
      markProblemSolved(`formula-${key}`, 10, 1);
    }
  };

  const handleNext = () => {
    setUserAnswer("");
    setShowFeedback(false);
    setShowHint(false);
    if (currentIdx + 1 >= questions.length) {
      if (sessionStats.total > 0) {
        toast({
          title: "session complete",
          description: `${sessionStats.correct}/${sessionStats.total} correct · +${sessionStats.xp} XP`,
        });
      }
      // Reshuffle
      const sheet = formulaSheets.find((s) => s.courseSlug === selectedSheet);
      if (sheet) {
        const shuffled = [...sheet.formulas].sort(() => Math.random() - 0.5);
        setQuestions(shuffled.slice(0, 5).map((f) => generateQuestion(f, sheet.title, sheet.courseSlug)));
        setCurrentIdx(0);
        setSessionStats({ correct: 0, total: 0, xp: 0 });
      }
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  const isCorrect = currentQ && (userAnswer.trim() === currentQ.blanks[0] ||
    currentQ.formula.name.toLowerCase().includes(userAnswer.trim().toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// fill in the blank</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-7 w-7" />
          formula practice
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">type the right side of each formula. builds instant recall.</p>
      </div>

      {/* Sheet selector */}
      <div className="flex gap-1.5 flex-wrap">
        {formulaSheets.map((s) => (
          <button
            key={s.courseSlug}
            onClick={() => setSelectedSheet(s.courseSlug)}
            className={cn(
              "px-3 py-1.5 text-xs border transition-colors",
              selectedSheet === s.courseSlug
                ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
            )}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-zinc-500">{currentIdx + 1}/{questions.length}</span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">session: <span className="text-emerald-400">{sessionStats.correct}</span>/<span className="text-zinc-400">{sessionStats.total}</span></span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">xp: <span className="text-[#c4f000]">+{sessionStats.xp}</span></span>
          </div>
        </div>
      </div>

      {currentQ ? (
        <div className="border border-zinc-800/60 bg-[#0d0d0d]">
          <div className="p-6">
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-3">// fill in the blank</div>
            <div className="border border-zinc-800 bg-[#0a0a0a] p-6 text-center mb-6">
              <div className="font-mono text-2xl text-zinc-100">{currentQ.masked}</div>
            </div>

            {!showFeedback && (
              <div className="space-y-3">
                {!showHint && (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-xs text-zinc-500 hover:text-amber-400 flex items-center gap-1.5"
                  >
                    <Lightbulb className="h-3 w-3" /> show hint
                  </button>
                )}
                {showHint && (
                  <div className="p-3 border border-amber-500/30 bg-amber-500/5 text-sm text-amber-200 flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>{currentQ.hint}</span>
                  </div>
                )}

                <Input
                  autoFocus
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && userAnswer.trim()) handleAnswer(); }}
                  placeholder="type the answer..."
                  className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 text-lg h-12 font-mono placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
                />
                <Button
                  onClick={handleAnswer}
                  disabled={!userAnswer.trim()}
                  className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold h-12"
                >
                  check <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {showFeedback && (
              <div className="space-y-3">
                <div className={cn(
                  "p-3 border text-sm",
                  isCorrect
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/5 text-rose-300"
                )}>
                  {isCorrect ? (
                    <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> correct! +10 XP</span>
                  ) : (
                    <span className="flex items-center gap-2"><XCircle className="h-4 w-4" /> the answer was: <code className="font-mono text-zinc-100 ml-1">{currentQ.blanks[0]}</code></span>
                  )}
                </div>
                <div className="p-3 border border-zinc-800 bg-[#0a0a0a] text-sm text-zinc-400">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">// full formula</div>
                  <div className="font-mono text-zinc-200">{currentQ.formula.latex}</div>
                  <p className="text-xs text-zinc-500 mt-1">{currentQ.formula.description}</p>
                </div>
                <Button onClick={handleNext} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold">
                  {currentIdx + 1 >= questions.length ? "finish session" : "next formula"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-12 text-center">
          <p className="text-zinc-500">loading formulas...</p>
        </div>
      )}
    </div>
  );
}
