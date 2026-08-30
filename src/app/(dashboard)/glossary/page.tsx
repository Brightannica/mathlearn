"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookText, Calculator, TrendingUp, BarChart3, Triangle, Sigma, FunctionSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { glossary, glossaryCategories, GlossaryTerm } from "@/lib/glossary";

const categoryIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  algebra: FunctionSquare,
  arithmetic: Calculator,
  geometry: Triangle,
  statistics: BarChart3,
  calculus: TrendingUp,
  trigonometry: Sigma,
  general: BookText,
};

const categoryColor: Record<string, string> = {
  algebra: "#c4f000",
  arithmetic: "#fbbf24",
  geometry: "#60a5fa",
  statistics: "#a78bfa",
  calculus: "#f472b6",
  trigonometry: "#fb923c",
  general: "#71717a",
};

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered: GlossaryTerm[] = useMemo(() => {
    let results = glossary;
    if (category !== "all") {
      results = results.filter((t) => t.category === category);
    }
    if (search.trim()) {
      const term = search.toLowerCase().trim();
      results = results.filter(
        (t) =>
          t.term.toLowerCase().includes(term) ||
          t.definition.toLowerCase().includes(term) ||
          (t.example && t.example.toLowerCase().includes(term))
      );
    }
    return results;
  }, [search, category]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// math dictionary</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookText className="h-7 w-7" />
          glossary
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">quick definitions for math terms across all topics.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
        <Input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search terms, definitions..."
          className="pl-9 bg-[#0d0d0d] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
        />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {glossaryCategories.map((c) => {
          const Icon = c.id !== "all" ? categoryIcon[c.id] : null;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                "px-3 py-1.5 text-xs border transition-colors flex items-center gap-1.5",
                category === c.id
                  ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
              )}
            >
              {Icon && <Icon className="h-3 w-3" />}
              {c.name}
            </button>
          );
        })}
      </div>

      <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
        {filtered.length} term{filtered.length !== 1 ? "s" : ""}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((t) => {
          const color = categoryColor[t.category] || "#71717a";
          return (
            <div
              key={t.term}
              className="border p-4 hover:border-zinc-600 transition-colors"
              style={{ borderColor: `${color}30`, backgroundColor: `${color}05` }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg text-zinc-100">{t.term}</h3>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase tracking-wider"
                  style={{ borderColor: `${color}40`, color }}
                >
                  {t.category}
                </Badge>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed mb-2">{t.definition}</p>
              {t.example && (
                <div className="text-xs text-zinc-500 font-mono italic">
                  e.g. {t.example}
                </div>
              )}
              {t.related && t.related.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {t.related.map((r) => (
                    <span key={r} className="text-[10px] px-1.5 py-0.5 border border-zinc-800 text-zinc-500">
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-12 text-center">
          <Search className="h-8 w-8 mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-500">no terms match "{search}"</p>
        </div>
      )}
    </div>
  );
}
