"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, Code2, BookOpen, Brain, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProblems } from "@/lib/problems";
import { getAllCourses, courses } from "@/lib/courses";
import { formulaSheets } from "@/lib/formulas";
import { generateProblems } from "@/lib/problem-generator";

type SearchResult = {
  type: "problem" | "course" | "formula-sheet" | "formula" | "topic" | "command";
  title: string;
  subtitle?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchType?: string;
};

const NAV_COMMANDS: SearchResult[] = [
  { type: "command", title: "Dashboard", href: "/dashboard", icon: BookOpen },
  { type: "command", title: "Daily Drill", href: "/daily-drill", icon: Brain },
  { type: "command", title: "Problem of the Day", href: "/daily", icon: Code2 },
  { type: "command", title: "Custom Quiz", href: "/quiz", icon: Code2 },
  { type: "command", title: "Courses", href: "/learn", icon: BookOpen },
  { type: "command", title: "Solve Problems", href: "/solve", icon: Code2 },
  { type: "command", title: "Spaced Review", href: "/review", icon: Brain },
  { type: "command", title: "Formula Sheets", href: "/cheatsheet", icon: FileText },
  { type: "command", title: "Study Groups", href: "/study", icon: BookOpen },
  { type: "command", title: "Progress", href: "/progress", icon: BookOpen },
  { type: "command", title: "Achievements", href: "/achievements", icon: Brain },
  { type: "command", title: "Streaks", href: "/streaks", icon: Brain },
  { type: "command", title: "Leaderboard", href: "/leaderboard", icon: BookOpen },
  { type: "command", title: "Tools", href: "/tools", icon: BookOpen },
  { type: "command", title: "Visualizations", href: "/visualizations", icon: BookOpen },
  { type: "command", title: "Settings", href: "/settings", icon: BookOpen },
  { type: "command", title: "Profile", href: "/profile", icon: BookOpen },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(unsub);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    void tick;
    const allResults: SearchResult[] = [];

    // Search problems
    for (const p of getProblems()) {
      if (p.title.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)) || p.topic.toLowerCase().includes(q)) {
        allResults.push({
          type: "problem",
          title: p.title,
          subtitle: `${p.difficulty} · ${p.topic} · ${p.xp} XP`,
          href: `/solve?p=${p.slug}`,
          icon: Code2,
          matchType: p.difficulty,
        });
      }
    }

    // Search courses
    for (const c of getAllCourses()) {
      if (c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q)) {
        allResults.push({
          type: "course",
          title: c.title,
          subtitle: `${c.subject} · grade ${c.grade} · ${c.units.reduce((s, u) => s + u.lessons.length, 0)} lessons`,
          href: `/learn/${c.slug}`,
          icon: BookOpen,
        });
      }
    }

    // Search formulas
    for (const sheet of formulaSheets) {
      if (sheet.title.toLowerCase().includes(q)) {
        allResults.push({
          type: "formula-sheet",
          title: sheet.title,
          subtitle: `${sheet.formulas.length} formulas`,
          href: `/cheatsheet/${sheet.courseSlug}`,
          icon: FileText,
        });
      }
      for (const f of sheet.formulas) {
        if (f.name.toLowerCase().includes(q) || f.latex.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)) {
          allResults.push({
            type: "formula",
            title: f.name,
            subtitle: `${sheet.title} · ${f.description.slice(0, 60)}`,
            href: `/cheatsheet/${sheet.courseSlug}`,
            icon: FileText,
            matchType: f.latex,
          });
        }
      }
    }

    // Search generated problems (sampled)
    try {
      const generated = generateProblems({ count: 5, difficulty: "mixed", seed: q.length * 1000 + Date.now() % 1000 });
      for (const g of generated) {
        if (g.question.toLowerCase().includes(q)) {
          allResults.push({
            type: "topic",
            title: g.question.slice(0, 80),
            subtitle: `${g.difficulty} · ${g.topic} · practice now`,
            href: `/quiz?topic=${g.topic}`,
            icon: Brain,
          });
        }
      }
    } catch {}

    // Search commands
    for (const cmd of NAV_COMMANDS) {
      if (cmd.title.toLowerCase().includes(q)) {
        allResults.push(cmd);
      }
    }

    return allResults.slice(0, 30);
  }, [query, tick]);

  const grouped = useMemo(() => {
    if (!results) return null;
    const groups: Record<string, SearchResult[]> = {};
    for (const r of results) {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    }
    return groups;
  }, [results]);

  const typeLabel: Record<string, { name: string; icon: React.ComponentType<{ className?: string }> }> = {
    problem: { name: "problems", icon: Code2 },
    course: { name: "courses", icon: BookOpen },
    "formula-sheet": { name: "formula sheets", icon: FileText },
    formula: { name: "formulas", icon: FileText },
    topic: { name: "practice problems", icon: Brain },
    command: { name: "pages", icon: ArrowRight },
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// search</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Search className="h-7 w-7" />
          search
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">problems, courses, formulas, and pages. one search.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search problems, courses, formulas..."
          className="pl-9 pr-9 h-12 bg-[#0d0d0d] border-zinc-800 text-zinc-100 text-base placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!query && (
        <div className="space-y-4">
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-6">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">quick access</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {NAV_COMMANDS.slice(0, 8).map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <Link
                    key={cmd.href}
                    href={cmd.href}
                    className="flex items-center justify-between p-3 border border-zinc-800/40 hover:border-zinc-700 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-zinc-500" />
                      <span className="text-sm">{cmd.title}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-[#c4f000] transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-6">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">try searching for</h3>
            <div className="flex flex-wrap gap-2">
              {["quadratic", "pythagorean", "derivative", "fibonacci", "mean", "factorial", "algebra", "geometry", "formula"].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="px-3 py-1 text-xs border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {query && results && results.length === 0 && (
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-12 text-center">
          <Search className="h-8 w-8 mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-400">no results for "{query}"</p>
          <p className="text-xs text-zinc-600 mt-1">try searching for topics like "quadratic" or "algebra"</p>
        </div>
      )}

      {query && grouped && (
        <div className="space-y-4">
          {Object.entries(grouped).map(([type, items]) => {
            const label = typeLabel[type];
            if (!label) return null;
            const Icon = label.icon;
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Icon className="h-3.5 w-3.5 text-zinc-500" />
                  <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">{label.name}</h3>
                  <span className="text-[10px] text-zinc-700 font-mono">{items.length}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((r, i) => {
                    const RIcon = r.icon;
                    return (
                      <Link
                        key={`${type}-${i}`}
                        href={r.href}
                        className="flex items-center justify-between p-3 border border-zinc-800/40 hover:border-zinc-700 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <RIcon className="h-4 w-4 text-zinc-500 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{r.title}</div>
                            {r.subtitle && (
                              <div className="text-[10px] text-zinc-500 truncate font-mono">{r.subtitle}</div>
                            )}
                          </div>
                          {r.matchType && (
                            <code className="text-[10px] text-zinc-600 font-mono px-1.5 py-0.5 bg-zinc-900 truncate max-w-[200px]">
                              {r.matchType}
                            </code>
                          )}
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-[#c4f000] transition-colors shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
