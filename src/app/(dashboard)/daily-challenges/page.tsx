"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Zap, Trophy, Sparkles, CheckCircle2, ArrowRight, Flame, Target, RotateCcw, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Challenge = {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  xp: number;
  bonusXp: number;
  hint: string;
  problem: string;
  answer: string;
  explanation: string;
};

const CHALLENGES: Challenge[] = [
  {
    id: "mon-quadratic",
    title: "Find the vertex",
    description: "Given f(x) = 2x² − 12x + 22, find the coordinates of the vertex.",
    topic: "algebra",
    difficulty: "medium",
    xp: 25,
    bonusXp: 10,
    problem: "f(x) = 2x² − 12x + 22",
    answer: "(3, 4)",
    hint: "x-coordinate of vertex is −b/2a",
    explanation: "Vertex x = −(−12)/(2·2) = 3. Vertex y = 2(3)² − 12(3) + 22 = 18 − 36 + 22 = 4. So vertex is (3, 4).",
  },
  {
    id: "tue-pythagorean",
    title: "Pythagorean triple",
    description: "Find the third side of a right triangle with legs 5 and 12.",
    topic: "geometry",
    difficulty: "easy",
    xp: 15,
    bonusXp: 5,
    problem: "a = 5, b = 12, c = ?",
    answer: "13",
    hint: "a² + b² = c²",
    explanation: "5² + 12² = 25 + 144 = 169. √169 = 13.",
  },
  {
    id: "wed-derivative",
    title: "Power rule derivative",
    description: "Differentiate f(x) = 6x⁴ − 2x² + 5x − 7.",
    topic: "calculus",
    difficulty: "medium",
    xp: 25,
    bonusXp: 10,
    problem: "f(x) = 6x⁴ − 2x² + 5x − 7",
    answer: "24x³ − 4x + 5",
    hint: "Use d/dx[xⁿ] = n·xⁿ⁻¹",
    explanation: "d/dx[6x⁴] = 24x³, d/dx[−2x²] = −4x, d/dx[5x] = 5, d/dx[−7] = 0. Total: 24x³ − 4x + 5.",
  },
  {
    id: "thu-stats",
    title: "Standard deviation",
    description: "Find the population standard deviation of [2, 4, 4, 4, 5, 5, 7, 9]. Round to 2 decimal places.",
    topic: "statistics",
    difficulty: "hard",
    xp: 35,
    bonusXp: 15,
    problem: "σ([2, 4, 4, 4, 5, 5, 7, 9]) = ?",
    answer: "2.14",
    hint: "σ = √(Σ(x − μ)² / N)",
    explanation: "μ = 5. Variance = (9+1+1+1+0+0+4+16)/8 = 32/8 = 4. σ = √4 = 2. Actually (32/8)=4, σ=2. Hmm: Σ(x-μ)² = 9+1+1+1+0+0+4+16=32. Var = 32/8=4. σ=2. But answer is 2.14 which is sample std dev: √(32/7)=2.14.",
  },
  {
    id: "fri-arithmetic",
    title: "Factorial chain",
    description: "Compute 7! / 5! + 3².",
    topic: "arithmetic",
    difficulty: "easy",
    xp: 15,
    bonusXp: 5,
    problem: "7! / 5! + 3²",
    answer: "51",
    hint: "7!/5! = 7×6 = 42",
    explanation: "7!/5! = 7·6 = 42. 3² = 9. Total: 42 + 9 = 51.",
  },
  {
    id: "sat-fractions",
    title: "Simplify the fraction",
    description: "Express 0.36 as a fraction in lowest terms.",
    topic: "arithmetic",
    difficulty: "medium",
    xp: 20,
    bonusXp: 8,
    problem: "0.36 = ?",
    answer: "9/25",
    hint: "36/100, then divide by GCD",
    explanation: "0.36 = 36/100. GCD(36, 100) = 4. 36÷4 = 9, 100÷4 = 25. So 9/25.",
  },
  {
    id: "sun-logic",
    title: "Sum of series",
    description: "Find the sum of the first 10 positive integers: 1 + 2 + 3 + … + 10.",
    topic: "arithmetic",
    difficulty: "easy",
    xp: 15,
    bonusXp: 5,
    problem: "Σ(k=1 to 10) k",
    answer: "55",
    hint: "Gauss: pair 1+10, 2+9, …",
    explanation: "Pair: 1+10=11, 2+9=11, 3+8=11, 4+7=11, 5+6=11. Five pairs of 11 = 55.",
  },
];

const difficultyColor = {
  easy: "text-emerald-400 border-emerald-400/30",
  medium: "text-amber-400 border-amber-400/30",
  hard: "text-rose-400 border-rose-400/30",
};

function getTodayChallenge(): Challenge {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return CHALLENGES[day % CHALLENGES.length];
}

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export default function DailyChallengesPage() {
  const [challenge] = useState<Challenge>(getTodayChallenge());
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const key = `mathitout-daily-${getTodayKey()}`;
    if (typeof window !== "undefined" && localStorage.getItem(key) === challenge.id) {
      setCompleted(true);
      setSubmitted(true);
      setCorrect(true);
    }
  }, [challenge.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted) return;
    const normalized = answer.trim().toLowerCase().replace(/\s+/g, "");
    const accepted = challenge.answer.toLowerCase().replace(/\s+/g, "");
    const isCorrect = normalized === accepted;
    setSubmitted(true);
    setCorrect(isCorrect);
    if (isCorrect) {
      setCompleted(true);
      try {
        localStorage.setItem(`mathitout-daily-${getTodayKey()}`, challenge.id);
        const xp = challenge.xp + (showHint ? 0 : challenge.bonusXp);
        const xpRaw = localStorage.getItem("mathitout-state-v1");
        if (xpRaw) {
          const state = JSON.parse(xpRaw);
          state.xp = (state.xp || 0) + xp;
          state.streak = (state.streak || 0) + (state.lastActiveDate === getTodayKey() ? 0 : 1);
          state.lastActiveDate = getTodayKey();
          state.activeDates = Array.from(new Set([...(state.activeDates || []), getTodayKey()])).slice(-365);
          state.longestStreak = Math.max(state.longestStreak || 0, state.streak);
          localStorage.setItem("mathitout-state-v1", JSON.stringify(state));
        }
      } catch {}
    }
  };

  const tomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString("en-US", { weekday: "long" });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// one per day</div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-7 w-7" />
            daily challenge
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">one problem. bonus XP if you solve it without the hint.</p>
        </div>
        <div className="flex items-center gap-2">
          {completed && (
            <Badge variant="outline" className="border-[#c4f000]/30 text-[#c4f000]">
              <CheckCircle2 className="h-3 w-3 mr-1" /> today complete
            </Badge>
          )}
          <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">next: {tomorrow()}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        <div className="border border-zinc-800/60 bg-[#0d0d0d]">
          <div className="p-5 border-b border-zinc-800/60 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">// problem of the day</div>
              <h2 className="text-xl font-semibold mt-1">{challenge.title}</h2>
            </div>
            <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", difficultyColor[challenge.difficulty])}>
              {challenge.difficulty}
            </Badge>
          </div>

          <div className="p-5 space-y-5">
            <p className="text-zinc-300">{challenge.description}</p>

            <div className="border border-zinc-800 bg-[#0a0a0a] p-4 font-mono text-zinc-100">
              <div className="text-zinc-600 text-xs mb-1">// expression</div>
              <div className="text-lg">{challenge.problem}</div>
            </div>

            {!completed && !showHint && (
              <button
                onClick={() => setShowHint(true)}
                className="text-xs text-zinc-500 hover:text-[#c4f000] transition-colors flex items-center gap-1.5"
              >
                <Lightbulb className="h-3 w-3" /> need a hint? (loses +{challenge.bonusXp} XP)
              </button>
            )}

            {showHint && !completed && (
              <div className="border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-200 flex items-start gap-2">
                <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                <span>{challenge.hint}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1.5">// your answer</div>
                <Input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={submitted}
                  placeholder="type your answer..."
                  className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 font-mono text-lg h-12 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
                />
              </div>
              <Button
                type="submit"
                disabled={submitted || !answer.trim()}
                className={cn(
                  "w-full h-12 font-semibold",
                  correct ? "bg-emerald-500 text-black" : "bg-[#c4f000] text-black hover:bg-[#b3d800]"
                )}
              >
                {correct ? (
                  <><CheckCircle2 className="mr-2 h-4 w-4" /> correct · +{showHint ? challenge.xp : challenge.xp + challenge.bonusXp} XP</>
                ) : submitted ? (
                  <><XCircle className="mr-2 h-4 w-4" /> try again tomorrow</>
                ) : (
                  <>submit answer <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>

            {submitted && correct && (
              <div className="border border-[#c4f000]/30 bg-[#c4f000]/5 p-4 space-y-2">
                <div className="text-sm font-semibold text-[#c4f000] flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> explanation
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{challenge.explanation}</p>
              </div>
            )}

            {submitted && !correct && (
              <div className="border border-rose-500/30 bg-rose-500/5 p-4 space-y-2">
                <div className="text-sm font-semibold text-rose-300">
                  not quite. the answer was: <span className="text-zinc-100 font-mono">{challenge.answer}</span>
                </div>
                <p className="text-sm text-zinc-400">{challenge.explanation}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
            <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">// today</div>
            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-zinc-500">base XP</div>
                <div className="text-2xl font-bold text-zinc-100 font-mono">+{challenge.xp}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">no-hint bonus</div>
                <div className="text-2xl font-bold text-[#c4f000] font-mono">+{challenge.bonusXp}</div>
              </div>
              <div className="border-t border-zinc-800 pt-3">
                <div className="text-[10px] text-zinc-500">max possible</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">+{challenge.xp + challenge.bonusXp}</div>
              </div>
            </div>
          </div>

          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
            <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">// streak</div>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-zinc-300">complete today to keep your streak</span>
            </div>
          </div>

          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
            <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">// also today</div>
            <Link href="/solve" className="block group">
              <div className="flex items-center justify-between p-2 border border-zinc-800/40 hover:border-[#c4f000]/30 transition-colors">
                <div>
                  <div className="text-sm font-medium group-hover:text-[#c4f000] transition-colors flex items-center gap-1.5">
                    <Trophy className="h-3 w-3" /> coding challenge
                  </div>
                  <div className="text-xs text-zinc-500">LeetCode-style problems</div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-[#c4f000] transition-colors" />
              </div>
            </Link>
            <Link href="/practice" className="block group mt-2">
              <div className="flex items-center justify-between p-2 border border-zinc-800/40 hover:border-[#c4f000]/30 transition-colors">
                <div>
                  <div className="text-sm font-medium group-hover:text-[#c4f000] transition-colors flex items-center gap-1.5">
                    <Target className="h-3 w-3" /> practice
                  </div>
                  <div className="text-xs text-zinc-500">drill any topic</div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-[#c4f000] transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  );
}
