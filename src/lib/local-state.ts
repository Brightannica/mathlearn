"use client";

import { useEffect, useState } from "react";

const KEY = "mathitout-state-v1";

export type SolvedProblem = {
  slug: string;
  solvedAt: string;
  attempts: number;
  xp: number;
};

export type CompletedLesson = {
  courseSlug: string;
  lessonId: string;
  completedAt: string;
  xp: number;
};

export type LocalState = {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  activeDates: string[];
  solved: SolvedProblem[];
  completedLessons: CompletedLesson[];
  freezeCount: number;
};

const todayStr = () => new Date().toISOString().split("T")[0];

const defaultState: LocalState = {
  xp: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  lastActiveDate: "",
  activeDates: [],
  solved: [],
  completedLessons: [],
  freezeCount: 2,
};

let cached: LocalState | null = null;
let listeners: Set<() => void> = new Set();

function read(): LocalState {
  if (typeof window === "undefined") return defaultState;
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      cached = { ...defaultState };
      return cached;
    }
    const parsed = JSON.parse(raw) as Partial<LocalState>;
    cached = { ...defaultState, ...parsed };
    return cached;
  } catch {
    cached = { ...defaultState };
    return cached;
  }
}

function write(next: LocalState) {
  cached = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    listeners.forEach((l) => l());
  }
}

export function getState(): LocalState {
  return read();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLocalState(): LocalState {
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = subscribe(() => force((n) => n + 1));
    return () => { unsub(); };
  }, []);
  return getState();
}

export function isSolved(slug: string): boolean {
  return read().solved.some((s) => s.slug === slug);
}

export function getSolved(slug: string): SolvedProblem | undefined {
  return read().solved.find((s) => s.slug === slug);
}

export function markProblemSolved(slug: string, xp: number, attempts: number) {
  const s = read();
  const today = todayStr();
  if (s.solved.some((sv) => sv.slug === slug)) {
    return s;
  }
  const newSolved: SolvedProblem = { slug, solvedAt: new Date().toISOString(), attempts, xp };
  const xpGained = xp;
  const newXp = s.xp + xpGained;
  const newLevel = Math.floor(newXp / 100) + 1;

  // streak: if last active was yesterday, +1; if today, no change; else reset
  let newStreak = s.streak;
  if (s.lastActiveDate === today) {
    // already active today
  } else if (s.lastActiveDate) {
    const last = new Date(s.lastActiveDate);
    const diff = Math.floor((Date.now() - last.getTime()) / 86400000);
    if (diff === 1) {
      newStreak = s.streak + 1;
    } else if (diff > 1) {
      if (s.freezeCount > 0) {
        newStreak = s.streak + 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const activeDates = s.activeDates.includes(today) ? s.activeDates : [...s.activeDates, today].slice(-365);

  const next: LocalState = {
    ...s,
    xp: newXp,
    level: newLevel,
    streak: newStreak,
    longestStreak: Math.max(s.longestStreak, newStreak),
    lastActiveDate: today,
    activeDates,
    solved: [...s.solved, newSolved],
  };
  write(next);
  return next;
}

export function markLessonComplete(courseSlug: string, lessonId: string, xp: number) {
  const s = read();
  if (s.completedLessons.some((cl) => cl.courseSlug === courseSlug && cl.lessonId === lessonId)) {
    return s;
  }
  const today = todayStr();
  const newXp = s.xp + xp;
  const newLevel = Math.floor(newXp / 100) + 1;

  let newStreak = s.streak;
  if (s.lastActiveDate === today) {
    // already active
  } else if (s.lastActiveDate) {
    const last = new Date(s.lastActiveDate);
    const diff = Math.floor((Date.now() - last.getTime()) / 86400000);
    if (diff === 1) {
      newStreak = s.streak + 1;
    } else if (diff > 1) {
      newStreak = s.freezeCount > 0 ? s.streak + 1 : 1;
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const activeDates = s.activeDates.includes(today) ? s.activeDates : [...s.activeDates, today].slice(-365);

  const next: LocalState = {
    ...s,
    xp: newXp,
    level: newLevel,
    streak: newStreak,
    longestStreak: Math.max(s.longestStreak, newStreak),
    lastActiveDate: today,
    activeDates,
    completedLessons: [...s.completedLessons, { courseSlug, lessonId, completedAt: new Date().toISOString(), xp }],
  };
  write(next);
  return next;
}

export function isLessonComplete(courseSlug: string, lessonId: string): boolean {
  return read().completedLessons.some((cl) => cl.courseSlug === courseSlug && cl.lessonId === lessonId);
}

export function getCourseProgress(courseSlug: string, totalLessons: number): number {
  const s = read();
  const completed = s.completedLessons.filter((cl) => cl.courseSlug === courseSlug).length;
  return totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
}

export function pingActivity() {
  const s = read();
  const today = todayStr();
  if (s.lastActiveDate === today) return s;
  let newStreak = s.streak;
  if (s.lastActiveDate) {
    const last = new Date(s.lastActiveDate);
    const diff = Math.floor((Date.now() - last.getTime()) / 86400000);
    if (diff === 1) {
      newStreak = s.streak + 1;
    } else if (diff > 1) {
      newStreak = s.freezeCount > 0 ? s.streak + 1 : 1;
    }
  } else {
    newStreak = 1;
  }
  const activeDates = [...s.activeDates, today].slice(-365);
  const next = { ...s, streak: newStreak, longestStreak: Math.max(s.longestStreak, newStreak), lastActiveDate: today, activeDates };
  write(next);
  return next;
}
