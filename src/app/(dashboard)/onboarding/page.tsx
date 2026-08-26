"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight, ArrowLeft, Check, GraduationCap, Brain, Target, Code2,
  Trophy, Sparkles, Zap, BookOpen, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "mathitout-onboarding-v1";

const steps = [
  {
    title: "welcome to mathitout",
    description: "a practice-first math app. no gamification theater. just problems, and you getting better at them.",
    icon: Sparkles,
    color: "#c4f000",
  },
  {
    title: "start with the daily drill",
    description: "5 fresh problems every day, generated from your weak spots. 5 minutes. 5 topics. one per day at midnight.",
    icon: Brain,
    color: "#60a5fa",
  },
  {
    title: "explore the courses",
    description: "8 courses from pre-algebra to AP calculus. structured, not a pile of videos. pick one and start.",
    icon: GraduationCap,
    color: "#a78bfa",
  },
  {
    title: "solve coding challenges",
    description: "writing code sharpens problem-solving. 71+ problems with in-browser runner, tests, and XP.",
    icon: Code2,
    color: "#f472b6",
  },
  {
    title: "track your progress",
    description: "spaced repetition brings problems back at the right time. weak spots surface. streaks build. achievements unlock.",
    icon: Target,
    color: "#fbbf24",
  },
  {
    title: "ready to go",
    description: "your learning is yours. no ads, no data selling, no confetti when you guess right. just progress.",
    icon: Trophy,
    color: "#34d399",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem(STORAGE_KEY) === "dismissed") {
        setDismissed(true);
      }
    }
  }, []);

  if (dismissed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center">
        <p className="text-zinc-500">onboarding dismissed. <button onClick={() => { localStorage.removeItem(STORAGE_KEY); setDismissed(false); }} className="text-[#c4f000] underline">show again</button></p>
      </div>
    );
  }

  const currentStep = steps[step];
  const Icon = currentStep.icon;
  const isLast = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem(STORAGE_KEY, "dismissed");
      router.push("/dashboard");
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
            step {step + 1} of {steps.length}
          </div>
          <button
            onClick={handleSkip}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            skip
          </button>
        </div>

        <Progress value={progress} className="h-1" />

        <div
          className="border p-8 text-center space-y-6 relative overflow-hidden"
          style={{ borderColor: currentStep.color + "40" }}
        >
          <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: currentStep.color }} />

          <div
            className="inline-flex p-4 border-2"
            style={{ borderColor: currentStep.color, color: currentStep.color }}
          >
            <Icon className="h-10 w-10" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">{currentStep.title}</h1>
            <p className="text-zinc-400 leading-relaxed max-w-md mx-auto">{currentStep.description}</p>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 transition-all",
                  i === step ? "w-8" : "w-1.5",
                  i <= step ? "" : "bg-zinc-800"
                )}
                style={i <= step ? { backgroundColor: currentStep.color } : {}}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            variant="ghost"
            className="text-zinc-400"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> back
          </Button>
          <Button
            onClick={handleNext}
            className="bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold"
          >
            {isLast ? "start learning" : "next"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
