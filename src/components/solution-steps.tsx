"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ChevronRight, BookOpen, Code2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateSolutionSteps } from "@/lib/solution-generator";
import type { GeneratedProblem } from "@/lib/problem-generator";

export function SolutionSteps({ problem, onClose }: { problem: GeneratedProblem; onClose?: () => void }) {
  const [revealedCount, setRevealedCount] = useState(0);
  const steps = generateSolutionSteps(problem);

  if (steps.length === 0) {
    return (
      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
        <p className="text-sm text-zinc-400">No step-by-step solution available for this problem.</p>
      </div>
    );
  }

  return (
    <div className="border border-zinc-800/60 bg-[#0d0d0d]">
      <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-[#c4f000]" />
          <h3 className="font-semibold text-sm">step-by-step solution</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="p-4 space-y-2">
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              "border transition-all",
              i < revealedCount ? "border-zinc-700" : "border-zinc-800/40 opacity-50",
              i === revealedCount && "border-[#c4f000]/40 opacity-100",
              step.highlight === "answer" && i < revealedCount && "border-emerald-500/40 bg-emerald-500/5"
            )}
          >
            <button
              onClick={() => setRevealedCount((c) => Math.max(c, i + 1))}
              disabled={i > revealedCount}
              className="w-full text-left p-3 disabled:cursor-default"
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-6 h-6 shrink-0 flex items-center justify-center text-xs font-mono border",
                  i < revealedCount
                    ? step.highlight === "answer" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-zinc-700 text-zinc-300"
                    : "border-zinc-800 text-zinc-600"
                )}>
                  {i < revealedCount ? (step.highlight === "answer" ? "✓" : i + 1) : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-sm font-medium", i < revealedCount ? "text-zinc-100" : "text-zinc-600")}>
                    {i < revealedCount ? step.title : "???"}
                  </div>
                  {i < revealedCount && step.content && (
                    <p className="text-sm text-zinc-400 mt-1">{step.content}</p>
                  )}
                  {i < revealedCount && step.formula && (
                    <div className="mt-2 px-3 py-2 bg-[#0a0a0a] border border-zinc-800/60 font-mono text-sm text-zinc-200">
                      {step.formula}
                    </div>
                  )}
                </div>
                {i === revealedCount && steps.length > i + 1 && (
                  <ChevronRight className="h-4 w-4 text-[#c4f000] shrink-0 mt-1" />
                )}
              </div>
            </button>
          </div>
        ))}
        {revealedCount >= steps.length && (
          <div className="pt-2 text-center text-xs text-zinc-500">
            all steps revealed
          </div>
        )}
      </div>
    </div>
  );
}
