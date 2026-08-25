"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Show the warming-up UI after this many ms of no hydration signal
const COLD_START_WARNING_MS = 5000;
// Retry the page load if the first attempt hangs
const RETRY_DELAYS_MS = [0, 3000, 5000, 8000, 12000, 18000, 25000];

export function ColdStartWatchdog() {
  const [showWarming, setShowWarming] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Mark ready after first paint + a small delay
    const readyTimer = setTimeout(() => setReady(true), 2000);
    // If still not ready after the threshold, show the warming UI
    const warmingTimer = setTimeout(() => {
      if (!ready) setShowWarming(true);
    }, COLD_START_WARNING_MS);

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(warmingTimer);
    };
  }, [ready]);

  useEffect(() => {
    if (!showWarming) return;
    if (attempt >= RETRY_DELAYS_MS.length) return;
    const delay = RETRY_DELAYS_MS[attempt] ?? 3000;
    const t = setTimeout(() => {
      setAttempt((a) => a + 1);
      window.location.reload();
    }, delay);
    return () => clearTimeout(t);
  }, [showWarming, attempt]);

  if (!showWarming) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] text-zinc-100 font-mono">
      <div className="max-w-md w-full px-6 text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-amber-400">// warming up</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-zinc-100">spinning up the service</h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            free-tier render puts the server to sleep after 15 minutes idle. the first visit wakes it up — usually 20–50 seconds.
          </p>
        </div>

        <div className="border border-zinc-800 bg-[#0d0d0d] p-4 text-left text-xs space-y-2">
          <div className="text-zinc-600">// status</div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">attempt</span>
            <span className="text-[#c4f000]">{attempt + 1}/{RETRY_DELAYS_MS.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">next retry</span>
            <span className="text-zinc-500">
              {attempt >= RETRY_DELAYS_MS.length - 1
                ? "click below"
                : `in ${((RETRY_DELAYS_MS[attempt + 1] ?? 0) / 1000).toFixed(0)}s`}
            </span>
          </div>
          <div className="h-1 bg-zinc-900 overflow-hidden">
            <div
              className={cn("h-full bg-[#c4f000] transition-all duration-1000")}
              style={{ width: `${Math.min(((attempt + 1) / RETRY_DELAYS_MS.length) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 text-xs">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-zinc-800 hover:border-[#c4f000] hover:text-[#c4f000] transition-colors"
          >
            ↻ retry now
          </button>
        </div>

        <div className="text-[10px] text-zinc-700">
          tip: keep this tab open to avoid cold starts entirely
        </div>
      </div>
    </div>
  );
}
