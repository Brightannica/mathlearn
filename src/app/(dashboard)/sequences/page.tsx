"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RotateCcw, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getState, subscribe, markProblemSolved } from "@/lib/local-state";

type Sequence = {
  id: string;
  name: string;
  fn: (n: number) => number;
  detect: (terms: number[]) => { type: "arithmetic" | "geometric" | "neither"; d?: number; r?: number };
};

const SEQUENCES: Sequence[] = [
  { id: "fib", name: "fibonacci", fn: (n) => {
    if (n <= 0) return 0;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
    return n === 1 ? 1 : b;
  }, detect: (t) => ({ type: "neither" }) },
  { id: "triangular", name: "triangular numbers", fn: (n) => n * (n + 1) / 2, detect: (t) => {
    if (t.length < 3) return { type: "neither" };
    const d1 = t[1] - t[0], d2 = t[2] - t[1];
    return d1 === d2 ? { type: "arithmetic", d: d1 } : { type: "neither" };
  } },
  { id: "squares", name: "perfect squares", fn: (n) => n * n, detect: (t) => ({ type: "neither" }) },
  { id: "cubes", name: "perfect cubes", fn: (n) => n * n * n, detect: (t) => ({ type: "neither" }) },
  { id: "powers2", name: "powers of 2", fn: (n) => Math.pow(2, n - 1), detect: (t) => {
    if (t.length < 2) return { type: "neither" };
    const r = t[1] / t[0];
    return t.every((v, i) => i === 0 || Math.abs(v / t[i - 1] - r) < 0.01) ? { type: "geometric", r } : { type: "neither" };
  } },
  { id: "primes", name: "prime numbers", fn: (n) => {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113];
    return n <= 0 ? 0 : n <= primes.length ? primes[n - 1] : 0;
  }, detect: (t) => ({ type: "neither" }) },
];

export default function SequenceAnalyzerPage() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const [sequenceId, setSequenceId] = useState("fib");
  const [numTerms, setNumTerms] = useState(10);
  const [customA1, setCustomA1] = useState(3);
  const [customD, setCustomD] = useState(5);
  const [customR, setCustomR] = useState(2);
  const [customType, setCustomType] = useState<"arithmetic" | "geometric">("arithmetic");
  const [challenge, setChallenge] = useState<{ type: string; question: string; answer: number } | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mathitout-seq-score");
      if (stored) {
        try { setScore(JSON.parse(stored)); } catch {}
      }
    }
  }, [tick]);

  const state = getState();
  void tick;

  const sequence = SEQUENCES.find((s) => s.id === sequenceId)!;

  const terms = useMemo(() => {
    const result: number[] = [];
    for (let i = 1; i <= numTerms; i++) {
      result.push(sequence.fn(i));
    }
    return result;
  }, [sequence, numTerms]);

  const customTerms = useMemo(() => {
    const result: number[] = [];
    if (customType === "arithmetic") {
      for (let i = 0; i < numTerms; i++) {
        result.push(customA1 + i * customD);
      }
    } else {
      for (let i = 0; i < numTerms; i++) {
        result.push(customA1 * Math.pow(customR, i));
      }
    }
    return result;
  }, [customA1, customD, customR, customType, numTerms]);

  const analysis = useMemo(() => sequence.detect(terms.slice(0, 3)), [terms, sequence]);

  const generateChallenge = () => {
    const types = ["arithmetic_nth", "geometric_nth", "sum_arithmetic", "sum_geometric"];
    const type = types[Math.floor(Math.random() * types.length)];
    if (type === "arithmetic_nth") {
      const a = Math.floor(Math.random() * 5) + 1;
      const d = Math.floor(Math.random() * 5) + 1;
      const n = Math.floor(Math.random() * 8) + 5;
      setChallenge({
        type,
        question: `arithmetic: a₁=${a}, d=${d}. Find a${n}.`,
        answer: a + (n - 1) * d,
      });
    } else if (type === "geometric_nth") {
      const a = Math.floor(Math.random() * 3) + 1;
      const r = Math.floor(Math.random() * 2) + 2;
      const n = Math.floor(Math.random() * 4) + 3;
      setChallenge({
        type,
        question: `geometric: a₁=${a}, r=${r}. Find a${n}.`,
        answer: a * Math.pow(r, n - 1),
      });
    } else if (type === "sum_arithmetic") {
      const a = Math.floor(Math.random() * 5) + 1;
      const d = Math.floor(Math.random() * 4) + 1;
      const n = Math.floor(Math.random() * 6) + 5;
      setChallenge({
        type,
        question: `arithmetic: a₁=${a}, d=${d}, n=${n}. Find S${n}.`,
        answer: (n / 2) * (2 * a + (n - 1) * d),
      });
    } else {
      const a = Math.floor(Math.random() * 3) + 1;
      const r = 2;
      const n = Math.floor(Math.random() * 4) + 3;
      setChallenge({
        type,
        question: `geometric: a₁=${a}, r=${r}, n=${n}. Find S${n}.`,
        answer: a * (Math.pow(r, n) - 1) / (r - 1),
      });
    }
    setUserAnswer("");
    setFeedback(null);
  };

  useEffect(() => {
    if (!challenge) generateChallenge();
  }, [challenge]);

  const isCorrect = challenge && Math.abs(parseFloat(userAnswer) - challenge.answer) < 0.5;

  const checkAnswer = () => {
    if (!challenge) return;
    setFeedback(isCorrect ? "correct" : "wrong");
    setScore((s) => {
      const next = { correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 };
      try { localStorage.setItem("mathitout-seq-score", JSON.stringify(next)); } catch {}
      return next;
    });
    if (isCorrect) {
      markProblemSolved(`seq-${Date.now()}`, 5, 1);
      toast({ title: "correct!", description: "sequence mastery +5 XP" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// find the pattern</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-7 w-7" />
          sequence analyzer
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">explore classic sequences. find nth terms. compute sums.</p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {SEQUENCES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSequenceId(s.id)}
            className={cn(
              "px-3 py-1.5 text-xs border transition-colors",
              sequenceId === s.id
                ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5 space-y-4">
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// {sequence.name}</div>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-zinc-300">terms</span>
              <span className="text-[#c4f000] font-mono font-semibold">{numTerms}</span>
            </div>
            <input type="range" min="5" max="20" value={numTerms} onChange={(e) => setNumTerms(parseInt(e.target.value))} className="w-full" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {terms.map((t, i) => (
              <div key={i} className="border border-zinc-800 bg-[#0a0a0a] px-2 py-1 font-mono text-xs">
                <span className="text-zinc-600 text-[10px]">a{i + 1}</span>{" "}
                <span className="text-zinc-200">{t.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">analysis</span>
              <span className="text-[#c4f000] font-mono">
                {analysis.type === "arithmetic" && `arithmetic, d=${analysis.d}`}
                {analysis.type === "geometric" && `geometric, r=${analysis.r}`}
                {analysis.type === "neither" && "complex (not arithmetic/geometric)"}
              </span>
            </div>
            {sequence.id === "fib" && (
              <div className="text-[10px] text-zinc-600 italic">
                each term is sum of the two before: aₙ = aₙ₋₁ + aₙ₋₂
              </div>
            )}
            {sequence.id === "triangular" && (
              <div className="text-[10px] text-zinc-600 italic">
                aₙ = n(n+1)/2. sums of integers.
              </div>
            )}
            {sequence.id === "squares" && (
              <div className="text-[10px] text-zinc-600 italic">
                aₙ = n². differences: 3, 5, 7, 9, 11, ... (odd numbers)
              </div>
            )}
            {sequence.id === "cubes" && (
              <div className="text-[10px] text-zinc-600 italic">
                aₙ = n³. differences: 7, 19, 37, 61, 91, ... (n³ − (n−1)³)
              </div>
            )}
            {sequence.id === "powers2" && (
              <div className="text-[10px] text-zinc-600 italic">
                aₙ = 2^(n−1). geometric with r=2.
              </div>
            )}
            {sequence.id === "primes" && (
              <div className="text-[10px] text-zinc-600 italic">
                primes: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, ...
              </div>
            )}
          </div>
        </div>

        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5 space-y-4">
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// custom sequence</div>
          <div className="grid grid-cols-2 gap-1.5">
            {(["arithmetic", "geometric"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setCustomType(t)}
                className={cn(
                  "px-3 py-1.5 text-xs border transition-colors",
                  customType === t
                    ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                    : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">a₁ (first term)</div>
              <Input
                type="number"
                value={customA1}
                onChange={(e) => setCustomA1(parseFloat(e.target.value) || 0)}
                className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 font-mono focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
              />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">
                {customType === "arithmetic" ? "d (common difference)" : "r (common ratio)"}
              </div>
              <Input
                type="number"
                step="0.1"
                value={customType === "arithmetic" ? customD : customR}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0;
                  if (customType === "arithmetic") setCustomD(v);
                  else setCustomR(v);
                }}
                className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 font-mono focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {customTerms.slice(0, 8).map((t, i) => (
              <div key={i} className="border border-zinc-800 bg-[#0a0a0a] px-2 py-1 font-mono text-xs">
                <span className="text-zinc-600 text-[10px]">a{i + 1}</span>{" "}
                <span className="text-zinc-200">{t.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// test yourself</div>
            <h3 className="font-semibold text-sm">sequence quiz</h3>
          </div>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">
            {score.correct}/{score.total} correct
          </Badge>
        </div>

        {challenge && (
          <div className="space-y-3">
            <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
              <p className="text-sm text-zinc-300 font-mono">{challenge.question}</p>
            </div>

            {!feedback ? (
              <div className="space-y-2">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && userAnswer.trim()) checkAnswer(); }}
                  placeholder="your answer"
                  className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 font-mono focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
                />
                <Button onClick={checkAnswer} disabled={!userAnswer.trim()} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold">
                  check
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className={cn(
                  "p-3 border text-sm",
                  feedback === "correct" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" : "border-rose-500/30 bg-rose-500/5 text-rose-300"
                )}>
                  {feedback === "correct" ? "correct! +5 XP" : `the answer was ${challenge.answer.toLocaleString()}`}
                </div>
                <Button onClick={generateChallenge} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold">
                  <RotateCcw className="h-4 w-4 mr-2" /> new problem
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
