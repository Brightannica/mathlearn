"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search, LayoutDashboard, BookOpen, Code2, Target, Trophy, Flame, BarChart3,
  Wrench, FlaskConical, MessageSquare, Users, Settings, Brain, BookText,
  ArrowRight, Sun, Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllCourses } from "@/lib/courses";
import { getProblems } from "@/lib/problems";

type Item = {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  group: string;
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigate = useCallback((path: string) => {
    setOpen(false);
    router.push(path);
  }, [router]);

  const toggleTheme = useCallback(() => {
    setOpen(false);
    const html = document.documentElement;
    const isDark = html.classList.contains("dark");
    if (isDark) {
      html.classList.remove("dark");
      localStorage.setItem("mathitout-theme", "light");
    } else {
      html.classList.add("dark");
      localStorage.setItem("mathitout-theme", "dark");
    }
  }, []);

  const items: Item[] = useMemo(() => {
    const courses = getAllCourses();
    const problems = getProblems();

    const navItems: Item[] = [
      { id: "nav-dashboard", label: "Dashboard", icon: LayoutDashboard, action: () => navigate("/dashboard"), group: "navigate" },
      { id: "nav-learn", label: "Courses", icon: BookOpen, action: () => navigate("/learn"), group: "navigate" },
      { id: "nav-solve", label: "Solve", icon: Code2, action: () => navigate("/solve"), group: "navigate" },
      { id: "nav-practice", label: "Practice", icon: Target, action: () => navigate("/practice"), group: "navigate" },
      { id: "nav-review", label: "Spaced Review", icon: Brain, action: () => navigate("/review"), group: "navigate" },
      { id: "nav-cheatsheet", label: "Formula Sheets", icon: BookText, action: () => navigate("/cheatsheet"), group: "navigate" },
      { id: "nav-daily", label: "Daily Challenge", icon: Trophy, action: () => navigate("/daily-challenges"), group: "navigate" },
      { id: "nav-streaks", label: "Streaks", icon: Flame, action: () => navigate("/streaks"), group: "navigate" },
      { id: "nav-progress", label: "Progress", icon: BarChart3, action: () => navigate("/progress"), group: "navigate" },
      { id: "nav-achievements", label: "Achievements", icon: Trophy, action: () => navigate("/achievements"), group: "navigate" },
      { id: "nav-leaderboard", label: "Leaderboard", icon: Users, action: () => navigate("/leaderboard"), group: "navigate" },
      { id: "nav-tools", label: "Tools", icon: Wrench, action: () => navigate("/tools"), group: "navigate" },
      { id: "nav-visualizations", label: "Visualizations", icon: FlaskConical, action: () => navigate("/visualizations"), group: "navigate" },
      { id: "nav-community", label: "Community", icon: MessageSquare, action: () => navigate("/community"), group: "navigate" },
      { id: "nav-settings", label: "Settings", icon: Settings, action: () => navigate("/settings"), group: "navigate" },
    ];

    const courseItems: Item[] = courses.map((c) => ({
      id: `course-${c.slug}`,
      label: c.title,
      hint: `course · ${c.subject} · grade ${c.grade}`,
      icon: BookOpen,
      action: () => navigate(`/learn/${c.slug}`),
      group: "courses",
    }));

    const problemItems: Item[] = problems.map((p) => ({
      id: `problem-${p.slug}`,
      label: p.title,
      hint: `${p.difficulty} · ${p.topic} · ${p.xp} XP`,
      icon: Code2,
      action: () => navigate(`/solve?p=${p.slug}`),
      group: "problems",
    }));

    const actionItems: Item[] = [
      { id: "action-theme", label: "Toggle theme", icon: Sun, action: toggleTheme, group: "actions" },
    ];

    return [...navItems, ...courseItems, ...problemItems, ...actionItems];
  }, [navigate, toggleTheme]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-2xl border border-zinc-800 bg-[#0a0a0a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="bg-[#0a0a0a] text-zinc-100" shouldFilter>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
            <Search className="h-4 w-4 text-zinc-500" />
            <Command.Input
              placeholder="type a command or search..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-600"
              autoFocus
            />
            <kbd className="text-[10px] text-zinc-600 border border-zinc-800 px-1.5 py-0.5 font-mono">esc</kbd>
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-zinc-500">no results found</Command.Empty>
            {["navigate", "courses", "problems", "actions"].map((group) => (
              <Command.Group key={group} heading={group} className="text-[10px] uppercase tracking-widest text-zinc-500 px-2 py-1.5">
                {items.filter((i) => i.group === group).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Command.Item
                      key={item.id}
                      value={item.label + " " + (item.hint || "")}
                      onSelect={item.action}
                      className="flex items-center gap-3 px-2 py-2 cursor-pointer rounded data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-100 text-zinc-300 hover:bg-zinc-900"
                    >
                      <Icon className="h-4 w-4 text-zinc-500" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">{item.label}</div>
                        {item.hint && <div className="text-[10px] text-zinc-600 truncate">{item.hint}</div>}
                      </div>
                      <ArrowRight className="h-3 w-3 text-zinc-600" />
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ))}
          </Command.List>
          <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 text-[10px] text-zinc-600">
            <div className="flex items-center gap-2">
              <kbd className="border border-zinc-800 px-1.5 py-0.5 font-mono">↑↓</kbd>
              <span>navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="border border-zinc-800 px-1.5 py-0.5 font-mono">↵</kbd>
              <span>select</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="border border-zinc-800 px-1.5 py-0.5 font-mono">esc</kbd>
              <span>close</span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
