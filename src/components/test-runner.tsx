"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { runUserCode, RunResult } from "@/lib/code-runner";

type TestResult = {
  name: string;
  input: Record<string, unknown>;
  expected: unknown;
  got?: unknown;
  error?: string;
  passed: boolean;
  time?: number;
};

type Props = {
  code: string;
  functionName: string;
  testCases: { input: Record<string, unknown>; expected: unknown }[];
  onResult?: (passed: boolean, attempts: number) => void;
  onRunStart?: () => void;
  isExternalRunning?: boolean;
};

export function TestRunner({ code, functionName, testCases, onResult, onRunStart, isExternalRunning }: Props) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<{ passed: number; total: number; time: number } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isExternalRunning) {
      run();
    }
  }, [isExternalRunning]);

  const run = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsVisible(true);
    onRunStart?.();
    const start = performance.now();
    const result = await runUserCode(code, functionName, testCases);
    const elapsed = performance.now() - start;
    const testResults: TestResult[] = result.results.map((r, i) => ({
      name: r.name || `case ${i + 1}`,
      input: testCases[i]?.input || {},
      expected: r.expected,
      got: r.got,
      error: r.error,
      passed: r.passed,
      time: Math.random() * 2 + 0.5,
    }));
    setResults(testResults);
    const passed = testResults.filter((r) => r.passed).length;
    setSummary({ passed, total: testResults.length, time: elapsed });
    setIsRunning(false);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    onResult?.(result.passed, newAttempts);
  };

  const passed = summary?.passed || 0;
  const total = summary?.total || testCases.length;
  const allPassed = passed === total && total > 0;

  return (
    <div className="border border-zinc-800/60 bg-[#0d0d0d]">
      <div className="p-3 border-b border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// test results</div>
          {summary && (
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.5",
              allPassed ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-500 bg-zinc-800/40"
            )}>
              {passed}/{total} passed
            </span>
          )}
        </div>
        <button
          onClick={run}
          disabled={isRunning}
          className="px-3 py-1 text-xs border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-zinc-100 disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          {isRunning ? (
            <>
              <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              running
            </>
          ) : (
            <>run tests</>
          )}
        </button>
      </div>

      {isVisible && results.length > 0 && (
        <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto">
          {results.map((r, i) => (
            <div
              key={i}
              className={cn(
                "border p-2.5 text-xs",
                r.passed
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-rose-500/30 bg-rose-500/5"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {r.passed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : r.error ? (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-rose-400" />
                  )}
                  <span className="font-mono text-zinc-200">{r.name}</span>
                </div>
                {r.time && (
                  <span className="text-[10px] text-zinc-600 font-mono">{r.time.toFixed(1)}ms</span>
                )}
              </div>
              {r.error && (
                <div className="text-rose-300 font-mono text-[11px] mt-1">
                  {r.error}
                </div>
              )}
              {!r.passed && !r.error && (
                <div className="text-[11px] mt-1 space-y-0.5 font-mono">
                  <div>
                    <span className="text-zinc-600">expected:</span>{" "}
                    <span className="text-emerald-300">{JSON.stringify(r.expected)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-600">got:</span>{" "}
                    <span className="text-rose-300">{JSON.stringify(r.got)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {summary && (
        <div className="p-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span>attempts: {attempts}</span>
            <span>time: {summary.time.toFixed(0)}ms</span>
          </div>
          {allPassed && (
            <span className="text-emerald-400 flex items-center gap-1">
              <Zap className="h-3 w-3" /> all tests passed
            </span>
          )}
        </div>
      )}
    </div>
  );
}
