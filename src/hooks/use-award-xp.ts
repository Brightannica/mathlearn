"use client";

import { useState, useCallback } from "react";

export function useAwardXP() {
  const [awarding, setAwarding] = useState(false);

  const awardXP = useCallback(async (amount: number, reason: string, sourceId?: string, sourceType?: string) => {
    setAwarding(true);
    try {
      const res = await fetch("/api/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reason, sourceId, sourceType }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to award XP");
      }

      const result = await res.json();
      return result;
    } finally {
      setAwarding(false);
    }
  }, []);

  return { awardXP, awarding };
}
