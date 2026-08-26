// Adaptive difficulty system — tracks user performance per topic and adjusts difficulty

import { getState, subscribe } from "@/lib/local-state";

export type TopicPerformance = {
  topic: string;
  attempts: number;
  correct: number;
  accuracy: number;
  currentStreak: number;
  bestStreak: number;
  recommendedDifficulty: "easy" | "medium" | "hard";
  weakSubtopics: string[];
  lastAttempt: string;
};

type AttemptRecord = {
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  correct: boolean;
  timestamp: number;
};

const HISTORY_KEY = "mathitout-attempts-history-v1";

function loadHistory(): AttemptRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}

function saveHistory(records: AttemptRecord[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(-500))); } catch {}
}

export function recordAttempt(topic: string, difficulty: "easy" | "medium" | "hard", correct: boolean) {
  const history = loadHistory();
  history.push({ topic, difficulty, correct, timestamp: Date.now() });
  saveHistory(history);
}

export function getPerformance(): Record<string, TopicPerformance> {
  const history = loadHistory();
  const perf: Record<string, TopicPerformance> = {};
  const state = getState();

  for (const a of history) {
    if (!perf[a.topic]) {
      perf[a.topic] = {
        topic: a.topic,
        attempts: 0,
        correct: 0,
        accuracy: 0,
        currentStreak: 0,
        bestStreak: 0,
        recommendedDifficulty: "easy",
        weakSubtopics: [],
        lastAttempt: new Date(a.timestamp).toISOString(),
      };
    }
    const p = perf[a.topic];
    p.attempts++;
    if (a.correct) {
      p.correct++;
      p.currentStreak++;
      p.bestStreak = Math.max(p.bestStreak, p.currentStreak);
    } else {
      p.currentStreak = 0;
    }
    p.lastAttempt = new Date(a.timestamp).toISOString();
  }

  for (const p of Object.values(perf)) {
    p.accuracy = p.attempts > 0 ? p.correct / p.attempts : 0;
    if (p.accuracy >= 0.85 && p.attempts >= 5) {
      p.recommendedDifficulty = "hard";
    } else if (p.accuracy >= 0.65 || p.attempts >= 3) {
      p.recommendedDifficulty = "medium";
    } else {
      p.recommendedDifficulty = "easy";
    }
  }

  return perf;
}

export function getRecommendedDifficulty(topic: string): "easy" | "medium" | "hard" {
  const perf = getPerformance();
  return perf[topic]?.recommendedDifficulty || "easy";
}

export function getWeakestTopics(n: number = 3): string[] {
  const perf = getPerformance();
  return Object.values(perf)
    .filter((p) => p.attempts >= 2)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, n)
    .map((p) => p.topic);
}

export function getOverallStats() {
  const perf = getPerformance();
  const topics = Object.values(perf);
  const totalAttempts = topics.reduce((s, p) => s + p.attempts, 0);
  const totalCorrect = topics.reduce((s, p) => s + p.correct, 0);
  const overallAccuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;
  return {
    totalAttempts,
    totalCorrect,
    overallAccuracy,
    topicsAttempted: topics.length,
  };
}
