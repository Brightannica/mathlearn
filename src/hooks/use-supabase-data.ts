"use client";

import { useState, useEffect, useRef } from "react";

const FETCH_TIMEOUT = 15000;

export type DashboardStats = {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  achievementsUnlocked: number;
};

export type RecentActivity = {
  id: string;
  title: string;
  description: string;
  time: string;
  status: string;
};

export type TopicSummary = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  grade?: string;
  domain?: string;
};

export type LessonSummary = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  videoUrl?: string;
  videoProvider?: string;
  videoId?: string;
  duration?: number;
  order: number;
  difficulty: string;
  xpReward: number;
  topicId: string;
  subtopicId?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ExerciseSummary = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  type: string;
  difficulty: string;
  xpReward: number;
  timeLimit?: number;
  hints: string[];
  solution: string;
  explanation?: string;
  topicId: string;
  subtopicId?: string;
  lessonId?: string;
  options?: unknown;
  correctAnswer?: string;
  answerFormat?: string;
  variables?: unknown;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type AchievementSummary = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: string;
  icon: string;
  color: string;
  xpReward: number;
  criteria: Record<string, unknown>;
  isSecret: boolean;
  created_at: string;
  completed?: boolean;
  progress?: number;
  user_progress?: {
    id: string;
    user_id: string;
    achievement_id: string;
    progress: number;
    completed: boolean;
    completed_at?: string;
    created_at: string;
  };
};

export type UserProgress = {
  id: string;
  userId: string;
  topicId?: string;
  subtopicId?: string;
  lessonId?: string;
  mastery: number;
  status: string;
  timeSpent: number;
  lastAttemptedAt?: string;
  completedAt?: string;
  masteredAt?: string;
  createdAt: string;
  updatedAt: string;
};

export async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      cache: "no-store",
      signal: options?.signal || controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`API error: ${res.status} - ${errorBody}`);
    }

    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout: ${path}`);
    }
    throw error;
  }
}

function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError || (error instanceof Error && error.name === "AbortError");
}

function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const match = error.message.match(/^API error: (\d+)/);
    const status = match ? parseInt(match[1], 10) : null;
    return status === 401 || status === 403;
  }
  return false;
}

function logError(context: string, error: unknown, path: string) {
  if (error instanceof Error) {
    const statusMatch = error.message.match(/^API error: (\d+)/);
    console.error(`[${context}] fetch error`, {
      url: path,
      status: statusMatch ? statusMatch[1] : undefined,
      message: error.message,
    });
  } else {
    console.error(`[${context}] fetch error`, { url: path, message: String(error) });
  }
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const retryingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    retryingRef.current = false;


    async function load() {
      try {
        const data = await fetchJSON<{ stats: DashboardStats; recentActivity: RecentActivity[] }>("/api/dashboard");
        if (!cancelled) {
          setStats(data.stats);
          setRecentActivity(data.recentActivity);
        }
      } catch (err) {
        if (isAuthError(err)) {
          logError("useDashboardData", err, "/api/dashboard");
          if (!cancelled) {
            setError("Using sample data");

            if (!cancelled) {
              setStats({
                totalXP: 3180,
                level: 7,
                currentStreak: 7,
                longestStreak: 12,
                lessonsCompleted: 24,
                achievementsUnlocked: 3,
              });
              setRecentActivity([
                { id: "1", title: "Completed: Linear Equations", description: "Lesson 3.2 - Solving for x", time: new Date(Date.now() - 7200000).toISOString(), status: "completed" },
                { id: "2", title: "Quiz: Quadratic Functions", description: "Scored 92% - Mastered!", time: new Date(Date.now() - 18000000).toISOString(), status: "completed" },
                { id: "3", title: "Practice Session", description: "Practiced factoring polynomials", time: new Date(Date.now() - 86400000).toISOString(), status: "in_progress" },
                { id: "4", title: "7-day streak achieved!", description: "Keep the momentum going", time: new Date(Date.now() - 86400000).toISOString(), status: "completed" },
                { id: "5", title: "Badge: Algebra Explorer", description: "Completed 10 algebra lessons", time: new Date(Date.now() - 172800000).toISOString(), status: "completed" },
              ]);
            }
          }
        } else if (isNetworkError(err) && !retryingRef.current) {
          logError("useDashboardData", err, "/api/dashboard");
          if (!cancelled) {
            setRetrying(true);
          }
          await new Promise((r) => setTimeout(r, 1000));
          if (!cancelled) {
            setRetrying(false);
            await load();
          }
        } else {
          logError("useDashboardData", err, "/api/dashboard");
          if (!cancelled) {
            setError("Using sample data");

            if (!cancelled) {
              setStats({
                totalXP: 3180,
                level: 7,
                currentStreak: 7,
                longestStreak: 12,
                lessonsCompleted: 24,
                achievementsUnlocked: 3,
              });
              setRecentActivity([
                { id: "1", title: "Completed: Linear Equations", description: "Lesson 3.2 - Solving for x", time: new Date(Date.now() - 7200000).toISOString(), status: "completed" },
                { id: "2", title: "Quiz: Quadratic Functions", description: "Scored 92% - Mastered!", time: new Date(Date.now() - 18000000).toISOString(), status: "completed" },
                { id: "3", title: "Practice Session", description: "Practiced factoring polynomials", time: new Date(Date.now() - 86400000).toISOString(), status: "in_progress" },
                { id: "4", title: "7-day streak achieved!", description: "Keep the momentum going", time: new Date(Date.now() - 86400000).toISOString(), status: "completed" },
                { id: "5", title: "Badge: Algebra Explorer", description: "Completed 10 algebra lessons", time: new Date(Date.now() - 172800000).toISOString(), status: "completed" },
              ]);
            }
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, recentActivity, loading, error, retrying };
}

export function useTopics() {
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const retryingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    retryingRef.current = false;


    async function load() {
      try {
        const data = await fetchJSON<TopicSummary[]>("/api/topics");
        if (!cancelled) {
          setTopics(data);
        }
      } catch (err) {
        if (isAuthError(err)) {
          logError("useTopics", err, "/api/topics");
          if (!cancelled) {
            setError("Using sample topics");

            if (!cancelled) {
              setTopics([
                { id: "linear-eq", name: "Linear Equations", slug: "linear-equations", description: "Solve equations with one variable", icon: "📐", color: "#2563eb", order: 1, grade: "8", domain: "Expressions & Equations" },
                { id: "quadratic", name: "Quadratic Functions", slug: "quadratic-functions", description: "Understand parabolas and roots", icon: "📊", color: "#7c3aed", order: 2, grade: "9", domain: "Algebra" },
                { id: "geometry", name: "Geometry Basics", slug: "geometry-basics", description: "Points, lines, planes, and shapes", icon: "📏", color: "#059669", order: 3, grade: "7", domain: "Geometry" },
                { id: "fractions", name: "Fractions & Decimals", slug: "fractions-decimals", description: "Master fraction operations", icon: "🍕", color: "#d97706", order: 4, grade: "5", domain: "Number & Operations—Fractions" },
                { id: "statistics", name: "Statistics", slug: "statistics", description: "Data analysis and probability", icon: "📈", color: "#0891b2", order: 5, grade: "6", domain: "Statistics & Probability" },
                { id: "exponents", name: "Exponents & Radicals", slug: "exponents-radicals", description: "Powers, roots, and properties", icon: "🧮", color: "#db2777", order: 6, grade: "8", domain: "Number System" },
              ]);
            }
          }
        } else if (isNetworkError(err) && !retryingRef.current) {
          logError("useTopics", err, "/api/topics");
          if (!cancelled) {
            setRetrying(true);
          }
          await new Promise((r) => setTimeout(r, 1000));
          if (!cancelled) {
            setRetrying(false);
            await load();
          }
        } else {
          logError("useTopics", err, "/api/topics");
          if (!cancelled) {
            setError("Using sample topics");

            if (!cancelled) {
              setTopics([
                { id: "linear-eq", name: "Linear Equations", slug: "linear-equations", description: "Solve equations with one variable", icon: "📐", color: "#2563eb", order: 1, grade: "8", domain: "Expressions & Equations" },
                { id: "quadratic", name: "Quadratic Functions", slug: "quadratic-functions", description: "Understand parabolas and roots", icon: "📊", color: "#7c3aed", order: 2, grade: "9", domain: "Algebra" },
                { id: "geometry", name: "Geometry Basics", slug: "geometry-basics", description: "Points, lines, planes, and shapes", icon: "📏", color: "#059669", order: 3, grade: "7", domain: "Geometry" },
                { id: "fractions", name: "Fractions & Decimals", slug: "fractions-decimals", description: "Master fraction operations", icon: "🍕", color: "#d97706", order: 4, grade: "5", domain: "Number & Operations—Fractions" },
                { id: "statistics", name: "Statistics", slug: "statistics", description: "Data analysis and probability", icon: "📈", color: "#0891b2", order: 5, grade: "6", domain: "Statistics & Probability" },
                { id: "exponents", name: "Exponents & Radicals", slug: "exponents-radicals", description: "Powers, roots, and properties", icon: "🧮", color: "#db2777", order: 6, grade: "8", domain: "Number System" },
              ]);
            }
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { topics, loading, error, retrying };
}

export function useLessons(topicId: string) {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const retryingRef = useRef(false);

  useEffect(() => {
    if (!topicId) return;

    let cancelled = false;
    retryingRef.current = false;


    async function load() {
      try {
        const data = await fetchJSON<LessonSummary[]>(`/api/lessons?topicId=${encodeURIComponent(topicId)}&type=lessons`);
        if (!cancelled) {
          setLessons(data);
        }
      } catch (err) {
        if (isAuthError(err)) {
          logError("useLessons", err, `/api/lessons?topicId=${topicId}`);
          if (!cancelled) {
            setLessons([]);
          }
        } else if (isNetworkError(err) && !retryingRef.current) {
          logError("useLessons", err, `/api/lessons?topicId=${topicId}`);
          if (!cancelled) {
            setRetrying(true);
          }
          await new Promise((r) => setTimeout(r, 1000));
          if (!cancelled) {
            setRetrying(false);
            await load();
          }
        } else {
          logError("useLessons", err, `/api/lessons?topicId=${topicId}`);
          if (!cancelled) {
            setLessons([]);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  return { lessons, loading, retrying };
}

export function useExercises(topicId: string) {
  const [exercises, setExercises] = useState<ExerciseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const retryingRef = useRef(false);

  useEffect(() => {
    if (!topicId) return;

    let cancelled = false;
    retryingRef.current = false;


    async function load() {
      try {
        const data = await fetchJSON<ExerciseSummary[]>(`/api/exercises?topicId=${encodeURIComponent(topicId)}&type=exercises`);
        if (!cancelled) {
          setExercises(data);
        }
      } catch (err) {
        if (isAuthError(err)) {
          logError("useExercises", err, `/api/exercises?topicId=${topicId}`);
          if (!cancelled) {
            setExercises([]);
          }
        } else if (isNetworkError(err) && !retryingRef.current) {
          logError("useExercises", err, `/api/exercises?topicId=${topicId}`);
          if (!cancelled) {
            setRetrying(true);
          }
          await new Promise((r) => setTimeout(r, 1000));
          if (!cancelled) {
            setRetrying(false);
            await load();
          }
        } else {
          logError("useExercises", err, `/api/exercises?topicId=${topicId}`);
          if (!cancelled) {
            setExercises([]);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  return { exercises, loading, retrying };
}

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const retryingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    retryingRef.current = false;


    async function load() {
      try {
        const data = await fetchJSON<UserProgress[]>("/api/progress");
        if (!cancelled) {
          setProgress(data);
        }
      } catch (err) {
        if (isAuthError(err)) {
          logError("useUserProgress", err, "/api/progress");
          if (!cancelled) {
            setProgress([]);
          }
        } else if (isNetworkError(err) && !retryingRef.current) {
          logError("useUserProgress", err, "/api/progress");
          if (!cancelled) {
            setRetrying(true);
          }
          await new Promise((r) => setTimeout(r, 1000));
          if (!cancelled) {
            setRetrying(false);
            await load();
          }
        } else {
          logError("useUserProgress", err, "/api/progress");
          if (!cancelled) {
            setProgress([]);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { progress, loading, retrying };
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<AchievementSummary[]>([]);
  const [userAchievements, setUserAchievements] = useState<AchievementSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const retryingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    retryingRef.current = false;


    async function load() {
      try {
        const data = await fetchJSON<{ achievements: AchievementSummary[]; userAchievements: AchievementSummary[] }>("/api/achievements");
        if (!cancelled) {
          setAchievements(data.achievements);
          setUserAchievements(data.userAchievements);
        }
      } catch (err) {
        if (isAuthError(err)) {
          logError("useAchievements", err, "/api/achievements");
          if (!cancelled) {
            setAchievements([]);
            setUserAchievements([]);
          }
        } else if (isNetworkError(err) && !retryingRef.current) {
          logError("useAchievements", err, "/api/achievements");
          if (!cancelled) {
            setRetrying(true);
          }
          await new Promise((r) => setTimeout(r, 1000));
          if (!cancelled) {
            setRetrying(false);
            await load();
          }
        } else {
          logError("useAchievements", err, "/api/achievements");
          if (!cancelled) {
            setAchievements([]);
            setUserAchievements([]);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { achievements, userAchievements, loading, retrying };
}

export function useSaveProgress() {
  const [saving, setSaving] = useState(false);

  const saveProgress = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      await fetchJSON<UserProgress>("/api/progress", {
        method: "POST",
        body: JSON.stringify({ type: "progress", data }),
      });
    } finally {
      setSaving(false);
    }
  };

  return { saveProgress, saving };
}
