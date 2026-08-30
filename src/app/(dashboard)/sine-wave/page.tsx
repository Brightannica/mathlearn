"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sigma, Sparkles, RotateCcw, Play, Pause, Volume2, VolumeX, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { getState, subscribe, markProblemSolved } from "@/lib/local-state";

export default function TrigWavePage() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const [amplitude, setAmplitude] = useState(1);
  const [frequency, setFrequency] = useState(1);
  const [phase, setPhase] = useState(0);
  const [verticalShift, setVerticalShift] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
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
      const stored = localStorage.getItem("mathitout-trig-score");
      if (stored) {
        try { setScore(JSON.parse(stored)); } catch {}
      }
    }
  }, [tick]);

  const state = getState();
  void tick;

  const W = 600;
  const H = 400;
  const scaleX = W / 12;
  const scaleY = H / 6;
  const toSvgX = (x: number) => W / 2 + x * scaleX;
  const toSvgY = (y: number) => H / 2 - (y - verticalShift) * scaleY;

  const wavePath = useMemo(() => {
    const points: string[] = [];
    for (let px = 0; px <= W; px += 1) {
      const x = (px - W / 2) / scaleX;
      const y = amplitude * Math.sin(2 * Math.PI * frequency * x + phase) + verticalShift;
      const py = toSvgY(y);
      points.push(`${px === 0 ? "M" : "L"}${px},${py.toFixed(1)}`);
    }
    return points.join(" ");
  }, [amplitude, frequency, phase, verticalShift, scaleX, scaleY]);

  // Sound generation
  useEffect(() => {
    if (typeof window === "undefined" || !playing) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.value = muted ? 0 : 0.05;
    const osc = ctx.createOscillator();
    osc.frequency.value = 220 * frequency;
    osc.type = "sine";
    osc.connect(gain);
    osc.start();

    return () => {
      try { osc.stop(); } catch {}
      try { ctx.close(); } catch {}
    };
  }, [playing, frequency, muted]);

  const generateChallenge = () => {
    const types = ["amplitude", "period", "frequency"];
    const type = types[Math.floor(Math.random() * types.length)];
    if (type === "amplitude") {
      const a = Math.floor(Math.random() * 4) + 1;
      setChallenge({
        type,
        question: `what is the amplitude of y = ${a} sin(x)?`,
        answer: a,
      });
    } else if (type === "period") {
      const f = Math.floor(Math.random() * 3) + 1;
      const period = (2 * Math.PI) / f;
      setChallenge({
        type,
        question: `what is the period of y = sin(${f}x)? (in terms of π, 2dp)`,
        answer: Math.round(period * 100) / 100,
      });
    } else {
      const f = Math.floor(Math.random() * 3) + 1;
      setChallenge({
        type,
        question: `what is the frequency of y = sin(${f * 2}πx)?`,
        answer: f,
      });
    }
    setUserAnswer("");
    setFeedback(null);
  };

  useEffect(() => {
    if (!challenge) generateChallenge();
  }, [challenge]);

  const isCorrect = challenge && Math.abs(parseFloat(userAnswer) - challenge.answer) < 0.05;

  const checkAnswer = () => {
    if (!challenge) return;
    setFeedback(isCorrect ? "correct" : "wrong");
    setScore((s) => {
      const next = { correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 };
      try { localStorage.setItem("mathitout-trig-score", JSON.stringify(next)); } catch {}
      return next;
    });
    if (isCorrect) {
      markProblemSolved(`trig-wave-${Date.now()}`, 5, 1);
      toast({ title: "correct!", description: "wave mastery +5 XP" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// feel the wave</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sigma className="h-7 w-7" />
          sine wave generator
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">adjust amplitude, frequency, phase, and offset. hear the wave.</p>
      </div>

      <div className="flex gap-1.5">
        <Button
          onClick={() => setPlaying(!playing)}
          className={cn("font-semibold", playing ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-[#c4f000] text-black hover:bg-[#b3d800]")}
        >
          {playing ? <><Pause className="h-4 w-4 mr-2" /> stop sound</> : <><Play className="h-4 w-4 mr-2" /> play sound</>}
        </Button>
        <Button
          onClick={() => setMuted(!muted)}
          variant="outline"
          className="border-zinc-800"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5 space-y-4">
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// parameters</div>
          <div className="text-center text-xl font-mono text-zinc-100 py-3">
            y = {amplitude} · sin(2π·{frequency}x + {phase.toFixed(2)}) {verticalShift >= 0 ? "+" : "−"} {Math.abs(verticalShift).toFixed(1)}
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">amplitude (A)</span>
                <span className="text-[#c4f000] font-mono font-semibold">{amplitude}</span>
              </div>
              <input type="range" min="0.1" max="3" step="0.1" value={amplitude} onChange={(e) => setAmplitude(parseFloat(e.target.value))} className="w-full" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">frequency (f)</span>
                <span className="text-[#c4f000] font-mono font-semibold">{frequency} Hz</span>
              </div>
              <input type="range" min="0.1" max="3" step="0.1" value={frequency} onChange={(e) => setFrequency(parseFloat(e.target.value))} className="w-full" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">phase (φ)</span>
                <span className="text-[#c4f000] font-mono font-semibold">{phase.toFixed(2)} rad</span>
              </div>
              <input type="range" min="0" max={2 * Math.PI} step="0.1" value={phase} onChange={(e) => setPhase(parseFloat(e.target.value))} className="w-full" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">vertical shift (D)</span>
                <span className="text-[#c4f000] font-mono font-semibold">{verticalShift.toFixed(1)}</span>
              </div>
              <input type="range" min="-2" max="2" step="0.1" value={verticalShift} onChange={(e) => setVerticalShift(parseFloat(e.target.value))} className="w-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => { setAmplitude(1); setFrequency(1); setPhase(0); setVerticalShift(0); }} variant="outline" className="border-zinc-800 text-xs">
              <RotateCcw className="h-3 w-3 mr-1" /> reset
            </Button>
            <Button onClick={() => { setAmplitude(1); setFrequency(2); setPhase(0); setVerticalShift(0); }} variant="outline" className="border-zinc-800 text-xs">
              double freq
            </Button>
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
            <line x1="0" y1={toSvgY(0)} x2={W} y2={toSvgY(0)} stroke="#44403c" strokeWidth="1" />
            <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke="#44403c" strokeWidth="1" />
            {verticalShift !== 0 && (
              <line x1="0" y1={toSvgY(verticalShift)} x2={W} y2={toSvgY(verticalShift)} stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.5" />
            )}
            <path d={wavePath} fill="none" stroke="#c4f000" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-px bg-zinc-800/60 border border-zinc-800/60">
        <div className="bg-[#0d0d0d] p-3 text-center">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">amplitude</div>
          <div className="text-lg font-bold text-zinc-100 mt-1">{amplitude}</div>
        </div>
        <div className="bg-[#0d0d0d] p-3 text-center">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">period</div>
          <div className="text-lg font-bold text-zinc-100 mt-1">{(2 * Math.PI / frequency).toFixed(2)}</div>
        </div>
        <div className="bg-[#0d0d0d] p-3 text-center">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">frequency</div>
          <div className="text-lg font-bold text-zinc-100 mt-1">{frequency} Hz</div>
        </div>
        <div className="bg-[#0d0d0d] p-3 text-center">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">offset</div>
          <div className="text-lg font-bold text-zinc-100 mt-1">{verticalShift.toFixed(1)}</div>
        </div>
      </div>

      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// test yourself</div>
            <h3 className="font-semibold text-sm">wave quiz</h3>
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
