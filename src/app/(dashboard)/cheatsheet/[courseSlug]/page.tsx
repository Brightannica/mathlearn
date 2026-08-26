"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Copy, Check } from "lucide-react";
import { getFormulaSheet, formulaSheets } from "@/lib/formulas";
import { getCourseBySlug } from "@/lib/courses";
import { cn } from "@/lib/utils";

export default function CheatsheetDetail() {
  const params = useParams<{ courseSlug: string }>();
  const router = useRouter();
  const sheet = getFormulaSheet(params.courseSlug);
  const course = getCourseBySlug(params.courseSlug);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!sheet) return [];
    if (!search.trim()) return sheet.formulas;
    const term = search.toLowerCase();
    return sheet.formulas.filter(
      (f) => f.name.toLowerCase().includes(term) || f.description.toLowerCase().includes(term) || f.latex.toLowerCase().includes(term)
    );
  }, [search, sheet]);

  if (!sheet) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400">formula sheet not found</p>
        <Button onClick={() => router.push("/cheatsheet")} variant="outline" className="mt-4 border-zinc-800">
          back to sheets
        </Button>
      </div>
    );
  }

  const copyLatex = (latex: string, name: string) => {
    navigator.clipboard.writeText(latex);
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-100">
          <Link href="/cheatsheet">
            <ArrowLeft className="h-4 w-4 mr-1" /> all sheets
          </Link>
        </Button>
        {course && (
          <Badge variant="outline" className="border-zinc-700 text-zinc-400">
            grade {course.grade} · {course.totalXp} XP
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 border-2 flex items-center justify-center text-2xl font-bold"
          style={{ borderColor: course?.color || "#c4f000", color: course?.color || "#c4f000" }}
        >
          {course?.icon || "ƒ"}
        </div>
        <div>
          <div className="text-xs text-zinc-600 font-mono uppercase tracking-widest">// formula sheet</div>
          <h1 className="text-3xl font-bold tracking-tight">{sheet.title}</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{sheet.formulas.length} formulas · click to copy</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search this sheet..."
          className="pl-9 bg-[#0d0d0d] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((f) => (
          <button
            key={f.name}
            onClick={() => copyLatex(f.latex, f.name)}
            className="w-full text-left border border-zinc-800/60 bg-[#0d0d0d] hover:border-zinc-600 transition-colors p-4 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-zinc-100 group-hover:text-[#c4f000] transition-colors">{f.name}</h3>
                  {copied === f.name && (
                    <Badge variant="outline" className="border-[#c4f000]/30 text-[#c4f000] text-[10px]">
                      <Check className="h-3 w-3 mr-1" /> copied
                    </Badge>
                  )}
                </div>
                <div className="border border-zinc-800/40 bg-[#0a0a0a] px-4 py-3 font-mono text-sm text-zinc-200 mb-2 overflow-x-auto">
                  {f.latex}
                </div>
                <p className="text-sm text-zinc-400">{f.description}</p>
                <p className="text-[10px] text-zinc-600 mt-1.5 uppercase tracking-wider font-mono">
                  when: {f.when}
                </p>
              </div>
              <Copy className={cn("h-4 w-4 text-zinc-600 group-hover:text-[#c4f000] transition-colors shrink-0 mt-1", copied === f.name && "text-[#c4f000]")} />
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-12 text-center">
          <Search className="h-8 w-8 mx-auto text-zinc-700 mb-2" />
          <p className="text-zinc-500">no formulas match "{search}"</p>
        </div>
      )}
    </div>
  );
}
