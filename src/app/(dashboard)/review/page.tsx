"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  RotateCcw, X, Check, Brain, Clock, Flame, Sparkles, ChevronRight, Target, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getProblems } from "@/lib/problems";
import {
  newCard, scheduleReview, isDue, formatInterval, ReviewState, Rating,
} from "@/lib/srs";
import { getState, subscribe, pingActivity, markProblemSolved } from "@/lib/local-state";

const STORAGE_KEY = "mathitout-srs-v1";

type ReviewStore = Record<string, ReviewState>;

function loadStore(): ReviewStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as ReviewStore;
  } catch {
    return {};
  }
}

function saveStore(store: ReviewStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

const difficultyColor = {
  easy: "text-emerald-400 border-emerald-400/30",
  medium: "text-amber-400 border-amber-400/30",
  hard: "text-rose-400 border-rose-400/30",
};

export default function ReviewPage() {
  const problems = getProblems();
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const [store, setStore] = useState<ReviewStore>({});
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

  useEffect(() => {
    pingActivity();
    setStore(loadStore());
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  // Get due problems
  const dueProblems = problems.filter((p) => {
    const card = store[p.slug];
    if (!card) return true; // never reviewed = due
    return isDue(card);
  });

  const next = currentSlug ? problems.find((p) => p.slug === currentSlug) : dueProblems[0];

  const handleRate = useCallback((rating: Rating) => {
    if (!next) return;
    const current = store[next.slug] || newCard();
    const updated = scheduleReview(current, rating);
    const nextStore = { ...store, [next.slug]: updated };
    setStore(nextStore);
    saveStore(nextStore);

    if (rating >= 3) {
      markProblemSolved(next.slug, next.xp, 1);
    }

    // Move to next due problem
    const stillDue = problems.filter((p) => {
      if (p.slug === next.slug) return false;
      const card = nextStore[p.slug];
      if (!card) return true;
      return isDue(card);
    });
    setCurrentSlug(stillDue[0]?.slug || null);
    setShowAnswer(false);
    setUserAnswer("");

    if (rating === 1) {
      toast({ title: "keep practicing", description: "this one will come back tomorrow" });
    } else if (rating === 4) {
      toast({ title: "nailed it", description: `next review in ${formatInterval(updated.interval)}` });
    } else {
      toast({ title: "good", description: `next review in ${formatInterval(updated.interval)}` });
    }
  }, [next, store, problems, toast]);

  const startSession = () => {
    if (dueProblems.length === 0) {
      toast({ title: "all caught up", description: "no problems due right now. come back later." });
      return;
    }
    setCurrentSlug(dueProblems[0].slug);
    setShowAnswer(false);
    setUserAnswer("");
  };

  if (!next) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// srs review</div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-7 w-7" />
            spaced review
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">problems resurface at the right time. your brain remembers more with less effort.</p>
        </div>

        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
          <div className="grid sm:grid-cols-3 gap-px bg-zinc-800/60 border border-zinc-800/60">
            <div className="bg-[#0a0a0a] p-4">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">due now</div>
              <div className="text-2xl font-bold text-[#c4f000] mt-1">{dueProblems.length}</div>
            </div>
            <div className="bg-[#0a0a0a] p-4">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">total cards</div>
              <div className="text-2xl font-bold text-zinc-100 mt-1">{Object.keys(store).length}</div>
            </div>
            <div className="bg-[#0a0a0a] p-4">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">total problems</div>
              <div className="text-2xl font-bold text-zinc-100 mt-1">{problems.length}</div>
            </div>
          </div>
        </div>

        {dueProblems.length === 0 ? (
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-12 text-center space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-[#c4f000]" />
            <div>
              <h3 className="text-lg font-semibold">all caught up</h3>
              <p className="text-sm text-zinc-500 max-w-md mx-auto mt-1">
                no problems are due right now. the spaced repetition system will bring them back at the right time.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={() => {
                // Force review all unsolved problems
                const unsolved = problems.filter((p) => !store[p.slug]);
                if (unsolved.length > 0) {
                  setCurrentSlug(unsolved[0].slug);
                }
              }} className="bg-[#c4f000] text-black hover:bg-[#b3d800]">
                study new cards
              </Button>
              <Button asChild variant="outline" className="border-zinc-800">
                <Link href="/solve">open problem set <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-12 text-center space-y-4">
            <Target className="h-12 w-12 mx-auto text-zinc-500" />
            <div>
              <h3 className="text-lg font-semibold">ready to review?</h3>
              <p className="text-sm text-zinc-500 mt-1">
                {dueProblems.length} problem{dueProblems.length !== 1 ? "s" : ""} due for review
              </p>
            </div>
            <Button onClick={startSession} className="bg-[#c4f000] text-black hover:bg-[#b3d800]">
              start review session <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
          <h3 className="font-semibold mb-3">your card stats</h3>
          <div className="space-y-2 text-sm">
            {Object.entries(store).slice(0, 10).map(([slug, card]) => {
              const problem = problems.find((p) => p.slug === slug);
              if (!problem) return null;
              return (
                <div key={slug} className="flex items-center justify-between border border-zinc-800/40 px-3 py-2">
                  <span className="text-zinc-300">{problem.title}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-zinc-500">{card.interval}d</span>
                    <Badge variant="outline" className={cn("text-[10px]", difficultyColor[problem.difficulty])}>
                      {problem.difficulty}
                    </Badge>
                  </div>
                </div>
              );
            })}
            {Object.keys(store).length === 0 && (
              <p className="text-zinc-500 text-sm">no cards yet. start a session to create your first cards.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Review session
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// review session</div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6" />
            {next.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", difficultyColor[next.difficulty])}>
            {next.difficulty}
          </Badge>
          <span className="text-[10px] text-zinc-600 font-mono">+{next.xp} XP</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        <div className="border border-zinc-800/60 bg-[#0d0d0d]">
          <div className="p-5 border-b border-zinc-800/60 flex items-center justify-between">
            <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">// problem</div>
            <span className="text-[10px] text-zinc-600 font-mono">{Object.keys(store).length} cards · {dueProblems.length} due</span>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-zinc-300 leading-relaxed">{next.description}</p>
            <div className="border border-zinc-800 bg-[#0a0a0a] p-4 font-mono text-zinc-100">
              {next.examples[0]?.input}
            </div>

            {!showAnswer ? (
              <div className="space-y-3">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="type your answer here..."
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 font-mono p-3 resize-none focus:border-[#c4f000] focus:outline-none"
                  rows={3}
                />
                <Button
                  onClick={() => setShowAnswer(true)}
                  className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold"
                >
                  show answer <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest mb-1">// answer</div>
                  <div className="font-mono text-emerald-300">{next.examples[0]?.output}</div>
                </div>
                <p className="text-sm text-zinc-400">{next.examples[0]?.explanation}</p>

                <div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2 text-center">// how well did you know this?</div>
                  <div className="grid grid-cols-4 gap-2">
                    {([
                      { rating: 1 as Rating, label: "again", color: "border-rose-500/30 text-rose-400 hover:bg-rose-500/10", interval: "1d" },
                      { rating: 2 as Rating, label: "hard", color: "border-amber-500/30 text-amber-400 hover:bg-amber-500/10", interval: "soon" },
                      { rating: 3 as Rating, label: "good", color: "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10", interval: "days" },
                      { rating: 4 as Rating, label: "easy", color: "border-[#c4f000]/30 text-[#c4f000] hover:bg-[#c4f000]/10", interval: "weeks" },
                    ]).map((r) => (
                      <button
                        key={r.rating}
                        onClick={() => handleRate(r.rating)}
                        className={cn("p-3 border text-xs font-mono uppercase tracking-wider transition-colors", r.color)}
                      >
                        <div>{r.label}</div>
                        <div className="text-[9px] opacity-60 mt-1">{r.interval}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
            <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">// session</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">reviewed</span>
                <span className="text-zinc-200 font-mono">{Object.keys(store).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">remaining</span>
                <span className="text-[#c4f000] font-mono">{dueProblems.length}</span>
              </div>
            </div>
          </div>

          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
            <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">// how it works</div>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex gap-2">
                <span className="text-rose-400">again</span>
                <span>forgot. see it again tomorrow.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">hard</span>
                <span>recalled with effort. soon.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">good</span>
                <span>recalled correctly. days.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#c4f000]">easy</span>
                <span>trivially. weeks.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
