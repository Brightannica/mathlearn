"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  RotateCcw, CheckCircle2, XCircle, Lightbulb, Target, Circle as CircleIcon,
  Play, Pause, ChevronRight, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getState, subscribe, markProblemSolved } from "@/lib/local-state";

type Quadrant = "I" | "II" | "III" | "IV";
type AngleData = { deg: number; sin: number; cos: number; tan: number };

const KEY_ANGLES = [
  { deg: 0, sin: 0, cos: 1, tan: 0 },
  { deg: 30, sin: 1/2, cos: Math.sqrt(3)/2, tan: 1/Math.sqrt(3) },
  { deg: 45, sin: Math.sqrt(2)/2, cos: Math.sqrt(2)/2, tan: 1 },
  { deg: 60, sin: Math.sqrt(3)/2, cos: 1/2, tan: Math.sqrt(3) },
  { deg: 90, sin: 1, cos: 0, tan: Infinity },
  { deg: 120, sin: Math.sqrt(3)/2, cos: -1/2, tan: -Math.sqrt(3) },
  { deg: 135, sin: Math.sqrt(2)/2, cos: -Math.sqrt(2)/2, tan: -1 },
  { deg: 150, sin: 1/2, cos: -Math.sqrt(3)/2, tan: -1/Math.sqrt(3) },
  { deg: 180, sin: 0, cos: -1, tan: 0 },
  { deg: 210, sin: -1/2, cos: -Math.sqrt(3)/2, tan: 1/Math.sqrt(3) },
  { deg: 225, sin: -Math.sqrt(2)/2, cos: -Math.sqrt(2)/2, tan: 1 },
  { deg: 240, sin: -Math.sqrt(3)/2, cos: -1/2, tan: Math.sqrt(3) },
  { deg: 270, sin: -1, cos: 0, tan: Infinity },
  { deg: 300, sin: -Math.sqrt(3)/2, cos: 1/2, tan: -Math.sqrt(3) },
  { deg: 315, sin: -Math.sqrt(2)/2, cos: Math.sqrt(2)/2, tan: -1 },
  { deg: 330, sin: -1/2, cos: Math.sqrt(3)/2, tan: -1/Math.sqrt(3) },
];

const SIGNS: Record<Quadrant, { sin: string; cos: string; tan: string }> = {
  "I":    { sin: "+", cos: "+", tan: "+" },
  "II":   { sin: "+", cos: "-", tan: "-" },
  "III":  { sin: "-", cos: "-", tan: "+" },
  "IV":   { sin: "-", cos: "+", tan: "-" },
};

function getQuadrant(deg: number): Quadrant {
  const norm = ((deg % 360) + 360) % 360;
  if (norm < 90) return "I";
  if (norm < 180) return "II";
  if (norm < 270) return "III";
  return "IV";
}

function formatVal(v: number): string {
  if (!isFinite(v)) return "undef";
  if (Math.abs(v) < 0.01) return "0";
  if (Math.abs(v - 1) < 0.01) return "1";
  if (Math.abs(v + 1) < 0.01) return "-1";
  if (Math.abs(v - 1/2) < 0.01) return "1/2";
  if (Math.abs(v + 1/2) < 0.01) return "-1/2";
  if (Math.abs(v - Math.sqrt(2)/2) < 0.01) return "√2/2";
  if (Math.abs(v + Math.sqrt(2)/2) < 0.01) return "-√2/2";
  if (Math.abs(v - Math.sqrt(3)/2) < 0.01) return "√3/2";
  if (Math.abs(v + Math.sqrt(3)/2) < 0.01) return "-√3/2";
  if (Math.abs(v - 1/Math.sqrt(3)) < 0.01) return "√3/3";
  if (Math.abs(v + 1/Math.sqrt(3)) < 0.01) return "-√3/3";
  return v.toFixed(2);
}

const KEY = "mathitout-unit-circle-v1";

type Progress = {
  mastered: number[];
  streak: number;
  bestStreak: number;
  totalCorrect: number;
  totalAttempts: number;
};

function loadProgress(): Progress {
  if (typeof window === "undefined") return { mastered: [], streak: 0, bestStreak: 0, totalCorrect: 0, totalAttempts: 0 };
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return { mastered: [], streak: 0, bestStreak: 0, totalCorrect: 0, totalAttempts: 0 }; }
}

function saveProgress(p: Progress) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}

type Mode = "identify" | "fill" | "signs";

export default function UnitCirclePage() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const [progress, setProgress] = useState<Progress>(loadProgress());
  const [mode, setMode] = useState<Mode>("identify");
  const [currentAngle, setCurrentAngle] = useState<AngleData | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [mode2Field, setMode2Field] = useState<"sin" | "cos" | "tan">("sin");
  const [userSin, setUserSin] = useState("");
  const [userCos, setUserCos] = useState("");
  const [userTan, setUserTan] = useState("");

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  const pickRandomAngle = useCallback(() => {
    const a = KEY_ANGLES[Math.floor(Math.random() * KEY_ANGLES.length)];
    setCurrentAngle(a);
    setUserAnswer("");
    setFeedback(null);
    setUserSin("");
    setUserCos("");
    setUserTan("");
  }, []);

  useEffect(() => {
    pickRandomAngle();
  }, [pickRandomAngle, mode]);

  const checkMode1 = () => {
    if (!currentAngle) return;
    const isCorrect = userAnswer.trim() === String(currentAngle.deg);
    setFeedback(isCorrect ? "correct" : "wrong");
    setProgress((p) => {
      const next: Progress = {
        ...p,
        totalAttempts: p.totalAttempts + 1,
        totalCorrect: p.totalCorrect + (isCorrect ? 1 : 0),
        streak: isCorrect ? p.streak + 1 : 0,
        bestStreak: Math.max(p.bestStreak, isCorrect ? p.streak + 1 : p.streak),
      };
      if (isCorrect && !p.mastered.includes(currentAngle.deg)) {
        next.mastered = [...p.mastered, currentAngle.deg];
      }
      saveProgress(next);
      return next;
    });
    if (isCorrect) {
      markProblemSolved(`unitcircle-${currentAngle.deg}`, 5, 1);
      toast({ title: "correct!", description: `${currentAngle.deg}° on the unit circle` });
    }
  };

  const checkMode2 = () => {
    if (!currentAngle) return;
    const a = currentAngle;
    const sinOK = userSin.trim() === formatVal(a.sin);
    const cosOK = userCos.trim() === formatVal(a.cos);
    const tanOK = a.deg === 90 || a.deg === 270 ? userTan.trim() === "undef" : userTan.trim() === formatVal(a.tan);
    const isCorrect = sinOK && cosOK && tanOK;
    setFeedback(isCorrect ? "correct" : "wrong");
    setProgress((p) => {
      const next: Progress = {
        ...p,
        totalAttempts: p.totalAttempts + 1,
        totalCorrect: p.totalCorrect + (isCorrect ? 1 : 0),
        streak: isCorrect ? p.streak + 1 : 0,
        bestStreak: Math.max(p.bestStreak, isCorrect ? p.streak + 1 : p.streak),
      };
      if (isCorrect && !p.mastered.includes(a.deg)) {
        next.mastered = [...p.mastered, a.deg];
      }
      saveProgress(next);
      return next;
    });
    if (isCorrect) {
      markProblemSolved(`unitcircle-fill-${a.deg}`, 10, 1);
      toast({ title: "perfect!", description: "sin, cos, and tan all correct" });
    }
  };

  const quadrant = currentAngle ? getQuadrant(currentAngle.deg) : "I";
  const signs = SIGNS[quadrant];
  void tick;

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// memorize the circle</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CircleIcon className="h-7 w-7" />
          unit circle
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">memorize the 16 key angles. sin, cos, tan — for every quadrant.</p>
      </div>

      <div className="grid gap-px bg-zinc-800/60 border border-zinc-800/60 grid-cols-2 sm:grid-cols-4">
        <div className="bg-[#0d0d0d] p-4">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">mastered</div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{progress.mastered.length}/16</div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">streak</div>
          <div className="text-2xl font-bold text-orange-400 mt-1">{progress.streak}</div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">best</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{progress.bestStreak}</div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">accuracy</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {progress.totalAttempts > 0 ? Math.round((progress.totalCorrect / progress.totalAttempts) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {([
          { id: "identify", label: "identify angle" },
          { id: "fill", label: "fill sin/cos/tan" },
          { id: "signs", label: "signs" },
        ] as const).map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "px-3 py-1.5 text-xs border transition-colors",
              mode === m.id
                ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "signs" && currentAngle && (
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-6 space-y-4">
          <div className="text-center">
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">// the angle is in quadrant</div>
            <div className="text-5xl font-bold text-[#c4f000] font-mono">{quadrant}</div>
            <div className="text-xs text-zinc-500 mt-2">{currentAngle.deg}°</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["sin", "cos", "tan"] as const).map((fn) => (
              <div key={fn} className="border border-zinc-800 p-3 text-center">
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{fn}</div>
                <div className="text-2xl font-bold font-mono mt-1" style={{ color: signs[fn] === "+" ? "#4ade80" : "#f87171" }}>
                  {signs[fn]}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center text-xs text-zinc-500 font-mono">
            ASTC rule: all sin tan cos · all students take calculus
          </div>
          <Button onClick={pickRandomAngle} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800]">
            next angle
          </Button>
        </div>
      )}

      {mode === "identify" && currentAngle && (
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-6 space-y-4">
          <div className="flex justify-center gap-2">
            <svg viewBox="0 0 240 240" className="w-60 h-60">
              <circle cx="120" cy="120" r="100" fill="none" stroke="#27272a" strokeWidth="1.5" />
              <line x1="20" y1="120" x2="220" y2="120" stroke="#27272a" strokeWidth="1" />
              <line x1="120" y1="20" x2="120" y2="220" stroke="#27272a" strokeWidth="1" />
              <line x1="120" y1="120" x2={120 + 100 * Math.cos(-currentAngle.deg * Math.PI / 180)} y2={120 - 100 * Math.sin(-currentAngle.deg * Math.PI / 180)} stroke="#c4f000" strokeWidth="2" />
              <circle cx={120 + 100 * Math.cos(-currentAngle.deg * Math.PI / 180)} cy={120 - 100 * Math.sin(-currentAngle.deg * Math.PI / 180)} r="4" fill="#c4f000" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">// what angle is this?</div>
            {!feedback ? (
              <div className="space-y-2">
                <Input
                  autoFocus
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && userAnswer.trim()) checkMode1(); }}
                  placeholder="degrees"
                  className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 text-center text-lg h-12 font-mono placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
                />
                <Button onClick={checkMode1} disabled={!userAnswer.trim()} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800]">
                  check
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className={cn(
                  "p-3 border text-sm",
                  feedback === "correct" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" : "border-rose-500/30 bg-rose-500/5 text-rose-300"
                )}>
                  {feedback === "correct" ? "correct!" : `the angle was ${currentAngle.deg}°`}
                </div>
                <Button onClick={pickRandomAngle} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800]">
                  next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === "fill" && currentAngle && (
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-6 space-y-4">
          <div className="text-center">
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">// fill in the values for</div>
            <div className="text-4xl font-bold text-[#c4f000] font-mono">{currentAngle.deg}°</div>
          </div>
          {!feedback ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1 block">sin({currentAngle.deg}°)</label>
                <Input
                  autoFocus
                  value={userSin}
                  onChange={(e) => setUserSin(e.target.value)}
                  placeholder="value (e.g. 1/2, √3/2)"
                  className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 font-mono focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1 block">cos({currentAngle.deg}°)</label>
                <Input
                  value={userCos}
                  onChange={(e) => setUserCos(e.target.value)}
                  placeholder="value"
                  className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 font-mono focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1 block">tan({currentAngle.deg}°)</label>
                <Input
                  value={userTan}
                  onChange={(e) => setUserTan(e.target.value)}
                  placeholder="value (or 'undef')"
                  className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 font-mono focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
                />
              </div>
              <Button onClick={checkMode2} disabled={!userSin || !userCos || !userTan} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800]">
            check
          </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={cn(
                "p-3 border text-sm",
                feedback === "correct" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" : "border-rose-500/30 bg-rose-500/5 text-rose-300"
              )}>
                {feedback === "correct" ? "all three correct!" : "one or more are wrong"}
              </div>
              <div className="p-3 border border-zinc-800 bg-[#0a0a0a] text-sm font-mono text-zinc-200">
                sin = {formatVal(currentAngle.sin)}, cos = {formatVal(currentAngle.cos)}, tan = {currentAngle.deg === 90 || currentAngle.deg === 270 ? "undef" : formatVal(currentAngle.tan)}
              </div>
              <Button onClick={pickRandomAngle} className="w-full bg-[#c4f000] text-black hover:bg-[#b3d800]">
                next
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
        <h3 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-3">// progress map</h3>
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
          {KEY_ANGLES.map((a) => {
            const mastered = progress.mastered.includes(a.deg);
            return (
              <div
                key={a.deg}
                className={cn(
                  "aspect-square flex items-center justify-center text-[10px] font-mono border",
                  mastered
                    ? "border-[#c4f000] bg-[#c4f000]/20 text-[#c4f000]"
                    : "border-zinc-800 bg-zinc-900 text-zinc-600"
                )}
                title={`${a.deg}°`}
              >
                {a.deg}
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-[10px] text-zinc-600 text-center">
          yellow = mastered · gray = still learning
        </div>
      </div>
    </div>
  );
}
