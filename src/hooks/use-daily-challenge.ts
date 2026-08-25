"use client";

import { useState, useEffect, useCallback } from "react";

export type DailyChallenge = {
  id: string;
  date: string;
  exercise_id?: string;
  topic_id?: string;
  title: string;
  description: string;
  difficulty: string;
  xpBonus: number;
  createdAt: string;
};

export type UserDailyChallenge = {
  id: string;
  userId: string;
  challengeId: string;
  completed: boolean;
  xpEarned: number;
  completedAt: string | null;
  createdAt: string;
};

export function useDailyChallenge() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [completion, setCompletion] = useState<UserDailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchChallenge = useCallback(async () => {
    try {
      const res = await fetch("/api/daily-challenges");
      if (!res.ok) throw new Error(`Failed to fetch challenge: ${res.status}`);
      const data = await res.json();
      setChallenge(data.challenge);
      setCompletion(data.userCompletion);
    } catch (err) {
      console.error("Failed to load daily challenge:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      fetchChallenge();
    });
  }, [fetchChallenge]);

  const completeChallenge = useCallback(async (challengeId: string) => {
    setCompleting(true);
    try {
      const res = await fetch("/api/daily-challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId }),
      });
      if (!res.ok) throw new Error(`Failed to complete challenge: ${res.status}`);
      const result = await res.json();
      setCompletion(result);
      return result;
    } finally {
      setCompleting(false);
    }
  }, []);

  return {
    challenge,
    completion,
    loading,
    completing,
    completeChallenge,
    refetch: fetchChallenge,
  };
}
