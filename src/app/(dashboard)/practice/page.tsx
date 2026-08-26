"use client";

import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Target, BookOpen, ChevronRight, Filter, RotateCcw, Clock, Zap,
  History, CheckCircle2, XCircle, Bookmark, Search, ArrowRight, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import QuizCard, { ExerciseAttempt } from "@/components/quiz-card";
import Link from "next/link";
import { useTopics, useUserProgress, useExercises, fetchJSON, ExerciseSummary } from "@/hooks/use-supabase-data";
import type { Favorite } from "@/hooks/use-favorites";
import { useAwardXP } from "@/hooks/use-award-xp";
import { useFavorites } from "@/hooks/use-favorites";
import { getProblems, getProblemsByDifficulty, getProblemsByTopic } from "@/lib/problems";
import { isSolved } from "@/lib/local-state";

function getTopicDifficulty(grade?: string): "easy" | "medium" | "hard" {
  if (!grade) return "medium";
  const gradeNum = parseInt(grade, 10);
  if (isNaN(gradeNum)) return "medium";
  if (gradeNum <= 3) return "easy";
  if (gradeNum <= 7) return "medium";
  return "hard";
}

const difficultyColor: Record<string, string> = {
  easy: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  medium: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  hard: "text-rose-400 border-rose-400/30 bg-rose-400/10",
};

const FALLBACK_TOPICS = [
  { id: "linear-eq", name: "Linear Equations", questions: 24, mastered: 18, icon: "ƒ", difficulty: "medium" as const },
  { id: "quadratic", name: "Quadratic Functions", questions: 18, mastered: 8, icon: "x²", difficulty: "medium" as const },
  { id: "geometry", name: "Geometry Basics", questions: 30, mastered: 25, icon: "△", difficulty: "medium" as const },
  { id: "fractions", name: "Fractions & Decimals", questions: 20, mastered: 12, icon: "½", difficulty: "medium" as const },
  { id: "statistics", name: "Statistics", questions: 15, mastered: 3, icon: "σ", difficulty: "hard" as const },
  { id: "exponents", name: "Exponents & Radicals", questions: 16, mastered: 10, icon: "√", difficulty: "medium" as const },
];

const MemoizedQuizCard = memo(function MemoizedQuizCard(props: React.ComponentProps<typeof QuizCard>) {
  return <QuizCard {...props} />;
});
MemoizedQuizCard.displayName = "MemoizedQuizCard";

function PracticeTopicCard({ topic, onSelect, onBookmark }: {
  topic: { id: string; name: string; questions: number; mastered: number; icon: string; difficulty: string };
  onSelect: (id: string) => void;
  onBookmark: (itemId: string, itemType: Favorite["item_type"], title: string) => Promise<void>;
}) {
  const progress = Math.round((topic.mastered / topic.questions) * 100);
  const status = topic.mastered >= topic.questions * 0.8 ? "Mastered" : topic.mastered > 0 ? "In Progress" : "New";
  const statusColor = status === "Mastered" ? "text-emerald-400" : status === "In Progress" ? "text-amber-400" : "text-zinc-500";

  return (
    <button
      onClick={() => onSelect(topic.id)}
      className="text-left border border-zinc-800/60 bg-[#0d0d0d] p-5 hover:border-zinc-600 transition-all group relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 border border-zinc-700 flex items-center justify-center font-bold text-lg text-zinc-300 group-hover:border-[#c4f000] group-hover:text-[#c4f000] transition-colors">
            {topic.icon}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100 group-hover:text-[#c4f000] transition-colors">{topic.name}</h3>
            <p className="text-xs text-zinc-500">{topic.questions} problems</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(topic.id, "topic", topic.name);
          }}
          className="p-1.5 text-zinc-600 hover:text-[#c4f000] transition-colors"
          aria-label="Bookmark"
        >
          <Bookmark className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-600">mastery</span>
          <span className="font-mono text-zinc-300">{progress}%</span>
        </div>
        <div className="h-1.5 bg-zinc-900">
          <div
            className="h-full bg-[#c4f000] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={cn("text-[10px] uppercase tracking-widest font-mono", statusColor)}>// {status.toLowerCase()}</span>
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">{topic.difficulty}</span>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500 group-hover:text-[#c4f000] transition-colors">
        <span>start practice</span>
        <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
}

function formatTime(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function PracticePage() {
  const { topics } = useTopics();
  const { progress } = useUserProgress();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("topics");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { exercises: topicExercises } = useExercises(selectedTopic || "");
  const { awardXP } = useAwardXP();
  const { toggleFavorite } = useFavorites();

  const [recentAttempts, setRecentAttempts] = useState<ExerciseAttempt[]>([]);
  const [historyAttempts, setHistoryAttempts] = useState<ExerciseAttempt[][]>([]);
  const [historyStats, setHistoryStats] = useState<{ total: number; correct: number; xp: number } | null>(null);
  const [historyTopicFilter, setHistoryTopicFilter] = useState<string>("all");
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!selectedTopic || topicExercises.length === 0) {
      setRecentAttempts([]);
      return;
    }
    let cancelled = false;
    setAttemptsLoading(true);

    async function loadAttempts() {
      try {
        const results = await Promise.all(
          topicExercises.map((ex) => fetchJSON<ExerciseAttempt[]>(`/api/exercises/${ex.id}/attempts`).catch(() => []))
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
    setHistoryLoading(true);

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
          allExercises.map((ex) => fetchJSON<ExerciseAttempt[]>(`/api/exercises/${ex.id}/attempts`).catch(() => []))
        );
        if (!cancelled) {
          results.forEach((attempts, i) => {
            const ex = allExercises[i];
            attempts.forEach((a) => {
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
          const correct = allFlat.filter((a) => a.isCorrect).length;
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
        body: JSON.stringify({ answer: String(answer.selected), timeSpent: 0, hintsUsed: 0 }),
      });
    } catch {}
  };

  const practiceTopics = topics.length > 0
    ? topics.map((t) => {
        const topicProgress = progress.filter((p) => p.topicId === t.id);
        const mastered = topicProgress.reduce((sum, p) => sum + Math.round((p.mastery || 0) * 100), 0);
        const questions = topicProgress.length > 0 ? topicProgress.length * 5 : 20;
        return {
          id: t.slug || t.id,
          name: t.name,
          questions: Math.max(questions, 10),
          mastered: Math.min(mastered, questions),
          icon: t.icon || "ƒ",
          difficulty: getTopicDifficulty(t.grade),
        };
      })
    : FALLBACK_TOPICS;

  const handleQuizComplete = useCallback((score: number, total: number) => {
    const xpEarned = Math.round((score / total) * 100);
    const topicName = practiceTopics.find((t) => t.id === selectedTopic)?.name || "Practice";
    awardXP(xpEarned, `Completed quiz: ${topicName}`, undefined, "quiz");
  }, [selectedTopic, practiceTopics, awardXP]);

  const filteredPracticeTopics = useMemo(() => {
    let topics = difficultyFilter === "all" ? practiceTopics : practiceTopics.filter((t) => t.difficulty === difficultyFilter);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      topics = topics.filter((t) => t.name.toLowerCase().includes(term));
    }
    return topics;
  }, [practiceTopics, difficultyFilter, searchTerm]);

  const totalMastered = practiceTopics.reduce((sum, t) => sum + t.mastered, 0);
  const totalQuestions = practiceTopics.reduce((sum, t) => sum + t.questions, 0);
  const overallProgress = totalQuestions > 0 ? Math.round((totalMastered / totalQuestions) * 100) : 0;
  const masteredTopics = practiceTopics.filter((t) => t.mastered >= t.questions * 0.8).length;

  const filteredHistoryAttempts = historyTopicFilter === "all"
    ? historyAttempts.flat()
    : (historyAttempts.find((g) => g[0]?.topicId === historyTopicFilter) || []);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// drill mode</div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-7 w-7" />
            practice
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">pick a topic. get problems. build mastery.</p>
        </div>
        <Button asChild variant="outline" className="border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900">
          <Link href="/learn">all courses <ChevronRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-px bg-zinc-800/60 border border-zinc-800/60 grid-cols-2 sm:grid-cols-4">
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">topics</div>
              <div className="text-2xl font-bold text-zinc-100 mt-1">{practiceTopics.length}</div>
            </div>
            <BookOpen className="h-5 w-5 text-zinc-700" />
          </div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">mastered</div>
              <div className="text-2xl font-bold text-[#c4f000] mt-1">{masteredTopics}</div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-zinc-700" />
          </div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">solved</div>
              <div className="text-2xl font-bold text-zinc-100 mt-1">{totalMastered}</div>
            </div>
            <Target className="h-5 w-5 text-zinc-700" />
          </div>
        </div>
        <div className="bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">progress</div>
              <div className="text-2xl font-bold text-zinc-100 mt-1">{overallProgress}%</div>
            </div>
            <Zap className="h-5 w-5 text-zinc-700" />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-zinc-900/40 border border-zinc-800/60 p-1">
          <TabsTrigger value="topics" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">topics</TabsTrigger>
          <TabsTrigger value="quiz" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">quiz</TabsTrigger>
          <TabsTrigger value="review" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">review</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">history</TabsTrigger>
          <TabsTrigger value="solver" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">solver</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-4 mt-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <Input
                placeholder="search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#0d0d0d] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
              />
            </div>
            <div className="flex gap-1.5">
              {["all", "easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={cn(
                    "px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors",
                    difficultyFilter === d
                      ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                      : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Topics grid */}
          {filteredPracticeTopics.length === 0 ? (
            <div className="border border-zinc-800/60 bg-[#0d0d0d] p-12 text-center">
              <Filter className="h-8 w-8 mx-auto text-zinc-700 mb-3" />
              <p className="text-zinc-500">no topics match those filters</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredPracticeTopics.map((topic) => (
                <PracticeTopicCard key={topic.id} topic={topic} onSelect={(id) => { setSelectedTopic(id); setActiveTab("quiz"); }} onBookmark={toggleFavorite} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quiz" className="space-y-4 mt-4">
          {selectedTopic ? (
            <div className="space-y-4">
              <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab("topics")}
                    className="text-zinc-500 hover:text-zinc-100 text-xs uppercase tracking-widest"
                  >
                    ← topics
                  </button>
                  <span className="text-zinc-700">/</span>
                  <span className="font-semibold text-zinc-100">
                    {practiceTopics.find((t) => t.id === selectedTopic)?.name}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">5 questions · 10 min</span>
              </div>

              <MemoizedQuizCard
                topicId={selectedTopic}
                topicName={practiceTopics.find((t) => t.id === selectedTopic)?.name}
                numQuestions={5}
                onComplete={handleQuizComplete}
                onAnswer={handleAnswer}
              />

              {selectedTopic && (
                <Card className="border-zinc-800/60 bg-[#0d0d0d]">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="h-4 w-4 text-zinc-500" />
                      <h3 className="font-semibold text-sm">recent attempts</h3>
                    </div>
                    {attemptsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#c4f000]" />
                        <span className="ml-2 text-sm text-zinc-500">loading...</span>
                      </div>
                    ) : recentAttempts.length === 0 ? (
                      <div className="text-center py-8">
                        <RotateCcw className="h-8 w-8 mx-auto text-zinc-700 mb-2" />
                        <p className="text-sm text-zinc-500">no attempts yet. start the quiz above.</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {recentAttempts.map((attempt) => (
                          <div
                            key={attempt.id}
                            className="flex items-center justify-between p-3 border border-zinc-800/40 hover:border-zinc-700 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {attempt.isCorrect ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                              )}
                              <div>
                                <p className="font-medium text-sm">{attempt.exerciseTitle}</p>
                                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(attempt.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", attempt.isCorrect ? "text-emerald-400 border-emerald-400/30" : "text-rose-400 border-rose-400/30")}>
                                {attempt.isCorrect ? "correct" : "incorrect"}
                              </Badge>
                              {attempt.xpEarned > 0 && (
                                <Badge variant="outline" className="text-[10px] text-zinc-300 border-zinc-700">
                                  <Zap className="h-3 w-3 mr-1" />
                                  +{attempt.xpEarned}
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
            <div className="border border-zinc-800/60 bg-[#0d0d0d] p-12 text-center space-y-4">
              <Target className="h-12 w-12 mx-auto text-zinc-700" />
              <div>
                <h3 className="text-lg font-semibold">select a topic</h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto mt-1">
                  choose a topic from the topics tab, or jump straight into a quick mixed quiz.
                </p>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button onClick={() => setSelectedTopic("linear-eq")} className="bg-[#c4f000] text-black hover:bg-[#b3d800]">
                  linear equations
                </Button>
                <Button variant="outline" onClick={() => setSelectedTopic("quadratic")} className="border-zinc-700">
                  quadratics
                </Button>
                <Button variant="outline" onClick={() => setSelectedTopic("fractions")} className="border-zinc-700">
                  fractions
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="review" className="space-y-3 mt-4">
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 border border-[#c4f000]/30 bg-[#c4f000]/5">
                <RotateCcw className="h-4 w-4 text-[#c4f000]" />
              </div>
              <div>
                <h3 className="font-semibold">spaced review</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  topics you&apos;ve started but haven&apos;t mastered. review them to lock the knowledge in.
                </p>
              </div>
            </div>

            {practiceTopics.filter((t) => t.mastered > 0 && t.mastered < t.questions).length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm">
                <Sparkles className="h-8 w-8 mx-auto text-zinc-700 mb-2" />
                nothing to review yet. start a topic to build your review queue.
              </div>
            ) : (
              <div className="space-y-2">
                {practiceTopics
                  .filter((t) => t.mastered > 0 && t.mastered < t.questions)
                  .map((topic) => {
                    const p = Math.round((topic.mastered / topic.questions) * 100);
                    return (
                      <button
                        key={topic.id}
                        onClick={() => { setSelectedTopic(topic.id); setActiveTab("quiz"); }}
                        className="w-full flex items-center justify-between p-3 border border-zinc-800/40 hover:border-zinc-700 transition-colors group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 border border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:border-[#c4f000] group-hover:text-[#c4f000] transition-colors">
                            {topic.icon}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{topic.name}</p>
                            <p className="text-xs text-zinc-500">{topic.mastered}/{topic.questions} mastered · {p}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="hidden sm:block w-24 h-1.5 bg-zinc-900">
                            <div className="h-full bg-[#c4f000]" style={{ width: `${p}%` }} />
                          </div>
                          <span className="text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-[#c4f000] transition-colors flex items-center gap-1">
                            review <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          {historyLoading ? (
            <div className="border border-zinc-800/60 bg-[#0d0d0d] p-12 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#c4f000] mx-auto" />
              <p className="text-sm text-zinc-500 mt-3">loading history...</p>
            </div>
          ) : historyStats && historyAttempts.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-px bg-zinc-800/60 border border-zinc-800/60 grid-cols-3">
                <div className="bg-[#0d0d0d] p-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600">attempts</div>
                  <div className="text-2xl font-bold text-zinc-100 mt-1">{historyStats.total}</div>
                </div>
                <div className="bg-[#0d0d0d] p-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600">accuracy</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    {historyStats.total > 0 ? Math.round((historyStats.correct / historyStats.total) * 100) : 0}%
                  </div>
                </div>
                <div className="bg-[#0d0d0d] p-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600">xp earned</div>
                  <div className="text-2xl font-bold text-[#c4f000] mt-1">{historyStats.xp}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">filter:</span>
                <button
                  onClick={() => setHistoryTopicFilter("all")}
                  className={cn(
                    "px-2.5 py-1 text-xs border transition-colors",
                    historyTopicFilter === "all"
                      ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                      : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  all
                </button>
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setHistoryTopicFilter(topic.id)}
                    className={cn(
                      "px-2.5 py-1 text-xs border transition-colors",
                      historyTopicFilter === topic.id
                        ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                        : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>

              <div className="border border-zinc-800/60 bg-[#0d0d0d]">
                <div className="p-4 border-b border-zinc-800/60">
                  <h3 className="font-semibold text-sm">
                    {historyTopicFilter === "all" ? "all attempts" : topics.find((t) => t.id === historyTopicFilter)?.name}
                  </h3>
                </div>
                <div className="divide-y divide-zinc-800/40 max-h-96 overflow-y-auto">
                  {filteredHistoryAttempts.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-sm">no attempts for this filter</div>
                  ) : (
                    filteredHistoryAttempts.map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between p-3 hover:bg-zinc-900/40 transition-colors">
                        <div className="flex items-center gap-3">
                          {attempt.isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{attempt.exerciseTitle}</p>
                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {formatTime(attempt.createdAt)}
                              {attempt.topicId && (
                                <>
                                  <span className="mx-1 text-zinc-700">·</span>
                                  {topics.find((t) => t.id === attempt.topicId)?.name || attempt.topicId}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", attempt.isCorrect ? "text-emerald-400 border-emerald-400/30" : "text-rose-400 border-rose-400/30")}>
                            {attempt.isCorrect ? "correct" : "incorrect"}
                          </Badge>
                          {attempt.xpEarned > 0 && (
                            <Badge variant="outline" className="text-[10px] text-zinc-300 border-zinc-700">
                              <Zap className="h-3 w-3 mr-1" />+{attempt.xpEarned}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-zinc-800/60 bg-[#0d0d0d] p-12 text-center space-y-4">
              <History className="h-12 w-12 mx-auto text-zinc-700" />
              <div>
                <h3 className="text-lg font-semibold">no history yet</h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto mt-1">
                  complete exercises to build your history. everything you attempt shows up here.
                </p>
              </div>
              <Button onClick={() => setActiveTab("topics")} className="bg-[#c4f000] text-black hover:bg-[#b3d800]">
                start practicing
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="solver" className="mt-4">
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#c4f000]" />
                  leetcode-style problems
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">write actual code. pass real tests. earn XP.</p>
              </div>
              <Button asChild size="sm" className="bg-[#c4f000] text-black hover:bg-[#b3d800]">
                <Link href="/solve">open solver <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>

            <div className="space-y-1.5">
              {getProblems().slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/solve?p=${p.slug}`}
                  className="flex items-center justify-between p-3 border border-zinc-800/40 hover:border-zinc-700 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {isSolved(p.slug) ? (
                      <CheckCircle2 className="h-4 w-4 text-[#c4f000]" />
                    ) : (
                      <div className="h-4 w-4 border border-zinc-700" />
                    )}
                    <div>
                      <p className={cn("font-medium text-sm", isSolved(p.slug) ? "text-zinc-400" : "text-zinc-100")}>{p.title}</p>
                      <p className="text-xs text-zinc-500 capitalize">{p.topic} · {p.tags.slice(0, 2).join(", ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", difficultyColor[p.difficulty])}>
                      {p.difficulty}
                    </Badge>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Zap className="h-3 w-3" />{p.xp}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-[#c4f000] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-3 text-center">
              <Link href="/solve" className="text-xs text-zinc-500 hover:text-[#c4f000] transition-colors inline-flex items-center gap-1">
                view all {getProblems().length} problems <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
