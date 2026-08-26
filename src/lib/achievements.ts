// Achievements system — tracks milestones and unlocks badges

import { getState, subscribe, markProblemSolved } from "@/lib/local-state";
import { getPerformance, getOverallStats } from "@/lib/adaptive-difficulty";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  category: "problems" | "streak" | "xp" | "topic" | "social";
  check: (context: AchievementContext) => boolean;
  progress: (context: AchievementContext) => { current: number; target: number };
};

export type AchievementContext = {
  totalSolved: number;
  totalCorrect: number;
  totalAttempts: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  topicStats: Record<string, { correct: number; attempts: number; accuracy: number }>;
  coursesCompleted: number;
  perfectQuizzes: number;
};

const STORAGE_KEY = "mathitout-achievements-v1";

function loadEarned(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveEarned(earned: string[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(earned)); } catch {}
}

export const achievements: Achievement[] = [
  {
    id: "first-solve",
    title: "first step",
    description: "Solve your first problem",
    icon: "👣",
    rarity: "common",
    category: "problems",
    check: (c) => c.totalSolved >= 1,
    progress: (c) => ({ current: Math.min(c.totalSolved, 1), target: 1 }),
  },
  {
    id: "ten-solved",
    title: "getting started",
    description: "Solve 10 problems",
    icon: "🌱",
    rarity: "common",
    category: "problems",
    check: (c) => c.totalSolved >= 10,
    progress: (c) => ({ current: Math.min(c.totalSolved, 10), target: 10 }),
  },
  {
    id: "fifty-solved",
    title: "dedicated",
    description: "Solve 50 problems",
    icon: "📚",
    rarity: "rare",
    category: "problems",
    check: (c) => c.totalSolved >= 50,
    progress: (c) => ({ current: Math.min(c.totalSolved, 50), target: 50 }),
  },
  {
    id: "hundred-solved",
    title: "century club",
    description: "Solve 100 problems",
    icon: "💯",
    rarity: "epic",
    category: "problems",
    check: (c) => c.totalSolved >= 100,
    progress: (c) => ({ current: Math.min(c.totalSolved, 100), target: 100 }),
  },
  {
    id: "streak-3",
    title: "three in a row",
    description: "Maintain a 3-day streak",
    icon: "🔥",
    rarity: "common",
    category: "streak",
    check: (c) => c.currentStreak >= 3 || c.longestStreak >= 3,
    progress: (c) => ({ current: Math.min(Math.max(c.currentStreak, c.longestStreak), 3), target: 3 }),
  },
  {
    id: "streak-7",
    title: "week warrior",
    description: "Maintain a 7-day streak",
    icon: "⚡",
    rarity: "rare",
    category: "streak",
    check: (c) => c.currentStreak >= 7 || c.longestStreak >= 7,
    progress: (c) => ({ current: Math.min(Math.max(c.currentStreak, c.longestStreak), 7), target: 7 }),
  },
  {
    id: "streak-30",
    title: "monthly master",
    description: "Maintain a 30-day streak",
    icon: "🏆",
    rarity: "epic",
    category: "streak",
    check: (c) => c.currentStreak >= 30 || c.longestStreak >= 30,
    progress: (c) => ({ current: Math.min(Math.max(c.currentStreak, c.longestStreak), 30), target: 30 }),
  },
  {
    id: "streak-100",
    title: "centurion",
    description: "Maintain a 100-day streak",
    icon: "👑",
    rarity: "legendary",
    category: "streak",
    check: (c) => c.currentStreak >= 100 || c.longestStreak >= 100,
    progress: (c) => ({ current: Math.min(Math.max(c.currentStreak, c.longestStreak), 100), target: 100 }),
  },
  {
    id: "xp-100",
    title: "first hundred",
    description: "Earn 100 XP",
    icon: "⚡",
    rarity: "common",
    category: "xp",
    check: (c) => c.totalXp >= 100,
    progress: (c) => ({ current: Math.min(c.totalXp, 100), target: 100 }),
  },
  {
    id: "xp-500",
    title: "xp hunter",
    description: "Earn 500 XP",
    icon: "✨",
    rarity: "rare",
    category: "xp",
    check: (c) => c.totalXp >= 500,
    progress: (c) => ({ current: Math.min(c.totalXp, 500), target: 500 }),
  },
  {
    id: "xp-1000",
    title: "scholar",
    description: "Earn 1000 XP",
    icon: "🎓",
    rarity: "epic",
    category: "xp",
    check: (c) => c.totalXp >= 1000,
    progress: (c) => ({ current: Math.min(c.totalXp, 1000), target: 1000 }),
  },
  {
    id: "level-5",
    title: "rising star",
    description: "Reach level 5",
    icon: "⭐",
    rarity: "common",
    category: "xp",
    check: (c) => c.level >= 5,
    progress: (c) => ({ current: Math.min(c.level, 5), target: 5 }),
  },
  {
    id: "level-10",
    title: "expert",
    description: "Reach level 10",
    icon: "💎",
    rarity: "epic",
    category: "xp",
    check: (c) => c.level >= 10,
    progress: (c) => ({ current: Math.min(c.level, 10), target: 10 }),
  },
  {
    id: "accuracy-90",
    title: "sharpshooter",
    description: "Maintain 90%+ accuracy over 20+ attempts",
    icon: "🎯",
    rarity: "epic",
    category: "problems",
    check: (c) => c.totalAttempts >= 20 && c.totalCorrect / c.totalAttempts >= 0.9,
    progress: (c) => ({
      current: Math.min(c.totalAttempts, 20),
      target: 20,
    }),
  },
  {
    id: "topic-master-algebra",
    title: "algebra master",
    description: "20+ correct answers in algebra",
    icon: "ƒ",
    rarity: "rare",
    category: "topic",
    check: (c) => (c.topicStats.algebra?.correct || 0) >= 20,
    progress: (c) => ({ current: Math.min(c.topicStats.algebra?.correct || 0, 20), target: 20 }),
  },
  {
    id: "topic-master-geometry",
    title: "geometry master",
    description: "20+ correct answers in geometry",
    icon: "△",
    rarity: "rare",
    category: "topic",
    check: (c) => (c.topicStats.geometry?.correct || 0) >= 20,
    progress: (c) => ({ current: Math.min(c.topicStats.geometry?.correct || 0, 20), target: 20 }),
  },
  {
    id: "topic-master-calculus",
    title: "calculus master",
    description: "20+ correct answers in calculus",
    icon: "∫",
    rarity: "rare",
    category: "topic",
    check: (c) => (c.topicStats.calculus?.correct || 0) >= 20,
    progress: (c) => ({ current: Math.min(c.topicStats.calculus?.correct || 0, 20), target: 20 }),
  },
  {
    id: "course-complete",
    title: "graduate",
    description: "Complete a full course",
    icon: "🎓",
    rarity: "legendary",
    category: "topic",
    check: (c) => c.coursesCompleted >= 1,
    progress: (c) => ({ current: Math.min(c.coursesCompleted, 1), target: 1 }),
  },
  {
    id: "perfect-quiz",
    title: "perfectionist",
    description: "Get 100% on any quiz",
    icon: "💯",
    rarity: "rare",
    category: "problems",
    check: (c) => c.perfectQuizzes >= 1,
    progress: (c) => ({ current: Math.min(c.perfectQuizzes, 1), target: 1 }),
  },
];

export function getContext(): AchievementContext {
  const state = getState();
  const overall = getOverallStats();
  const perf = getPerformance();
  const topicStats: AchievementContext["topicStats"] = {};
  for (const [topic, p] of Object.entries(perf)) {
    topicStats[topic] = { correct: p.correct, attempts: p.attempts, accuracy: p.accuracy };
  }
  return {
    totalSolved: state.solved?.length || 0,
    totalCorrect: overall.totalCorrect,
    totalAttempts: overall.totalAttempts,
    currentStreak: state.streak || 0,
    longestStreak: state.longestStreak || 0,
    totalXp: state.xp || 0,
    level: state.level || 1,
    topicStats,
    coursesCompleted: 0,
    perfectQuizzes: 0,
  };
}

export function checkNewAchievements(): Achievement[] {
  const ctx = getContext();
  const earned = loadEarned();
  const newAchievements: Achievement[] = [];
  for (const a of achievements) {
    if (!earned.includes(a.id) && a.check(ctx)) {
      earned.push(a.id);
      newAchievements.push(a);
    }
  }
  if (newAchievements.length > 0) {
    saveEarned(earned);
  }
  return newAchievements;
}

export function getEarnedAchievements(): Achievement[] {
  const earned = loadEarned();
  return achievements.filter((a) => earned.includes(a.id));
}

export function getProgressForAll(): { achievement: Achievement; earned: boolean; progress: { current: number; target: number } }[] {
  const earned = loadEarned();
  const ctx = getContext();
  return achievements.map((a) => ({
    achievement: a,
    earned: earned.includes(a.id),
    progress: a.progress(ctx),
  }));
}

export function recordPerfectQuiz() {
  if (typeof window === "undefined") return;
  const key = "mathitout-perfect-quizzes-v1";
  const current = parseInt(localStorage.getItem(key) || "0", 10);
  localStorage.setItem(key, String(current + 1));
}

export function recordCourseCompletion() {
  if (typeof window === "undefined") return;
  const key = "mathitout-courses-completed-v1";
  const current = parseInt(localStorage.getItem(key) || "0", 10);
  localStorage.setItem(key, String(current + 1));
}

export function getCustomContext(): AchievementContext {
  const ctx = getContext();
  if (typeof window !== "undefined") {
    ctx.coursesCompleted = parseInt(localStorage.getItem("mathitout-courses-completed-v1") || "0", 10);
    ctx.perfectQuizzes = parseInt(localStorage.getItem("mathitout-perfect-quizzes-v1") || "0", 10);
  }
  return ctx;
}

export function getProgressForAllSafe(): { achievement: Achievement; earned: boolean; progress: { current: number; target: number } }[] {
  const earned = loadEarned();
  const ctx = getCustomContext();
  return achievements.map((a) => ({
    achievement: a,
    earned: earned.includes(a.id),
    progress: a.progress(ctx),
  }));
}
