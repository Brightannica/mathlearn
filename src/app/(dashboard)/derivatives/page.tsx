"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RotateCcw, TrendingUp, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { getState, subscribe, markProblemSolved } from "@/lib/local-state";

type Function = {
  id: string;
  name: string;
  fn: (x: number) => number;
  dfn: (x: number) => number;
  range: [number, number];
  desc: string;
};

const FUNCTIONS: Function[] = [
  { id: "x2", name: "x²", fn: (x) => x * x, dfn: (x) => 2 * x, range: [-3, 3], desc: "parabola" },
  { id: "x3", name: "x³", fn: (x) => x * x * x, dfn: (x) => 3 * x * x, range: [-2, 2], desc: "cubic" },
  { id: "sin", name: "sin(x)", fn: (x) => Math.sin(x), dfn: (x) => Math.cos(x), range: [-2 * Math.PI, 2 * Math.PI], desc: "sine wave" },
  { id: "cos", name: "cos(x)", fn: (x) => Math.cos(x), dfn: (x) => -Math.sin(x), range: [-2 * Math.PI, 2 * Math.PI], desc: "cosine wave" },
  { id: "exp", name: "eˣ", fn: (x) => Math.exp(x), dfn: (x) => Math.exp(x), range: [-2, 3], desc: "exponential" },
  { id: "ln", name: "ln(x)", fn: (x) => Math.log(x), dfn: (x) => 1 / x, range: [0.1, 8], desc: "logarithm" },
  { id: "x3-x", name: "x³ − x", fn: (x) => x * x * x - x, dfn: (x) => 3 * x * x - 1, range: [-2, 2], desc: "cubic with roots" },
  { id: "1x", name: "1/x", fn: (x) => 1 / x, dfn: (x) => -1 / (x * x), range: [-3, 3], desc: "hyperbola" },
  { id: "sqrt", name: "√x", fn: (x) => Math.sqrt(x), dfn: (x) => 1 / (2 * Math.sqrt(x)), range: [0.01, 10], desc: "square root" },
];

export default function DerivativePlaygroundPage() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const [funcId, setFuncId] = useState("x2");
  const func = FUNCTIONS.find((f) => f.id === funcId)!;
  const [xMin, setXMin] = useState(func.range[0]);
  const [xMax, setXMax] = useState(func.range[1]);
  const [tangentX, setTangentX] = useState(0);
  const [showTangent, setShowTangent] = useState(true);
  const [challenge, setChallenge] = useState<{ function: string; xVal: number; answer: number } | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mathitout-deriv-score");
      if (stored) {
        try { setScore(JSON.parse(stored)); } catch {}
      }
    }
  }, [tick]);

  const state = getState();
  void tick;

  const W = 600;
  const H = 400;
  const scaleX = W / 10;
  const scaleY = H / 8;
  const toSvgX = (x: number) => W / 2 + x * scaleX;
  const toSvgY = (y: number) => H / 2 - y * scaleY;

  const fPath = useMemo(() => {
    const points: string[] = [];
    for (let px = 0; px <= W; px += 1) {
      const x = xMin + (px / W) * (xMax - xMin);
      try {
        const y = func.fn(x);
        if (isFinite(y) && Math.abs(y) < 50) {
          points.push(`${px === 0 ? "M" : "L"}${px},${toSvgY(y).toFixed(1)}`);
        }
      } catch {}
    }
    return points.join(" ");
  }, [func, xMin, xMax, toSvgY]);

  const fPrimePath = useMemo(() => {
    const points: string[] = [];
    for (let px = 0; px <= W; px += 1) {
      const x = xMin + (px / W) * (xMax - xMin);
      try {
        const y = func.dfn(x);
        if (isFinite(y) && Math.abs(y) < 50) {
          points.push(`${px === 0 ? "M" : "L"}${px},${toSvgY(y).toFixed(1)}`);
        }
      } catch {}
    }
    return points.join(" ");
  }, [func, xMin, xMax, toSvgY]);

  const fx = useMemo(() => {
    try { return func.fn(tangentX); } catch { return 0; }
  }, [func, tangentX]);

  const dFx = useMemo(() => {
    try { return func.dfn(tangentX); } catch { return 0; }
  }, [func, tangentX]);

  const generateChallenge = () => {
    const f = FUNCTIONS[Math.floor(Math.random() * FUNCTIONS.length)];
    const x = f.range[0] + Math.random() * (f.range[1] - f.range[0]);
    const answer = f.dfn(x);
    setChallenge({ function: f.name, xVal: x, answer });
    setUserAnswer("");
    setFeedback(null);
  };

  useEffect(() => {
    if (!challenge) generateChallenge();
  }, [challenge]);

  const isCorrect = challenge && Math.abs(parseFloat(userAnswer) - challenge.answer) < 0.1;

  const checkAnswer = () => {
    if (!challenge) return;
    setFeedback(isCorrect ? "correct" : "wrong");
    setScore((s) => {
      const next = { correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 };
      try { localStorage.setItem("mathitout-deriv-score", JSON.stringify(next)); } catch {}
      return next;
    });
    if (isCorrect) {
      markProblemSolved(`deriv-${Date.now()}`, 5, 1);
      toast({ title: "correct!", description: "derivative mastery +5 XP" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// see derivatives</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-7 w-7" />
          derivative playground
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">see the original function (yellow) and its derivative (green) side by side.</p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FUNCTIONS.map((f) => (
          <button
            key={f.id}
            onClick={() => { setFuncId(f.id); setXMin(f.range[0]); setXMax(f.range[1]); setTangentX(0); }}
            className={cn(
              "px-3 py-1.5 text-xs border transition-colors font-mono",
              funcId === f.id
                ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
            )}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-zinc-800/60 bg-[#0d0d0d] p-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            <defs>
              <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#grid)" />
            <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#44403c" strokeWidth="1" />
            <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke="#44403c" strokeWidth="1" />
            <path d={fPath} fill="none" stroke="#fbbf24" strokeWidth="2.5" />
            <path d={fPrimePath} fill="none" stroke="#c4f000" strokeWidth="2.5" />
            {showTangent && (
              <g>
                <line
                  x1="0"
                  y1={toSvgY(fx - dFx * 5)}
                  x2={W}
                  y2={toSvgY(fx + dFx * 5)}
                  stroke="#60a5fa"
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                />
                <circle cx={toSvgX(tangentX)} cy={toSvgY(fx)} r="5" fill="#fbbf24" stroke="#0a0a0a" strokeWidth="2" />
                <circle cx={toSvgX(tangentX)} cy={toSvgY(dFx)} r="4" fill="#c4f000" stroke="#0a0a0a" strokeWidth="2" />
              </g>
            )}
          </svg>
          <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-2 px-2">
            <span><span className="inline-block w-2 h-0.5 bg-[#fbbf24] align-middle mr-1" /> f(x)</span>
            <span><span className="inline-block w-2 h-0.5 bg-[#c4f000] align-middle mr-1" /> f′(x)</span>
            <span><span className="inline-block w-2 h-0.5 bg-[#60a5fa] border-dashed align-middle mr-1" /> tangent</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4 space-y-3">
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// controls</div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">tangent at x =</span>
                <span className="text-[#c4f000] font-mono font-semibold">{tangentX.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={xMin}
                max={xMax}
                step="0.1"
                value={tangentX}
                onChange={(e) => setTangentX(parseFloat(e.target.value))}
                className="w-full mt-1"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-300">x range</span>
              <span className="text-zinc-500 font-mono text-[10px]">[{xMin.toFixed(1)}, {xMax.toFixed(1)}]</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-300">f({tangentX.toFixed(2)})</span>
              <span className="text-amber-400 font-mono font-semibold">{fx.toFixed(3)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-300">f′({tangentX.toFixed(2)})</span>
              <span className="text-[#c4f000] font-mono font-semibold">{dFx.toFixed(3)}</span>
            </div>
            <button
              onClick={() => setShowTangent(!showTangent)}
              className="w-full px-3 py-1.5 text-xs border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              {showTangent ? "hide" : "show"} tangent line
            </button>
          </div>
        </div>
      </div>

      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">// current function</div>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <div className="font-mono text-zinc-100">f(x) = {func.name}</div>
          <div className="font-mono text-[#c4f000]">f′(x) = {func.id === "x2" ? "2x" : func.id === "x3" ? "3x²" : func.id === "sin" ? "cos(x)" : func.id === "cos" ? "−sin(x)" : func.id === "exp" ? "eˣ" : func.id === "ln" ? "1/x" : "varies"}</div>
        </div>
        <div className="text-[10px] text-zinc-600 mt-2">{func.desc}</div>
      </div>

      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// test yourself</div>
            <h3 className="font-semibold text-sm">derivative quiz</h3>
          </div>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">
            {score.correct}/{score.total} correct
          </Badge>
        </div>

        {challenge && (
          <div className="space-y-3">
            <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
              <p className="text-sm text-zinc-300">
                what is f′({challenge.xVal.toFixed(2)}) for f(x) = {challenge.function}?
              </p>
            </div>

            {!feedback ? (
              <div className="space-y-2">
                <input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && userAnswer.trim()) checkAnswer(); }}
                  placeholder="derivative value"
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-zinc-100 font-mono px-3 py-2 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20 outline-none"
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
                  {feedback === "correct" ? "correct! +5 XP" : `the answer was f′(${challenge.xVal.toFixed(2)}) = ${challenge.answer.toFixed(2)}`}
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
