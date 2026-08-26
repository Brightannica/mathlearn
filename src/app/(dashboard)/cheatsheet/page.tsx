"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, ChevronRight, Hash, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { formulaSheets, getFormulaSheet } from "@/lib/formulas";
import { getAllCourses } from "@/lib/courses";

export default function CheatsheetIndex() {
  const courses = getAllCourses();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return formulaSheets;
    const term = search.toLowerCase();
    return formulaSheets.filter(
      (s) =>
        s.title.toLowerCase().includes(term) ||
        s.formulas.some(
          (f) => f.name.toLowerCase().includes(term) || f.description.toLowerCase().includes(term)
        )
    );
  }, [search]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// quick reference</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-7 w-7" />
          formula sheets
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">all the formulas you need, organized by course. no flipping through textbooks.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search formulas..."
          className="pl-9 bg-[#0d0d0d] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((sheet) => {
          const course = courses.find((c) => c.slug === sheet.courseSlug);
          return (
            <Link
              key={sheet.courseSlug}
              href={`/cheatsheet/${sheet.courseSlug}`}
              className="block group"
            >
              <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5 hover:border-zinc-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-11 h-11 border-2 flex items-center justify-center font-bold text-lg"
                    style={{ borderColor: course?.color || "#c4f000", color: course?.color || "#c4f000" }}
                  >
                    {course?.icon || "ƒ"}
                  </div>
                  <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-500">
                    {sheet.formulas.length} formulas
                  </Badge>
                </div>
                <h3 className="font-semibold group-hover:text-[#c4f000] transition-colors">{sheet.title}</h3>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                  {sheet.formulas.slice(0, 3).map((f) => f.name).join(" · ")}
                </p>
                <div className="mt-3 text-xs text-zinc-500 group-hover:text-[#c4f000] transition-colors flex items-center gap-1">
                  open sheet <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
