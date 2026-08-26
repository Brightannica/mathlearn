"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import {
  Search, X, Keyboard, ArrowRight, BookOpen, Code2, Target, Trophy,
  Brain, BarChart3, Flame, Users, Settings, Home, LogOut, Moon, Sun,
  Save, ChevronRight, Command as CommandIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Shortcut = {
  keys: string[];
  description: string;
  action?: () => void;
};

export function ShortcutsPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const navigate = useCallback((path: string) => {
    setOpen(false);
    router.push(path);
  }, [router]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !(e.target as HTMLElement)?.matches("input, textarea")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("mathitout-theme", "light");
    } else {
      html.classList.add("dark");
      localStorage.setItem("mathitout-theme", "dark");
    }
  }, []);

  const shortcuts: (Shortcut & { id: string; icon: any; group: string })[] = [
    { id: "dashboard", group: "navigation", keys: ["G", "D"], description: "Go to dashboard", icon: Home, action: () => navigate("/dashboard") },
    { id: "learn", group: "navigation", keys: ["G", "L"], description: "Go to courses", icon: BookOpen, action: () => navigate("/learn") },
    { id: "solve", group: "navigation", keys: ["G", "S"], description: "Go to solve", icon: Code2, action: () => navigate("/solve") },
    { id: "practice", group: "navigation", keys: ["G", "P"], description: "Go to practice", icon: Target, action: () => navigate("/practice") },
    { id: "quiz", group: "navigation", keys: ["G", "Q"], description: "Go to quiz", icon: Target, action: () => navigate("/quiz") },
    { id: "review", group: "navigation", keys: ["G", "R"], description: "Go to review", icon: Brain, action: () => navigate("/review") },
    { id: "cheatsheet", group: "navigation", keys: ["G", "F"], description: "Go to formulas", icon: BookOpen, action: () => navigate("/cheatsheet") },
    { id: "progress", group: "navigation", keys: ["G", "P"], description: "Go to progress", icon: BarChart3, action: () => navigate("/progress") },
    { id: "streaks", group: "navigation", keys: ["G", "S"], description: "Go to streaks", icon: Flame, action: () => navigate("/streaks") },
    { id: "leaderboard", group: "navigation", keys: ["G", "L"], description: "Go to leaderboard", icon: Trophy, action: () => navigate("/leaderboard") },
    { id: "tools", group: "navigation", keys: ["G", "T"], description: "Go to tools", icon: Settings, action: () => navigate("/tools") },
    { id: "settings", group: "navigation", keys: ["G", "S"], description: "Go to settings", icon: Settings, action: () => navigate("/settings") },
    { id: "achievements", group: "navigation", keys: ["G", "A"], description: "Go to achievements", icon: Trophy, action: () => navigate("/achievements") },
    { id: "daily-drill", group: "navigation", keys: ["G", "D"], description: "Go to daily drill", icon: Brain, action: () => navigate("/daily-drill") },
    { id: "daily", group: "navigation", keys: ["G", "P"], description: "Go to problem of the day", icon: Brain, action: () => navigate("/daily") },
    { id: "study", group: "navigation", keys: ["G", "S"], description: "Go to study groups", icon: Users, action: () => navigate("/study") },
    { id: "theme", group: "actions", keys: ["Shift", "L"], description: "Toggle light/dark theme", icon: Moon, action: toggleTheme },
    { id: "shortcuts", group: "global", keys: ["?"], description: "Show this shortcuts panel", icon: Keyboard, action: () => setOpen((o) => !o) },
    { id: "search", group: "global", keys: ["Cmd", "K"], description: "Open command palette (already on Cmd+K)", icon: Search },
  ];

  const filtered = shortcuts.filter((s) =>
    s.description.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.keys.join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const groups = filtered.reduce((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {} as Record<string, typeof filtered>);

  const groupLabel: Record<string, string> = {
    navigation: "navigation",
    actions: "actions",
    global: "global",
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-2xl border border-zinc-800 bg-[#0a0a0a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <Keyboard className="h-4 w-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search shortcuts..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-600"
            autoFocus
          />
          <kbd className="text-[10px] text-zinc-600 border border-zinc-800 px-1.5 py-0.5 font-mono">?</kbd>
          <kbd className="text-[10px] text-zinc-600 border border-zinc-800 px-1.5 py-0.5 font-mono">esc</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-2">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 px-2 py-1.5 font-mono">
                {groupLabel[group] || group}
              </div>
              {items.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => { s.action?.(); if (s.id !== "shortcuts") setOpen(false); }}
                    className="w-full flex items-center gap-3 px-2 py-2 text-left rounded hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span className="flex-1 text-sm">{s.description}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <kbd className="text-[10px] text-zinc-500 border border-zinc-800 px-1.5 py-0.5 font-mono">
                            {k}
                          </kbd>
                          {i < s.keys.length - 1 && <span className="text-zinc-700 text-[10px]">then</span>}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-zinc-500">no shortcuts match "{search}"</div>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 text-[10px] text-zinc-600">
          <div className="flex items-center gap-2">
            <kbd className="border border-zinc-800 px-1.5 py-0.5 font-mono">G</kbd>
            <span>then</span>
            <kbd className="border border-zinc-800 px-1.5 py-0.5 font-mono">letter</kbd>
            <span>for go-to</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="border border-zinc-800 px-1.5 py-0.5 font-mono">?</kbd>
            <span>toggle this</span>
          </div>
        </div>
      </div>
    </div>
  );
}
