"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Coffee, Target, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Session = "work" | "short_break" | "long_break";

const SESSION_DURATIONS: Record<Session, number> = {
  work: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export function StudyTimer() {
  const [seconds, setSeconds] = useState(SESSION_DURATIONS.work);
  const [running, setRunning] = useState(false);
  const [session, setSession] = useState<Session>("work");
  const [completed, setCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      // Session complete
      if (session === "work") {
        const newCompleted = completed + 1;
        setCompleted(newCompleted);
        const nextSession: Session = newCompleted % 4 === 0 ? "long_break" : "short_break";
        setSession(nextSession);
        setSeconds(SESSION_DURATIONS[nextSession]);
        if (typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("break time", { body: "take 5 minutes. you've earned it." });
          }
        }
      } else {
        setSession("work");
        setSeconds(SESSION_DURATIONS.work);
        if (typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("back to work", { body: "ready for another session?" });
          }
        }
      }
      setRunning(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, seconds, session, completed]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const toggle = () => {
    setRunning((r) => !r);
  };

  const reset = () => {
    setRunning(false);
    setSeconds(SESSION_DURATIONS[session]);
  };

  const switchSession = (s: Session) => {
    setRunning(false);
    setSession(s);
    setSeconds(SESSION_DURATIONS[s]);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const totalSecs = SESSION_DURATIONS[session];
  const progress = ((totalSecs - seconds) / totalSecs) * 100;

  const sessionLabel = {
    work: "focus",
    short_break: "short break",
    long_break: "long break",
  };

  const sessionColor = {
    work: "#c4f000",
    short_break: "#60a5fa",
    long_break: "#a78bfa",
  };

  return (
    <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-zinc-500" />
          <span className="font-semibold text-sm">pomodoro</span>
        </div>
        <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">
          {completed} done
        </Badge>
      </div>

      <div className="flex gap-1">
        {(["work", "short_break", "long_break"] as const).map((s) => (
          <button
            key={s}
            onClick={() => switchSession(s)}
            className={cn(
              "flex-1 px-2 py-1.5 text-[10px] uppercase tracking-wider border transition-colors",
              session === s
                ? "border-zinc-500 text-zinc-100"
                : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
            )}
          >
            {sessionLabel[s]}
          </button>
        ))}
      </div>

      <div className="text-center py-3">
        <div
          className="text-5xl font-bold font-mono"
          style={{ color: sessionColor[session] }}
        >
          {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
        <div className="mt-2 h-1 bg-zinc-900 overflow-hidden">
          <div
            className="h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%`, backgroundColor: sessionColor[session] }}
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          onClick={toggle}
          className="flex-1 h-10 font-semibold"
          style={{ backgroundColor: sessionColor[session], color: "#0a0a0a" }}
        >
          {running ? <><Pause className="h-4 w-4 mr-2" /> pause</> : <><Play className="h-4 w-4 mr-2" /> {seconds === SESSION_DURATIONS[session] ? "start" : "resume"}</>}
        </Button>
        <Button
          onClick={reset}
          variant="outline"
          className="h-10 border-zinc-800 hover:border-zinc-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="text-[10px] text-zinc-600 text-center font-mono">
        25min focus · 5min break · repeat · 15min break every 4
      </div>
    </div>
  );
}
