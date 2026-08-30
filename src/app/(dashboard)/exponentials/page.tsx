"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Sparkles, RotateCcw, ArrowRight, Activity, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getState, subscribe, markProblemSolved } from "@/lib/local-state";

export default function ExponentialExplorerPage() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const [a, setA] = useState(2);
  const [b, setB] = useState(1.5);
  const [mode, setMode] = useState<"exponential" | "logarithmic">("exponential");
  const [challenge, setChallenge] = useState<{ type: "exponential" | "logarithm"; question: string; answer: number } | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mathitout-exp-score");
      if (stored) {
        try { setScore(JSON.parse(stored)); } catch {}
      }
    }
  }, [tick]);

  const state = getState();
  void tick;

  const W = 600;
  const H = 400;
  const scaleX = W / 14;
  const scaleY = H / 20;
  const toSvgX = (x: number) => W / 2 + x * scaleX;
  const toSvgY = (y: number) => H / 2 - y * scaleY;

  const expPath = useMemo(() => {
    const points: string[] = [];
    for (let px = 0; px <= W; px += 2) {
      const x = (px - W / 2) / scaleX;
      if (x < -6 || x > 6) continue;
      const y = a * Math.pow(b, x);
      const py = toSvgY(y);
      if (py >= -100 && py <= H + 100) {
        points.push(`${px === 0 ? "M" : "L"}${px},${py.toFixed(1)}`);
      }
    }
    return points.join(" ");
  }, [a, b, scaleX]);

  const logPath = useMemo(() => {
    const points: string[] = [];
    for (let py = 0; py <= H; py += 2) {
      const y = (H / 2 - py) / scaleY;
      if (y <= 0) continue;
      const x = Math.log(y / a) / Math.log(b);
      if (x < -6 || x > 6) continue;
      const sx = toSvgX(x);
      if (sx >= 0 && sx <= W) {
        points.push(`${py === 0 ? "M" : "L"}${sx.toFixed(1)},${py}`);
      }
    }
    return points.join(" ");
  }, [a, b, scaleX, scaleY]);

  const generateChallenge = () => {
    const types: ("exponential" | "logarithm")[] = ["exponential", "logarithm"];
    const type = types[Math.floor(Math.random() * types.length)];
    if (type === "exponential") {
      const base = [2, 3, 5][Math.floor(Math.random() * 3)];
      const x = Math.floor(Math.random() * 4) + 1;
      const answer = Math.pow(base, x);
      setChallenge({
        type,
        question: `what is ${base}^${x}?`,
        answer,
      });
    } else {
      const base = [2, 4, 8][Math.floor(Math.random() * 3)];
      const n = Math.floor(Math.random() * 5) + 1;
      const value = Math.pow(base, n);
      setChallenge({
        type,
        question: `what is log_${base}(${value})?`,
        answer: n,
      });
    }
    setUserAnswer("");
    setFeedback(null);
  };

  useEffect(() => {
    if (!challenge) generateChallenge();
  }, [challenge]);

  const isCorrect = challenge && Math.abs(parseFloat(userAnswer) - challenge.answer) < 0.01;

  const checkAnswer = () => {
    if (!challenge) return;
    setFeedback(isCorrect ? "correct" : "wrong");
    setScore((s) => {
      const next = { correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 };
      try { localStorage.setItem("mathitout-exp-score", JSON.stringify(next)); } catch {}
      return next;
    });
    if (isCorrect) {
      markProblemSolved(`exp-${Date.now()}`, 5, 1);
      toast({ title: "correct!", description: "exponential mastery +5 XP" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// growth and decay</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-7 w-7" />
          exponentials & logs
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">explore y = a · b^x and its inverse y = log_b(x/a).</p>
      </div>

      <div className="flex gap-1.5">
        {(["exponential", "logarithmic"] as const).map((m) => (
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
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// function</div>
          <div className="text-center text-xl font-mono text-zinc-100 py-3">
            {mode === "exponential" ? (
              <>
                y = <input type="number" value={a} onChange={(e) => setA(parseFloat(e.target.value) || 1)} className="w-12 bg-[#0a0a0a] border border-zinc-800 text-[#c4f000] text-center font-mono text-lg focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20 outline-none px-1" /> · <input type="number" value={b} onChange={(e) => setB(parseFloat(e.target.value) || 1)} className="w-12 bg-[#0a0a0a] border border-zinc-800 text-[#c4f000] text-center font-mono text-lg focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20 outline-none px-1" /><sup>x</sup>
              </>
            ) : (
              <>
                y = log<sub>{b.toFixed(1)}</sub>( x / <input type="number" value={a} onChange={(e) => setA(parseFloat(e.target.value) || 1)} className="w-12 bg-[#0a0a0a] border border-zinc-800 text-[#c4f000] text-center font-mono text-lg focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20 outline-none px-1" /> )
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="border border-zinc-800 p-2 text-center">
              <div className="text-zinc-500 text-[10px]">a (vertical scale)</div>
              <div className="text-[#c4f000] font-mono font-bold">{a}</div>
            </div>
            <div className="border border-zinc-800 p-2 text-center">
              <div className="text-zinc-500 text-[10px]">b (base)</div>
              <div className="text-[#c4f000] font-mono font-bold">{b}</div>
            </div>
            <div className="border border-zinc-800 p-2 text-center">
              <div className="text-zinc-500 text-[10px]">y-intercept</div>
              <div className="text-[#c4f000] font-mono font-bold">{mode === "exponential" ? a : "n/a"}</div>
            </div>
            <div className="border border-zinc-800 p-2 text-center">
              <div className="text-zinc-500 text-[10px]">asymptote</div>
              <div className="text-[#c4f000] font-mono font-bold">{b > 1 || b < 1 ? "y = 0" : "n/a"}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => { setA(1); setB(2); }} variant="outline" className="border-zinc-800 text-xs">2ˣ (doubling)</Button>
            <Button onClick={() => { setA(1); setB(0.5); }} variant="outline" className="border-zinc-800 text-xs">½ˣ (decay)</Button>
            <Button onClick={() => { setA(100); setB(1.1); }} variant="outline" className="border-zinc-800 text-xs">1.1ˣ (compound)</Button>
            <Button onClick={() => { setA(1); setB(10); }} variant="outline" className="border-zinc-800 text-xs">10ˣ (log scale)</Button>
          </div>
        </div>

        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            <defs>
              <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#grid)" />
            <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#44403c" strokeWidth="1" />
            <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke="#44403c" strokeWidth="1" />
            {b > 0 && b !== 1 && (
              <path d={mode === "exponential" ? expPath : logPath} fill="none" stroke="#c4f000" strokeWidth="2.5" />
            )}
            {b > 0 && b !== 1 && (
              <line x1="0" y1={toSvgY(0)} x2={W} y2={toSvgY(0)} stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.4" />
            )}
          </svg>
        </div>
      </div>

      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// test yourself</div>
            <h3 className="font-semibold text-sm">exponential quiz</h3>
          </div>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">
            {score.correct}/{score.total} correct
          </Badge>
        </div>

        {challenge && (
          <div className="space-y-3">
            <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
              <p className="text-sm text-zinc-300">{challenge.question}</p>
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
                  {feedback === "correct" ? "correct! +5 XP" : `the answer was ${challenge.answer}`}
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
