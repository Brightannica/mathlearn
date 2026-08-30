"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Target, Sparkles, RotateCcw, ArrowRight, CheckCircle2, XCircle, Calculator, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getState, subscribe, markProblemSolved } from "@/lib/local-state";

function solveQuadratic(a: number, b: number, c: number) {
  const disc = b * b - 4 * a * c;
  if (disc < 0) return { type: "no_real" as const, disc };
  if (disc === 0) {
    const x = -b / (2 * a);
    return { type: "double" as const, roots: [x, x], disc, x: -b / (2 * a), y: a * x * x + b * x + c };
  }
  const sqrtD = Math.sqrt(disc);
  const r1 = (-b - sqrtD) / (2 * a);
  const r2 = (-b + sqrtD) / (2 * a);
  return { type: "two" as const, roots: [r1, r2], disc, sqrtD, vertexX: -b / (2 * a), vertexY: c - b * b / (4 * a) };
}

export default function QuadraticSolverPage() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const [a, setA] = useState(1);
  const [b, setB] = useState(-5);
  const [c, setC] = useState(6);
  const [xMin, setXMin] = useState(-2);
  const [xMax, setXMax] = useState(7);
  const [challenge, setChallenge] = useState<{ a: number; b: number; c: number; answer: number | "none" } | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mathitout-quadratic-score");
      if (stored) {
        try { setScore(JSON.parse(stored)); } catch {}
      }
    }
  }, [tick]);

  const state = getState();
  void tick;

  const result = useMemo(() => solveQuadratic(a, b, c), [a, b, c]);

  const generateChallenge = useCallback(() => {
    const ca = Math.random() > 0.5 ? 1 : 1;
    const r1 = Math.floor(Math.random() * 8) - 4;
    const r2 = Math.floor(Math.random() * 8) - 4;
    const cb = -ca * (r1 + r2);
    const cc = ca * r1 * r2;
    const disc = cb * cb - 4 * ca * cc;
    if (disc < 0) return generateChallenge();
    setChallenge({ a: ca, b: cb, c: cc, answer: r1 });
    setUserAnswer("");
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (!challenge) generateChallenge();
  }, [challenge, generateChallenge]);

  const W = 600;
  const H = 400;
  const scaleX = W / ((xMax - xMin) * 1.2);
  const scaleY = H / 30;
  const toSvgX = (x: number) => W / 2 + (x - (xMin + xMax) / 2) * scaleX;
  const toSvgY = (y: number) => H / 2 - y * scaleY;

  const linePath = useMemo(() => {
    const points: string[] = [];
    for (let px = 0; px <= W; px += 2) {
      const x = (px - W / 2) / scaleX + (xMin + xMax) / 2;
      const y = a * x * x + b * x + c;
      const py = toSvgY(y);
      if (py >= -100 && py <= H + 100) {
        points.push(`${px === 0 ? "M" : "L"}${px},${py.toFixed(1)}`);
      }
    }
    return points.join(" ");
  }, [a, b, c, xMin, xMax, scaleX]);

  const vertex = result.type !== "no_real"
    ? { x: -b / (2 * a), y: c - b * b / (4 * a) }
    : null;

  const checkAnswer = () => {
    if (!challenge) return;
    const isCorrect = challenge.answer === "none"
      ? userAnswer.trim().toLowerCase() === "none"
      : Math.abs(parseFloat(userAnswer) - challenge.answer) < 0.01;
    setFeedback(isCorrect ? "correct" : "wrong");
    setScore((s) => {
      const next = { correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 };
      try { localStorage.setItem("mathitout-quadratic-score", JSON.stringify(next)); } catch {}
      return next;
    });
    if (isCorrect) {
      markProblemSolved(`quadratic-${Date.now()}`, 10, 1);
      toast({ title: "correct!", description: "quadratic mastery +10 XP" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// solve the parabola</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calculator className="h-7 w-7" />
          quadratic solver
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">adjust coefficients. see roots, vertex, and discriminant update in real time.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5 space-y-4">
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// equation</div>
          <div className="text-center text-xl font-mono text-zinc-100 py-3 space-x-2">
            <input type="number" value={a} onChange={(e) => setA(parseFloat(e.target.value) || 1)} className="w-12 bg-[#0a0a0a] border border-zinc-800 text-[#c4f000] text-center font-mono text-lg focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20 outline-none px-1" />x² {b >= 0 ? "+" : "−"} <input type="number" value={Math.abs(b)} onChange={(e) => setB(parseFloat(e.target.value) || 0)} className="w-12 bg-[#0a0a0a] border border-zinc-800 text-[#c4f000] text-center font-mono text-lg focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20 outline-none px-1" />x {c >= 0 ? "+" : "−"} <input type="number" value={Math.abs(c)} onChange={(e) => setC(parseFloat(e.target.value) || 0)} className="w-12 bg-[#0a0a0a] border border-zinc-800 text-[#c4f000] text-center font-mono text-lg focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20 outline-none px-1" /> = 0
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="border border-zinc-800 p-2 text-center">
              <div className="text-zinc-500 text-[10px]">a</div>
              <div className="text-[#c4f000] font-mono font-bold">{a}</div>
            </div>
            <div className="border border-zinc-800 p-2 text-center">
              <div className="text-zinc-500 text-[10px]">b</div>
              <div className="text-[#c4f000] font-mono font-bold">{b}</div>
            </div>
            <div className="border border-zinc-800 p-2 text-center">
              <div className="text-zinc-500 text-[10px]">c</div>
              <div className="text-[#c4f000] font-mono font-bold">{c}</div>
            </div>
            <div className="border border-zinc-800 p-2 text-center">
              <div className="text-zinc-500 text-[10px]">discriminant</div>
              <div className={cn("font-mono font-bold", "disc" in result ? (result.disc < 0 ? "text-rose-400" : result.disc === 0 ? "text-amber-400" : "text-emerald-400") : "")}>
                {b * b - 4 * a * c}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => { setA(1); setB(-5); setC(6); }} variant="outline" className="border-zinc-800 text-xs">x²−5x+6</Button>
            <Button onClick={() => { setA(1); setB(0); setC(-4); }} variant="outline" className="border-zinc-800 text-xs">x²−4</Button>
            <Button onClick={() => { setA(1); setB(2); setC(1); }} variant="outline" className="border-zinc-800 text-xs">x²+2x+1</Button>
            <Button onClick={() => { setA(1); setB(0); setC(1); }} variant="outline" className="border-zinc-800 text-xs">x²+1 (no real)</Button>
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
            <path d={linePath} fill="none" stroke="#c4f000" strokeWidth="2.5" />
            {vertex && (
              <circle cx={toSvgX(vertex.x)} cy={toSvgY(vertex.y)} r="5" fill="#fbbf24" stroke="#0a0a0a" strokeWidth="2" />
            )}
            {result.type === "two" && result.roots.map((r, i) => (
              <circle key={i} cx={toSvgX(r)} cy={toSvgY(0)} r="4" fill="#60a5fa" stroke="#0a0a0a" strokeWidth="2" />
            ))}
            {result.type === "double" && (
              <circle cx={toSvgX(result.x)} cy={toSvgY(0)} r="4" fill="#a78bfa" stroke="#0a0a0a" strokeWidth="2" />
            )}
          </svg>
        </div>
      </div>

      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">// roots</div>
            {result.type === "no_real" && <span className="text-rose-400 text-sm">no real roots (disc &lt; 0)</span>}
            {result.type === "double" && <span className="text-amber-400 text-sm font-mono">x = {result.x.toFixed(4)} (double root)</span>}
            {result.type === "two" && <span className="text-emerald-400 text-sm font-mono">x = {result.roots![0].toFixed(4)}, {result.roots![1].toFixed(4)}</span>}
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">// vertex</div>
            {vertex && <span className="text-zinc-200 text-sm font-mono">({vertex.x.toFixed(2)}, {vertex.y.toFixed(2)})</span>}
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">// y-intercept</div>
            <span className="text-zinc-200 text-sm font-mono">(0, {c})</span>
          </div>
        </div>
      </div>

      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// test yourself</div>
            <h3 className="font-semibold text-sm">quadratic quiz</h3>
          </div>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">
            {score.correct}/{score.total} correct
          </Badge>
        </div>

        {challenge && (
          <div className="space-y-3">
            <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
              <p className="text-sm text-zinc-300">find one root of: <span className="font-mono text-zinc-100">{challenge.a}x² {challenge.b >= 0 ? "+" : "−"} {Math.abs(challenge.b)}x {challenge.c >= 0 ? "+" : "−"} {Math.abs(challenge.c)} = 0</span></p>
            </div>

            {!feedback ? (
              <div className="space-y-2">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && userAnswer.trim()) checkAnswer(); }}
                  placeholder="x = ?"
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
                  {feedback === "correct" ? "correct! +10 XP" : `the answer was x = ${challenge.answer}`}
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
