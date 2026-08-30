"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Target, Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { getState, subscribe, markProblemSolved } from "@/lib/local-state";

type Challenge = {
  type: "slope" | "y_intercept" | "equation" | "point";
  question: string;
  answer: number | string;
  m: number;
  b: number;
  xVal?: number;
  yVal?: number;
};

function generateChallenge(m: number, b: number): Challenge {
  const types: Challenge["type"][] = ["slope", "y_intercept", "equation", "point"];
  const type = types[Math.floor(Math.random() * types.length)];
  switch (type) {
    case "slope":
      return { type, question: `what is the slope of the line y = ${m}x + ${b}?`, answer: m, m, b };
    case "y_intercept":
      return { type, question: `what is the y-intercept of the line y = ${m}x + ${b}?`, answer: b, m, b };
    case "point":
      const xv = Math.floor(Math.random() * 5) + 1;
      return { type, question: `what is the y-value at x = ${xv} on the line y = ${m}x + ${b}?`, answer: m * xv + b, m, b, xVal: xv };
    case "equation":
      const bm = Math.floor(Math.random() * 6) - 3;
      const bb = Math.floor(Math.random() * 10) - 5;
      return { type, question: `write the equation of a line with slope ${m} and y-intercept ${b}`, answer: `y = ${m}x + ${b}`, m: bm, b: bb };
  }
  return { type: "slope", question: "?", answer: 0, m, b };
}

export default function LinearEquationPage() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const [m, setM] = useState(2);
  const [b, setB] = useState(-1);
  const [xVal, setXVal] = useState(3);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mathitout-linear-score");
      if (stored) {
        try { setScore(JSON.parse(stored)); } catch {}
      }
    }
  }, [tick]);

  const state = getState();
  void tick;

  const generateNew = useCallback(() => {
    const cm = Math.floor(Math.random() * 8) - 3 || 1;
    const cb = Math.floor(Math.random() * 10) - 5;
    setM(cm);
    setB(cb);
    setXVal(Math.floor(Math.random() * 6) + 1);
    setChallenge(generateChallenge(cm, cb));
    setUserAnswer("");
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (!challenge) generateNew();
  }, [challenge, generateNew]);

  const W = 600;
  const H = 400;
  const range = 10;
  const scaleX = W / (range * 2);
  const scaleY = H / (range * 2);
  const toSvgX = (x: number) => W / 2 + x * scaleX;
  const toSvgY = (y: number) => H / 2 - y * scaleY;

  const linePath = useMemo(() => {
    const points: string[] = [];
    for (let px = 0; px <= W; px += 2) {
      const x = (px - W / 2) / scaleX;
      const y = m * x + b;
      const py = toSvgY(y);
      if (py >= -20 && py <= H + 20) {
        points.push(`${px === 0 ? "M" : "L"}${px},${py.toFixed(1)}`);
      }
    }
    return points.join(" ");
  }, [m, b, scaleX, scaleY]);

  const yAtX = m * xVal + b;
  const isCorrect = challenge && userAnswer.trim() === String(challenge.answer);

  const checkAnswer = () => {
    if (!challenge) return;
    setFeedback(isCorrect ? "correct" : "wrong");
    setScore((s) => {
      const next = { correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 };
      try { localStorage.setItem("mathitout-linear-score", JSON.stringify(next)); } catch {}
      return next;
    });
    if (isCorrect) {
      markProblemSolved(`linear-${challenge.type}-${Date.now()}`, 5, 1);
      toast({ title: "correct!", description: "linear equation mastery +5 XP" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// see the line</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <LineChart className="h-7 w-7" />
          linear equations
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">interactively explore y = mx + b. see how slope and intercept change the line.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5 space-y-4">
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// equation</div>
          <div className="text-center text-2xl font-mono text-zinc-100 py-3">
            y = <input type="number" value={m} onChange={(e) => setM(parseFloat(e.target.value) || 0)} className="w-12 bg-[#0a0a0a] border border-zinc-800 text-[#c4f000] text-center font-mono text-lg focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20 outline-none px-1" />x {b >= 0 ? "+" : "−"} <input type="number" value={Math.abs(b)} onChange={(e) => setB(parseFloat(e.target.value) || 0)} className="w-12 bg-[#0a0a0a] border border-zinc-800 text-[#c4f000] text-center font-mono text-lg focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20 outline-none px-1" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="border border-zinc-800 p-2 text-center">
              <div className="text-zinc-500 text-[10px]">slope (m)</div>
              <div className="text-[#c4f000] font-mono font-bold">{m}</div>
            </div>
            <div className="border border-zinc-800 p-2 text-center">
              <div className="text-zinc-500 text-[10px]">y-int (b)</div>
              <div className="text-[#c4f000] font-mono font-bold">{b}</div>
            </div>
            <div className="border border-zinc-800 p-2 text-center">
              <div className="text-zinc-500 text-[10px]">x-int</div>
              <div className="text-[#c4f000] font-mono font-bold">{m !== 0 ? (-b / m).toFixed(2) : "undef"}</div>
            </div>
            <div className="border border-zinc-800 p-2 text-center">
              <div className="text-zinc-500 text-[10px]">y at x={xVal}</div>
              <div className="text-[#c4f000] font-mono font-bold">{yAtX.toFixed(2)}</div>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1 block">evaluate at x =</label>
            <Input
              type="number"
              value={xVal}
              onChange={(e) => setXVal(parseFloat(e.target.value) || 0)}
              className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 font-mono focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
            />
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
            {m !== 0 && (
              <circle cx={toSvgX(-b / m)} cy={toSvgY(0)} r="4" fill="#60a5fa" stroke="#0a0a0a" strokeWidth="2" />
            )}
            <circle cx={toSvgX(0)} cy={toSvgY(b)} r="4" fill="#a78bfa" stroke="#0a0a0a" strokeWidth="2" />
            <circle cx={toSvgX(xVal)} cy={toSvgY(yAtX)} r="5" fill="#fbbf24" stroke="#0a0a0a" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// test yourself</div>
            <h3 className="font-semibold text-sm">linear equation quiz</h3>
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
                  placeholder="your answer..."
                  className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 font-mono focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
                />
                <Button onClick={checkAnswer} disabled={!userAnswer.trim()} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d000] font-semibold">
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
                <Button onClick={generateNew} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold">
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
