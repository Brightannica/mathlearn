"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Target, BookOpen, Code2, Brain, Flame, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProblems } from "@/lib/problems";
import { getState, subscribe } from "@/lib/local-state";
import { getPerformance, getOverallStats } from "@/lib/adaptive-difficulty";
import Link from "next/link";

type Recommendation = {
  type: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: "target" | "review" | "challenge" | "new" | "spaced" | "streak" | "win";
  color: string;
  priority: number;
};

function iconFor(icon: Recommendation["icon"]) {
  switch (icon) {
    case "target": return Target;
    case "review": return BookOpen;
    case "challenge": return Code2;
    case "new": return Sparkles;
    case "spaced": return Brain;
    case "streak": return Flame;
    case "win": return Star;
  }
}

export function SmartRecommendations() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  const state = getState();
  const overall = getOverallStats();
  const perf = getPerformance();
  void tick;

  const recommendations: Recommendation[] = useMemo(() => {
    const recs: Recommendation[] = [];

    // 1. Weak topic
    const weakTopics = Object.values(perf)
      .filter((p) => p.attempts >= 3 && p.accuracy < 0.7)
      .sort((a, b) => a.accuracy - b.accuracy);
    if (weakTopics.length > 0) {
      const weakest = weakTopics[0];
      recs.push({
        type: "weak_topic",
        title: "strengthen " + weakest.topic,
        description: "your accuracy is " + Math.round(weakest.accuracy * 100) + "% on this topic. a few quick problems will help.",
        href: "/quiz?topic=" + weakest.topic,
        cta: "practice now",
        icon: "target",
        color: "#f472b6",
        priority: 10,
      });
    }

    // 2. Spaced repetition
    const allProblems = getProblems();
    let dueCount = 0;
    if (typeof window !== "undefined") {
      const srs = JSON.parse(localStorage.getItem("mathitout-srs-v1") || "{}");
      for (const p of allProblems) {
        const card = srs[p.slug];
        if (card && new Date(card.dueDate) <= new Date()) dueCount++;
      }
    }
    if (dueCount > 0) {
      recs.push({
        type: "spaced_repetition",
        title: dueCount + " problem" + (dueCount > 1 ? "s" : "") + " ready for review",
        description: "spaced repetition brings back problems at the right time. review them now to lock in the knowledge.",
        href: "/review",
        cta: "start review",
        icon: "spaced",
        color: "#c4f000",
        priority: 9,
      });
    }

    // 3. Streak at risk
    const today = new Date().toISOString().split("T")[0];
    if (state.streak > 0 && state.lastActiveDate !== today) {
      recs.push({
        type: "streak",
        title: "don't break your " + state.streak + "-day streak",
        description: "you haven't practiced today. one quick problem keeps it alive.",
        href: "/daily-drill",
        cta: "keep streak",
        icon: "streak",
        color: "#fb923c",
        priority: 8,
      });
    }

    // 4. Quick win
    if (overall.totalAttempts === 0) {
      recs.push({
        type: "quick_win",
        title: "solve your first problem",
        description: "start with a quick easy one. 5 minutes. 1 problem. build momentum.",
        href: "/quiz?difficulty=easy",
        cta: "start easy",
        icon: "win",
        color: "#4ade80",
        priority: 7,
      });
    }

    // 5. New topic
    const topicsAttempted = Object.keys(perf);
    if (topicsAttempted.length > 0 && topicsAttempted.length < 6) {
      const allTopics = ["algebra", "arithmetic", "geometry", "statistics", "calculus", "trigonometry"];
      const untried = allTopics.find((t) => !topicsAttempted.includes(t));
      if (untried) {
        recs.push({
          type: "new_topic",
          title: "try " + untried,
          description: "you've been focusing on a few topics. branching out helps you see connections.",
          href: "/quiz?topic=" + untried,
          cta: "try new",
          icon: "new",
          color: "#60a5fa",
          priority: 5,
        });
      }
    }

    // 6. Challenge
    if (overall.overallAccuracy > 0.7 && overall.totalAttempts > 5) {
      recs.push({
        type: "challenge",
        title: "ready for hard mode?",
        description: "your accuracy is " + Math.round(overall.overallAccuracy * 100) + "%. time to push harder.",
        href: "/quiz?difficulty=hard",
        cta: "go hard",
        icon: "challenge",
        color: "#fbbf24",
        priority: 4,
      });
    }

    return recs.sort((a, b) => b.priority - a.priority).slice(0, 3);
  }, [perf, state, overall, tick]);

  if (recommendations.length === 0) {
    return (
      <Card className="border-zinc-800/60 bg-[#0d0d0d]">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Sparkles className="h-4 w-4 text-[#c4f000]" />
            <span>no specific recommendations right now. explore freely!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-[#c4f000]" />
        <span className="text-sm font-semibold">recommended for you</span>
      </div>
      {recommendations.map((r, i) => {
        const Icon = iconFor(r.icon);
        return (
          <Link
            key={i}
            href={r.href}
            className="block border p-4 transition-all hover:border-zinc-600 group"
            style={{ borderColor: r.color + "30", backgroundColor: r.color + "05" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="p-2 border shrink-0"
                style={{ borderColor: r.color, color: r.color }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{r.title}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{r.description}</p>
                <div className="flex items-center gap-1 text-xs mt-2 group-hover:translate-x-0.5 transition-transform" style={{ color: r.color }}>
                  <span>{r.cta}</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
