"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Search, ChevronRight, ChevronLeft, Play, Send, RotateCcw,
  CheckCircle2, XCircle, Clock, Zap, Trophy, Filter, Lock, Sparkles,
  Terminal, Code2, FileText, ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  problems, getProblems, getProblemBySlug, Problem, ProblemDifficulty,
} from "@/lib/problems";
import { runUserCode, RunResult } from "@/lib/code-runner";
import { markProblemSolved, isSolved, getState, subscribe } from "@/lib/local-state";

const difficultyColor: Record<ProblemDifficulty, string> = {
  easy: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  medium: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  hard: "text-rose-400 border-rose-400/30 bg-rose-400/10",
};

const difficultyBg: Record<ProblemDifficulty, string> = {
  easy: "bg-emerald-500",
  medium: "bg-amber-500",
  hard: "bg-rose-500",
};

type View = "list" | "solve";

export default function SolvePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [view, setView] = useState<View>("list");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | ProblemDifficulty>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "solved" | "unsolved">("all");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const p = searchParams.get("p");
    if (p && getProblemBySlug(p)) {
      setActiveSlug(p);
      setView("solve");
    }
  }, [searchParams]);

  const openProblem = useCallback((slug: string) => {
    setActiveSlug(slug);
    setView("solve");
    const url = new URL(window.location.href);
    url.searchParams.set("p", slug);
    window.history.replaceState(null, "", url.toString());
  }, []);

  const goBack = useCallback(() => {
    setView("list");
    setActiveSlug(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("p");
    window.history.replaceState(null, "", url.toString());
  }, []);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  const state = getState();
  void tick;

  const filteredProblems = useMemo(() => {
    return getProblems().filter((p) => {
      if (difficultyFilter !== "all" && p.difficulty !== difficultyFilter) return false;
      if (topicFilter !== "all" && p.topic !== topicFilter) return false;
      if (statusFilter === "solved" && !isSolved(p.slug)) return false;
      if (statusFilter === "unsolved" && isSolved(p.slug)) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        if (!p.title.toLowerCase().includes(term) && !p.tags.some((t) => t.toLowerCase().includes(term))) return false;
      }
      return true;
    });
  }, [searchTerm, difficultyFilter, topicFilter, statusFilter, tick]);

  const topics = useMemo(() => Array.from(new Set(getProblems().map((p) => p.topic))).sort(), []);

  const stats = useMemo(() => {
    const all = getProblems();
    const solvedCount = all.filter((p) => isSolved(p.slug)).length;
    const easy = all.filter((p) => p.difficulty === "easy");
    const med = all.filter((p) => p.difficulty === "medium");
    const hard = all.filter((p) => p.difficulty === "hard");
    const easySolved = easy.filter((p) => isSolved(p.slug)).length;
    const medSolved = med.filter((p) => isSolved(p.slug)).length;
    const hardSolved = hard.filter((p) => isSolved(p.slug)).length;
    return {
      total: all.length,
      solved: solvedCount,
      easy: { total: easy.length, solved: easySolved },
      medium: { total: med.length, solved: medSolved },
      hard: { total: hard.length, solved: hardSolved },
    };
  }, [tick]);

  if (view === "solve" && activeSlug) {
    return <ProblemSolver slug={activeSlug} onBack={goBack} toast={toast} onNavigate={openProblem} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xs text-[#c4f000] uppercase tracking-widest">// problem set</div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Code2 className="h-7 w-7 text-[#c4f000]" />
            solve
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">pick a problem. write code. pass tests. earn XP.</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <div className="text-2xl font-bold text-[#c4f000]">{stats.solved}/{stats.total}</div>
            <div className="text-xs text-zinc-500">solved</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{state.streak}</div>
            <div className="text-xs text-zinc-500">day streak</div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-px bg-zinc-800/60 border border-zinc-800/60">
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-emerald-400 uppercase tracking-wider">easy</span>
            <span className="text-xs text-zinc-600 font-mono">{stats.easy.solved}/{stats.easy.total}</span>
          </div>
          <div className="h-1.5 bg-zinc-900">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${stats.easy.total ? (stats.easy.solved / stats.easy.total) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-400 uppercase tracking-wider">medium</span>
            <span className="text-xs text-zinc-600 font-mono">{stats.medium.solved}/{stats.medium.total}</span>
          </div>
          <div className="h-1.5 bg-zinc-900">
            <div
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${stats.medium.total ? (stats.medium.solved / stats.medium.total) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-rose-400 uppercase tracking-wider">hard</span>
            <span className="text-xs text-zinc-600 font-mono">{stats.hard.solved}/{stats.hard.total}</span>
          </div>
          <div className="h-1.5 bg-zinc-900">
            <div
              className="h-full bg-rose-500 transition-all"
              style={{ width: `${stats.hard.total ? (stats.hard.solved / stats.hard.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search problems or tags..."
            className="pl-9 bg-[#0d0d0d] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "easy", "medium", "hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={cn(
                "px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors",
                difficultyFilter === d
                  ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setTopicFilter("all")}
          className={cn(
            "px-2.5 py-1 text-xs border transition-colors",
            topicFilter === "all"
              ? "border-zinc-500 text-zinc-100"
              : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
          )}
        >
          all topics
        </button>
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setTopicFilter(t)}
            className={cn(
              "px-2.5 py-1 text-xs border transition-colors capitalize",
              topicFilter === t
                ? "border-zinc-500 text-zinc-100"
                : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
            )}
          >
            {t}
          </button>
        ))}
        <div className="flex-1" />
        {(["all", "solved", "unsolved"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-2.5 py-1 text-xs border transition-colors",
              statusFilter === s
                ? "border-zinc-500 text-zinc-100"
                : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Problem list */}
      <div className="border border-zinc-800/60 bg-[#0d0d0d]">
        {filteredProblems.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Filter className="h-8 w-8 mx-auto mb-2 text-zinc-700" />
            no problems match those filters
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {filteredProblems.map((p, idx) => {
              const solved = isSolved(p.slug);
              return (
                <button
                  key={p.id}
                  onClick={() => openProblem(p.slug)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-zinc-900/40 transition-colors group"
                >
                  <div className="w-8 shrink-0">
                    {solved ? (
                      <CheckCircle2 className="h-5 w-5 text-[#c4f000]" />
                    ) : (
                      <div className="h-5 w-5 border border-zinc-700 rounded-sm" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-zinc-500 text-sm font-mono">{String(idx + 1).padStart(3, "0")}.</span>
                      <span className={cn("font-medium", solved ? "text-zinc-400" : "text-zinc-100")}>
                        {p.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-600">
                      {p.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-zinc-600">· {t}</span>
                      ))}
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", difficultyColor[p.difficulty])}>
                    {p.difficulty}
                  </Badge>
                  <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-600">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" /> {p.xp}
                    </span>
                    <span className="flex items-center gap-1 w-16 justify-end">
                      {p.acceptance}%
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-[#c4f000] transition-colors" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ProblemSolver({
  slug,
  onBack,
  toast,
  onNavigate,
}: {
  slug: string;
  onBack: () => void;
  toast: ReturnType<typeof useToast>["toast"];
  onNavigate: (slug: string) => void;
}) {
  const problem = getProblemBySlug(slug);
  const [code, setCode] = useState(problem?.starterCode || "");
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [tab, setTab] = useState<"description" | "submissions">("description");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setCode(problem?.starterCode || "");
    setRunResult(null);
    setAttempts(0);
  }, [slug]);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  if (!problem) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400">problem not found</p>
        <Button onClick={onBack} variant="outline" className="mt-4">back</Button>
      </div>
    );
  }

  const solved = isSolved(slug);
  const allProblems = getProblems();
  const idx = allProblems.findIndex((p) => p.slug === slug);
  const next = allProblems[idx + 1];
  const prev = allProblems[idx - 1];

  const runTests = useCallback(async () => {
    setIsRunning(true);
    setRunResult(null);
    setAttempts((a) => a + 1);
    const result = await runUserCode(code, problem.functionName, problem.testCases);
    setRunResult(result);
    setIsRunning(false);

    if (result.passed) {
      const newState = markProblemSolved(problem.slug, problem.xp, attempts + 1);
      toast({
        title: "accepted",
        description: `+${problem.xp} XP · streak: ${newState.streak} days · level ${newState.level}`,
      });
    } else if (result.error) {
      toast({ title: "error", description: result.error, variant: "destructive" });
    }
  }, [code, problem, attempts, toast]);

  const handleSubmit = useCallback(async () => {
    setIsRunning(true);
    setRunResult(null);
    setAttempts((a) => a + 1);
    const result = await runUserCode(code, problem.functionName, problem.testCases);
    setRunResult(result);
    setIsRunning(false);

    if (result.passed) {
      const newState = markProblemSolved(problem.slug, problem.xp, attempts + 1);
      toast({
        title: "✓ accepted",
        description: `+${problem.xp} XP · level ${newState.level} · streak: ${newState.streak} days`,
      });
    }
  }, [code, problem, attempts, toast]);

  const reset = () => {
    setCode(problem.starterCode);
    setRunResult(null);
    setAttempts(0);
  };

  return (
    <div className="space-y-3 animate-in fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 text-zinc-400 hover:text-zinc-100 shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-0.5">
              <span className="font-mono">{String(idx + 1).padStart(3, "0")}</span>
              <span>·</span>
              <span className="capitalize">{problem.topic}</span>
            </div>
            <h1 className="text-lg font-semibold truncate flex items-center gap-2">
              {problem.title}
              {solved && <CheckCircle2 className="h-4 w-4 text-[#c4f000] shrink-0" />}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {prev && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate(prev.slug)}
              className="h-8 w-8 text-zinc-500 hover:text-zinc-100"
              title="previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {next && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate(next.slug)}
              className="h-8 w-8 text-zinc-500 hover:text-zinc-100"
              title="next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Left: description */}
        <div className="border border-zinc-800/60 bg-[#0d0d0d] flex flex-col min-h-[600px]">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "description" | "submissions")} className="flex-1 flex flex-col">
            <TabsList className="bg-zinc-900/40 border-b border-zinc-800/60 rounded-none justify-start h-auto p-0">
              <TabsTrigger value="description" className="data-[state=active]:bg-[#0d0d0d] data-[state=active]:text-zinc-100 rounded-none border-b-2 border-transparent data-[state=active]:border-[#c4f000] px-4 py-2.5">
                <FileText className="h-3.5 w-3.5 mr-1.5" /> description
              </TabsTrigger>
              <TabsTrigger value="submissions" className="data-[state=active]:bg-[#0d0d0d] data-[state=active]:text-zinc-100 rounded-none border-b-2 border-transparent data-[state=active]:border-[#c4f000] px-4 py-2.5">
                <ListChecks className="h-3.5 w-3.5 mr-1.5" /> test results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="flex-1 overflow-auto p-5 m-0 space-y-5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", difficultyColor[problem.difficulty])}>
                  {problem.difficulty}
                </Badge>
                <span className="text-xs text-zinc-600">·</span>
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {problem.xp} XP
                </span>
                <span className="text-xs text-zinc-600">·</span>
                <span className="text-xs text-zinc-500">{problem.acceptance}% acceptance</span>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">{problem.description}</p>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> examples
                </h3>
                <div className="space-y-2">
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="border border-zinc-800/60 bg-zinc-900/30 p-3 text-sm">
                      <div className="mb-1">
                        <span className="text-zinc-600 text-xs">input:</span>{" "}
                        <code className="text-[#c4f000] font-mono">{ex.input}</code>
                      </div>
                      <div className="mb-1">
                        <span className="text-zinc-600 text-xs">output:</span>{" "}
                        <code className="text-[#c4f000] font-mono">{ex.output}</code>
                      </div>
                      {ex.explanation && <div className="text-zinc-500 text-xs mt-1.5 italic">{ex.explanation}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">constraints</h3>
                <ul className="space-y-1 text-sm text-zinc-400">
                  {problem.constraints.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-zinc-700">·</span>
                      <code className="text-xs font-mono">{c}</code>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {problem.tags.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 border border-zinc-800 text-zinc-500">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="flex-1 overflow-auto p-5 m-0">
              {runResult ? (
                <div className="space-y-2">
                  <div className={cn(
                    "p-3 border text-sm mb-3",
                    runResult.passed
                      ? "border-[#c4f000]/30 bg-[#c4f000]/5 text-[#c4f000]"
                      : "border-rose-500/30 bg-rose-500/5 text-rose-400"
                  )}>
                    <div className="font-semibold flex items-center gap-2">
                      {runResult.passed ? (
                        <><CheckCircle2 className="h-4 w-4" /> accepted</>
                      ) : (
                        <><XCircle className="h-4 w-4" /> {runResult.error ? "runtime error" : "wrong answer"}</>
                      )}
                    </div>
                    <div className="text-xs mt-0.5 opacity-80">
                      {runResult.passedCount}/{runResult.total} test cases passed
                      {!runResult.passed && !runResult.error && " — see which cases failed below"}
                    </div>
                  </div>
                  {runResult.results.map((r, i) => (
                    <div
                      key={i}
                      className={cn(
                        "border p-3 text-sm font-mono",
                        r.passed
                          ? "border-zinc-800/60 bg-zinc-900/20"
                          : "border-rose-500/30 bg-rose-500/5"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-zinc-500">{r.name}</span>
                        {r.passed ? (
                          <span className="text-xs text-emerald-400">PASS</span>
                        ) : (
                          <span className="text-xs text-rose-400">FAIL</span>
                        )}
                      </div>
                      {r.error && (
                        <div className="text-xs text-rose-300 mb-1">error: {r.error}</div>
                      )}
                      {!r.passed && !r.error && (
                        <div className="text-xs space-y-0.5">
                          <div><span className="text-zinc-600">got:</span> <span className="text-rose-300">{JSON.stringify(r.got)}</span></div>
                          <div><span className="text-zinc-600">expected:</span> <span className="text-emerald-300">{JSON.stringify(r.expected)}</span></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-600 text-sm">
                  <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  run your code to see results
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: code editor */}
        <div className="border border-zinc-800/60 bg-[#0a0a0a] flex flex-col min-h-[600px]">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/60 bg-zinc-900/40">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Code2 className="h-3.5 w-3.5" />
              <span>javascript</span>
              <span>·</span>
              <span>function {problem.functionName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="h-7 text-xs text-zinc-500 hover:text-zinc-100"
            >
              <RotateCcw className="h-3 w-3 mr-1" /> reset
            </Button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full bg-[#0a0a0a] text-zinc-100 font-mono text-sm p-4 resize-none focus:outline-none border-0 leading-relaxed"
            style={{ tabSize: 2, minHeight: "400px" }}
          />

          <div className="border-t border-zinc-800/60 p-3 flex items-center justify-between gap-2 bg-zinc-900/30">
            <div className="text-xs text-zinc-500 flex items-center gap-3">
              <span>attempts: {attempts}</span>
              {solved && <span className="text-[#c4f000] flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> solved</span>}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={runTests}
                disabled={isRunning}
                className="h-9 border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
              >
                <Play className="h-3.5 w-3.5 mr-1.5" />
                run
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isRunning}
                className="h-9 bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                {isRunning ? "running..." : "submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
