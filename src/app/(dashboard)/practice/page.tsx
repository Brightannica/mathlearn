"use client";

import { useState, memo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  BookOpen,
  Star,
  Trophy,
  ChevronRight,
  Filter,
  RotateCcw,
  Clock,
  Flame,
  Zap,
  History,
  CheckCircle2,
  XCircle,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import QuizCard, { ExerciseAttempt } from "@/components/quiz-card";
import Link from "next/link";
import { useTopics, useUserProgress, useExercises, fetchJSON, ExerciseSummary } from "@/hooks/use-supabase-data";
import type { Favorite } from "@/hooks/use-favorites";
import { useAwardXP } from "@/hooks/use-award-xp";
import { useFavorites } from "@/hooks/use-favorites";

const topicBadgeColor: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  pink: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
};

const topicGradient: Record<string, string> = {
  blue: "from-blue-500 to-cyan-500",
  purple: "from-purple-500 to-indigo-500",
  green: "from-green-500 to-emerald-500",
  orange: "from-orange-500 to-amber-500",
  cyan: "from-cyan-500 to-teal-500",
  pink: "from-pink-500 to-rose-500",
};

function getTopicDifficulty(grade?: string): "easy" | "medium" | "hard" {
  if (!grade) return "medium";
  const gradeNum = parseInt(grade, 10);
  if (isNaN(gradeNum)) return "medium";
  if (gradeNum <= 3) return "easy";
  if (gradeNum <= 7) return "medium";
  return "hard";
}

const FALLBACK_TOPICS = [
  { id: "linear-eq", name: "Linear Equations", questions: 24, mastered: 18, color: "blue", icon: "📐", difficulty: "medium" as const },
  { id: "quadratic", name: "Quadratic Functions", questions: 18, mastered: 8, color: "purple", icon: "📊", difficulty: "medium" as const },
  { id: "geometry", name: "Geometry Basics", questions: 30, mastered: 25, color: "green", icon: "📏", difficulty: "medium" as const },
  { id: "fractions", name: "Fractions & Decimals", questions: 20, mastered: 12, color: "orange", icon: "🍕", difficulty: "medium" as const },
  { id: "statistics", name: "Statistics", questions: 15, mastered: 3, color: "cyan", icon: "📈", difficulty: "medium" as const },
  { id: "exponents", name: "Exponents & Radicals", questions: 16, mastered: 10, color: "pink", icon: "🧮", difficulty: "medium" as const },
];

const MemoizedQuizCard = memo(function MemoizedQuizCard(props: React.ComponentProps<typeof QuizCard>) {
  return <QuizCard {...props} />;
});
MemoizedQuizCard.displayName = "MemoizedQuizCard";

interface PracticeTopicCardProps {
  topic: {
    id: string;
    name: string;
    questions: number;
    mastered: number;
    color: string;
    icon: string;
    difficulty: string;
  };
  onSelect: (id: string) => void;
  onBookmark: (itemId: string, itemType: Favorite["item_type"], title: string) => Promise<void>;
}

const PracticeTopicCard = memo(function PracticeTopicCard({ topic, onSelect, onBookmark }: PracticeTopicCardProps) {
  const progress = Math.round((topic.mastered / topic.questions) * 100);

  return (
    <Card
      className="group hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer"
      onClick={() => {
        onSelect(topic.id);
      }}
      >
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl text-2xl bg-gradient-to-br text-white shadow-md",
              topicGradient[topic.color]
            )}>
              {topic.icon}
            </div>
            <div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">{topic.name}</h3>
              <p className="text-xs text-muted-foreground">{topic.questions} questions</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-yellow-500"
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(topic.id, "topic", topic.name);
              }}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Mastery</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-3 w-3 text-yellow-500" />
            {topic.mastered}/{topic.questions}
          </div>
          <Badge className={cn(topicBadgeColor[topic.color], "capitalize")}>
            {topic.mastered >= topic.questions * 0.8 ? "Mastered" : topic.mastered > 0 ? "In Progress" : "New"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
});
PracticeTopicCard.displayName = "PracticeTopicCard";

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export default function PracticePage() {
  const { topics } = useTopics();
  const { progress } = useUserProgress();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("topics");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const { exercises: topicExercises } = useExercises(selectedTopic || "");
  const { awardXP } = useAwardXP();
  const { toggleFavorite } = useFavorites();

  const [recentAttempts, setRecentAttempts] = useState<ExerciseAttempt[]>([]);
  const [historyAttempts, setHistoryAttempts] = useState<ExerciseAttempt[][]>(() => {
    if (activeTab !== "history" || topics.length === 0) return [];
    return [];
  });
  const [historyStats, setHistoryStats] = useState<{ total: number; correct: number; xp: number } | null>(null);
  const [historyTopicFilter, setHistoryTopicFilter] = useState<string>("all");
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!selectedTopic || topicExercises.length === 0) {
      requestAnimationFrame(() => setRecentAttempts([]));
      return;
    }
    let cancelled = false;
    requestAnimationFrame(() => setAttemptsLoading(true));

    async function loadAttempts() {
      try {
        const results = await Promise.all(
          topicExercises.map(ex =>
            fetchJSON<ExerciseAttempt[]>(`/api/exercises/${ex.id}/attempts`).catch(() => [])
          )
        );
        if (!cancelled) {
          const all = results.flat();
          all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentAttempts(all.slice(0, 10));
        }
      } catch {
        if (!cancelled) setRecentAttempts([]);
      } finally {
        if (!cancelled) setAttemptsLoading(false);
      }
    }

    loadAttempts();
    return () => { cancelled = true; };
  }, [selectedTopic, topicExercises]);

  useEffect(() => {
    if (activeTab !== "history" || topics.length === 0) return;
    let cancelled = false;
    requestAnimationFrame(() => setHistoryLoading(true));

    async function loadAllAttempts() {
      try {
        const allExercises = await fetchJSON<ExerciseSummary[]>(`/api/exercises?type=exercises`).catch(() => []);
        if (cancelled || allExercises.length === 0) {
          if (!cancelled) {
            setHistoryAttempts([]);
            setHistoryStats(null);
            setHistoryLoading(false);
          }
          return;
        }

        const topicGroups = new Map<string, ExerciseAttempt[]>();
        const results = await Promise.all(
          allExercises.map(ex =>
            fetchJSON<ExerciseAttempt[]>(`/api/exercises/${ex.id}/attempts`).catch(() => [])
          )
        );

        if (!cancelled) {
          results.forEach((attempts, i) => {
            const ex = allExercises[i];
            attempts.forEach(a => {
              a.exerciseTitle = ex.title;
              a.topicId = ex.topicId;
            });
            const group = topicGroups.get(ex.topicId) || [];
            group.push(...attempts);
            topicGroups.set(ex.topicId, group);
          });

          const allFlat = Array.from(topicGroups.values()).flat();
          allFlat.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setHistoryAttempts(Array.from(topicGroups.values()));

          const total = allFlat.length;
          const correct = allFlat.filter(a => a.isCorrect).length;
          const xp = allFlat.reduce((sum, a) => sum + a.xpEarned, 0);
          setHistoryStats({ total, correct, xp });
        }
      } catch {
        if (!cancelled) {
          setHistoryAttempts([]);
          setHistoryStats(null);
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }

    loadAllAttempts();
    return () => { cancelled = true; };
  }, [activeTab, topics]);

  const handleAnswer = async (answer: { questionId: string; selected: number; correct: boolean; exerciseId: string; points: number }) => {
    try {
      await fetchJSON(`/api/exercises/${answer.exerciseId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: String(answer.selected),
          timeSpent: 0,
          hintsUsed: 0,
        }),
      });
    } catch {
      // silent fail — attempt logging is non-blocking
    }
  };

  const practiceTopics = topics.length > 0
    ? topics.map((t) => {
        const topicProgress = progress.filter((p) => p.topicId === t.id);
        const mastered = topicProgress.reduce((sum, p) => sum + Math.round((p.mastery || 0) * 100), 0);
        const questions = topicProgress.length > 0 ? topicProgress.length * 5 : 20;
        const colorKey = t.color || "#2563eb";
        const colorMap: Record<string, string> = {
          "#2563eb": "blue",
          "#7c3aed": "purple",
          "#059669": "green",
          "#d97706": "orange",
          "#0891b2": "cyan",
          "#db2777": "pink",
        };
        return {
          id: t.slug || t.id,
          name: t.name,
          questions: Math.max(questions, 10),
          mastered: Math.min(mastered, questions),
          color: colorMap[colorKey] || "blue",
          icon: t.icon || "📝",
          difficulty: getTopicDifficulty(t.grade),
        };
      })
    : FALLBACK_TOPICS;

  const handleQuizComplete = useCallback((score: number, total: number) => {
    const xpEarned = Math.round((score / total) * 100);
    const topicName = practiceTopics.find((t) => t.id === selectedTopic)?.name || "Practice";
    awardXP(xpEarned, `Completed quiz: ${topicName}`, undefined, "quiz");
  }, [selectedTopic, practiceTopics, awardXP]);

  const filteredPracticeTopics = difficultyFilter === "all"
    ? practiceTopics
    : practiceTopics.filter(t => t.difficulty === difficultyFilter);

  const totalMastered = practiceTopics.reduce((sum, t) => sum + t.mastered, 0);
  const totalQuestions = practiceTopics.reduce((sum, t) => sum + t.questions, 0);
  const overallProgress = Math.round((totalMastered / totalQuestions) * 100);

  const filteredHistoryAttempts = historyTopicFilter === "all"
    ? historyAttempts.flat()
    : (historyAttempts.find(g => g[0]?.topicId === historyTopicFilter) || []);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 lg:flex-none">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Practice
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Master concepts through interactive quizzes and repetition</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/learn">Browse Courses</Link>
          </Button>
        </div>
      </div>

      {/* Progress Banner */}
      <Card className="border border-primary/10 bg-gradient-to-r from-primary/5 to-emerald-500/5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
              <p className="text-2xl font-bold">{overallProgress}% Mastered</p>
              <p className="text-sm text-muted-foreground">{totalMastered}/{totalQuestions} questions mastered</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{totalMastered}</p>
              <p className="text-xs text-muted-foreground">Questions Solved</p>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="quiz">Quick Quiz</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-4">
          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-0 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="h-8 w-8 opacity-90" />
                <div>
                  <p className="text-2xl font-bold">{practiceTopics.length}</p>
                  <p className="text-xs opacity-90">Topics Available</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
              <CardContent className="p-4 flex items-center gap-3">
                <Target className="h-8 w-8 opacity-90" />
                <div>
                  <p className="text-2xl font-bold">{totalMastered}</p>
                  <p className="text-xs opacity-90">Questions Mastered</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
              <CardContent className="p-4 flex items-center gap-3">
                <Trophy className="h-8 w-8 opacity-90" />
                <div>
                  <p className="text-2xl font-bold">
                    {practiceTopics.filter(t => t.mastered >= t.questions * 0.8).length}
                  </p>
                  <p className="text-xs opacity-90">Topics Near Mastery</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter:</span>
            {["all", "easy", "medium", "hard"].map((d) => (
              <Button
                key={d}
                variant={difficultyFilter === d ? "default" : "outline"}
                size="sm"
                onClick={() => setDifficultyFilter(d)}
                className="capitalize"
              >
                {d}
              </Button>
            ))}
          </div>

          {/* Topics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPracticeTopics.map((topic) => (
              <PracticeTopicCard key={topic.id} topic={topic} onSelect={(id) => { setSelectedTopic(id); setActiveTab("quiz"); }} onBookmark={toggleFavorite} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quiz" className="space-y-4">
          {selectedTopic ? (
            <div className="space-y-4">
              <MemoizedQuizCard
                topicId={selectedTopic}
                topicName={practiceTopics.find(t => t.id === selectedTopic)?.name}
                numQuestions={5}
                onComplete={handleQuizComplete}
                onAnswer={handleAnswer}
              />

              {/* Recent Attempts */}
              {selectedTopic && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <History className="h-5 w-5 text-primary" />
                      Recent Attempts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {attemptsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading attempts...</span>
                      </div>
                    ) : recentAttempts.length === 0 ? (
                      <div className="text-center py-8">
                        <RotateCcw className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">No attempts yet. Start a quiz to see your results here!</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {recentAttempts.map((attempt) => (
                          <div
                            key={attempt.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {attempt.isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                              )}
                              <div>
                                <p className="font-medium text-sm">{attempt.exerciseTitle}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(attempt.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={attempt.isCorrect ? "default" : "destructive"} className="text-xs">
                                {attempt.isCorrect ? "Correct" : "Incorrect"}
                              </Badge>
                              {attempt.xpEarned > 0 && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <Zap className="h-3 w-3 text-yellow-500" />
                                  +{attempt.xpEarned} XP
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <Target className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="text-lg font-semibold">Select a Topic</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Choose a topic from the Topics tab to start a quiz, or try a quick mixed quiz below.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setSelectedTopic("linear-eq")}>
                    Linear Equations Quiz
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTopic("quadratic")}>
                    Quadratic Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-primary" />
                Spaced Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Review topics you&apos;ve started to reinforce learning and move knowledge into long-term memory.
              </p>
              <div className="space-y-3">
                {practiceTopics.filter(t => t.mastered > 0 && t.mastered < t.questions).map((topic) => {
                  const progress = Math.round((topic.mastered / topic.questions) * 100);
                  return (
                    <div key={topic.id} className="flex items-center justify-between p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer" onClick={() => { setSelectedTopic(topic.id); setActiveTab("quiz"); }}>
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", topicBadgeColor[topic.color])}>
                          {topic.icon}
                        </div>
                        <div>
                          <p className="font-medium">{topic.name}</p>
                          <p className="text-xs text-muted-foreground">{progress}% mastered</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="w-20 h-2" />
                        <Button size="sm" variant="outline">Review</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {historyLoading ? (
            <Card>
              <CardContent className="p-8 flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                <span className="text-sm text-muted-foreground">Loading exercise history...</span>
              </CardContent>
            </Card>
          ) : historyStats && historyAttempts.length > 0 ? (
            <div className="space-y-4">
              {/* Stats Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-0 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Target className="h-8 w-8 opacity-90" />
                    <div>
                      <p className="text-2xl font-bold">{historyStats.total}</p>
                      <p className="text-xs opacity-90">Total Attempts</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
                  <CardContent className="p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 opacity-90" />
                    <div>
                      <p className="text-2xl font-bold">
                        {historyStats.total > 0 ? Math.round((historyStats.correct / historyStats.total) * 100) : 0}%
                      </p>
                      <p className="text-xs opacity-90">Correct Rate</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Zap className="h-8 w-8 opacity-90" />
                    <div>
                      <p className="text-2xl font-bold">{historyStats.xp}</p>
                      <p className="text-xs opacity-90">Total XP Earned</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Topic Filter */}
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by Topic:</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={historyTopicFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHistoryTopicFilter("all")}
                  >
                    All Topics
                  </Button>
                  {topics.map((topic) => (
                    <Button
                      key={topic.id}
                      variant={historyTopicFilter === topic.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHistoryTopicFilter(topic.id)}
                    >
                      {topic.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Attempts List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    {historyTopicFilter === "all" ? "All Exercise Attempts" : `${topics.find(t => t.id === historyTopicFilter)?.name || "Topic"} Attempts`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredHistoryAttempts.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">No attempts found for this filter.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredHistoryAttempts.map((attempt) => (
                        <div
                          key={attempt.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {attempt.isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                            )}
                            <div>
                              <p className="font-medium text-sm">{attempt.exerciseTitle}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" />
                                {formatTime(attempt.createdAt)}
                                <span className="mx-1">•</span>
                                {topics.find(t => t.id === attempt.topicId)?.name || attempt.topicId}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={attempt.isCorrect ? "default" : "destructive"} className="text-xs">
                              {attempt.isCorrect ? "Correct" : "Incorrect"}
                            </Badge>
                            {attempt.xpEarned > 0 && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Zap className="h-3 w-3 text-yellow-500" />
                                +{attempt.xpEarned} XP
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <History className="h-12 w-12 mx-auto text-muted-foreground/40" />
                <h3 className="text-lg font-semibold">No Exercise History Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Complete exercises in quizzes to start building your history. Your attempts will appear here.
                </p>
                <Button onClick={() => setActiveTab("quiz")}>
                  Start a Quiz
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
