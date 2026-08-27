"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Circle, Grid3x3, Layers, Sparkles, RefreshCw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getState, subscribe, markProblemSolved } from "@/lib/local-state";

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyFraction(num: number, den: number): { num: number; den: number } {
  if (den === 0) return { num: 1, den: 1 };
  const g = gcd(Math.abs(num), Math.abs(den));
  if (den < 0) {
    return { num: -num / g, den: -den / g };
  }
  return { num: num / g, den: den / g };
}

type Mode = "fraction" | "decimal" | "percent";

export default function FractionVisualizer() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const [mode, setMode] = useState<Mode>("fraction");
  const [numerator, setNumerator] = useState(3);
  const [denominator, setDenominator] = useState(8);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [challenge, setChallenge] = useState<{
    num: number;
    den: number;
    answer: string;
    type: "simplify" | "to_decimal" | "to_percent";
  } | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("mathitout-fraction-score");
    if (stored) {
      try { setScore(JSON.parse(stored)); } catch {}
    }
  }, [tick]);

  const state = getState();
  void tick;

  const simplified = useMemo(() => simplifyFraction(numerator, denominator), [numerator, denominator]);
  const decimal = useMemo(() => numerator / denominator, [numerator, denominator]);
  const percent = useMemo(() => (decimal * 100).toFixed(2), [decimal]);

  const generateChallenge = () => {
    const num = Math.floor(Math.random() * 8) + 1;
    const den = Math.floor(Math.random() * 8) + 2;
    const types: ("simplify" | "to_decimal" | "to_percent")[] = ["simplify", "to_decimal", "to_percent"];
    const type = types[Math.floor(Math.random() * types.length)];
    setChallenge({ num, den, type, answer: "" });
    setUserAnswer("");
    setFeedback(null);
  };

  useEffect(() => {
    if (challenge) return;
    generateChallenge();
  }, [challenge]);

  useEffect(() => {
    if (challenge) {
      const a = challenge.type === "simplify" ? `${simplifyFraction(challenge.num, challenge.den).num}/${simplifyFraction(challenge.num, challenge.den).den}` :
        challenge.type === "to_decimal" ? (challenge.num / challenge.den).toFixed(2) :
        ((challenge.num / challenge.den) * 100).toFixed(0) + "%";
      setChallenge((c) => c ? { ...c, answer: a } : null);
    }
  }, [challenge?.num, challenge?.den, challenge?.type]);

  const checkAnswer = () => {
    if (!challenge || !challenge.answer) return;
    const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "").replace(/0+$/, "").replace(/\.$/, "");
    const correct = normalize(userAnswer) === normalize(challenge.answer);
    setFeedback(correct ? "correct" : "wrong");
    setScore((s) => {
      const next = { correct: s.correct + (correct ? 1 : 0), total: s.total + 1 };
      try { localStorage.setItem("mathitout-fraction-score", JSON.stringify(next)); } catch {}
      return next;
    });
    if (correct) {
      markProblemSolved(`fraction-${challenge.num}-${challenge.den}-${challenge.type}`, 5, 1);
      toast({ title: "correct!", description: `${challenge.num}/${challenge.den} → ${challenge.answer}` });
    }
  };

  const renderVisual = () => {
    if (mode === "fraction") {
      return (
        <div className="space-y-3">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-[#c4f000] font-mono">{numerator}</div>
            <div className="w-32 h-1 bg-[#c4f000] my-2" />
            <div className="text-3xl font-bold text-[#c4f000] font-mono">{denominator}</div>
          </div>
          {denominator > 0 && denominator <= 12 && (
            <div className="space-y-1">
              {Array.from({ length: denominator }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-6 border border-zinc-700 relative",
                    i < numerator ? "bg-[#c4f000]/20" : "bg-zinc-900"
                  )}
                  style={{ width: `${Math.min(100, 100)}%` }}
                >
                  {i < numerator && (
                    <div className="absolute inset-y-0 left-0 bg-[#c4f000]/40" style={{ width: "100%" }} />
                  )}
                </div>
              ))}
            </div>
          )}
          {denominator > 12 && (
            <div className="text-center text-xs text-zinc-500">
              (visual limited to denominators ≤ 12)
            </div>
          )}
        </div>
      );
    }
    if (mode === "decimal") {
      return (
        <div className="space-y-3">
          <div className="text-center text-4xl font-bold text-[#c4f000] font-mono">
            {decimal.toFixed(4)}
          </div>
          <div className="border border-zinc-800 bg-[#0a0a0a] p-4 font-mono text-xs space-y-1">
            <div className="text-zinc-500">{numerator} ÷ {denominator} =</div>
            <div className="text-zinc-100">{decimal.toFixed(8)}</div>
            <div className="text-zinc-500">rounded: <span className="text-[#c4f000]">{decimal.toFixed(2)}</span></div>
          </div>
        </div>
      );
    }
    if (mode === "percent") {
      return (
        <div className="space-y-3">
          <div className="text-center text-4xl font-bold text-[#c4f000] font-mono">
            {percent}%
          </div>
          <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
            <div className="h-8 bg-zinc-900 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-[#c4f000]" style={{ width: `${Math.min(100, decimal * 100)}%` }} />
              <div className="absolute inset-0 flex items-center px-2 text-xs font-mono text-black">
                {percent}%
              </div>
            </div>
            <div className="mt-2 text-center text-xs text-zinc-500 font-mono">
              {numerator}/{denominator} = {decimal.toFixed(4)} = {percent}%
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// see it, understand it</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Layers className="h-7 w-7" />
          fraction visualizer
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">see fractions as decimal, percent, and visual bars.</p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {(["fraction", "decimal", "percent"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors",
              mode === m
                ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5 space-y-4">
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// set the fraction</div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1 block">numerator</label>
              <Input
                type="number"
                min={0}
                value={numerator}
                onChange={(e) => setNumerator(Math.max(0, parseInt(e.target.value) || 0))}
                className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 font-mono text-lg focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1 block">denominator</label>
              <Input
                type="number"
                min={1}
                value={denominator}
                onChange={(e) => setDenominator(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 font-mono text-lg focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => { setNumerator(1); setDenominator(2); }} variant="outline" className="border-zinc-800 text-xs">½</Button>
            <Button onClick={() => { setNumerator(1); setDenominator(3); }} variant="outline" className="border-zinc-800 text-xs">⅓</Button>
            <Button onClick={() => { setNumerator(3); setDenominator(4); }} variant="outline" className="border-zinc-800 text-xs">¾</Button>
            <Button onClick={() => { setNumerator(5); setDenominator(8); }} variant="outline" className="border-zinc-800 text-xs">⅝</Button>
          </div>
        </div>

        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-3">// visual</div>
          {renderVisual()}
        </div>
      </div>

      {simplified.num !== numerator || simplified.den !== denominator ? (
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">// simplified</div>
          <div className="flex items-center justify-center gap-3 text-2xl font-mono">
            <span className="text-zinc-100">{numerator}/{denominator}</span>
            <ArrowRight className="h-5 w-5 text-zinc-500" />
            <span className="text-[#c4f000]">{simplified.num}/{simplified.den}</span>
          </div>
        </div>
      ) : null}

      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// practice</div>
            <h3 className="font-semibold text-sm">test yourself</h3>
          </div>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">
            {score.correct}/{score.total} correct
          </Badge>
        </div>

        {challenge && (
          <div className="space-y-3">
            <div className="border border-zinc-800 bg-[#0a0a0a] p-4 text-center">
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">
                {challenge.type === "simplify" ? "simplify this fraction" :
                 challenge.type === "to_decimal" ? "convert to decimal (2dp)" :
                 "convert to percent"}
              </div>
              <div className="text-3xl font-bold font-mono text-zinc-100">
                {challenge.num}/{challenge.den}
              </div>
            </div>

            {!feedback ? (
              <div className="space-y-2">
                <Input
                  autoFocus
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && userAnswer.trim()) checkAnswer(); }}
                  placeholder={challenge.type === "to_percent" ? "e.g. 37%" : "e.g. 0.37 or 3/8"}
                  className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 font-mono focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
                />
                <Button onClick={checkAnswer} disabled={!userAnswer.trim()} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800]">
                  check
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className={cn(
                  "p-3 border text-sm",
                  feedback === "correct" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" : "border-rose-500/30 bg-rose-500/5 text-rose-300"
                )}>
                  {feedback === "correct" ? "correct! +5 XP" : `the answer was ${challenge.answer}`}
                </div>
                <Button onClick={generateChallenge} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800]">
                  <RefreshCw className="h-4 w-4 mr-2" /> next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
