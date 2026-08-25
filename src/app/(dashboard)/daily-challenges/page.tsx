"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDailyChallenge } from "@/hooks/use-daily-challenge";
import { Flame, Trophy, Zap, Target, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function DailyChallengesPage() {
  const { challenge, completion, loading, completing, completeChallenge, refetch } = useDailyChallenge();
  const [awarding, setAwarding] = useState(false);

  const handleComplete = async () => {
    if (!challenge) return;
    await completeChallenge(challenge.id);
    setAwarding(true);
    try {
      await fetch("/api/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: challenge.xpBonus, reason: `Completed daily challenge: ${challenge.title}`, sourceType: "daily_challenge" }),
      });
    } finally {
      setAwarding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" /> Daily Challenges
          </h1>
          <p className="text-muted-foreground mt-1">Complete today&apos;s challenge to earn bonus XP</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No challenge available today. Check back later!</p>
            <Button onClick={refetch} variant="outline" className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = !!completion?.completed;
  const progress = isCompleted ? 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Target className="h-8 w-8 text-primary" /> Daily Challenges
        </h1>
        <p className="text-muted-foreground mt-1">Complete today&apos;s challenge to earn bonus XP</p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-orange-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                {challenge.title}
              </CardTitle>
              <CardDescription>{challenge.description}</CardDescription>
            </div>
            <Badge variant={challenge.difficulty === "easy" ? "default" : challenge.difficulty === "medium" ? "secondary" : "destructive"}>
              {challenge.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{isCompleted ? "Completed" : "Not started"}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">+{challenge.xpBonus} XP</span>
            </div>
            {isCompleted ? (
              <Badge variant="default" className="gap-1">
                <Trophy className="h-3 w-3" />
                Completed
              </Badge>
            ) : (
              <Button onClick={handleComplete} disabled={completing || awarding}>
                {(completing || awarding) && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Complete Challenge
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" asChild>
              <Link href="/practice">Go to Practice</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={refetch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
