"use client";

import { useState, useMemo, memo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useAwardXP } from "@/hooks/use-award-xp";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Target,
  Search,
   X,
   ExternalLink,
   Flame,
   Star,
   Zap,
   ArrowRight,
   Bookmark,
 } from "lucide-react";
import { cn, getGradeColor } from "@/lib/utils";
import {
  useTopics,
  useLessons,
  useSaveProgress,
  useUserProgress,
  TopicSummary,
  LessonSummary,
} from "@/hooks/use-supabase-data";
import type { Favorite } from "@/hooks/use-favorites";

const grades = ["All Grades", "K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const domains = [
  "All Domains",
  "Counting & Cardinality",
  "Operations & Algebraic Thinking",
  "Number & Operations in Base Ten",
  "Number & Operations—Fractions",
  "Measurement & Data",
  "Geometry",
  "Ratios & Proportional Relationships",
  "The Number System",
  "Expressions & Equations",
  "Functions",
  "Statistics & Probability",
  "Algebra",
  "Geometry (HS)",
  "Trigonometry",
  "Precalculus",
  "Calculus",
];

const khanTopics: Record<string, { title: string; videoId: string }[]> = {
  "4": [
    { title: "Introduction to Fractions", videoId: "j4lwozSU0XQ" },
    { title: "Fractions on Number Line", videoId: "PvKRNP5oUpY" },
    { title: "Equivalent Fractions", videoId: "e2bQ2BG0cCs" },
    { title: "Comparing Fractions", videoId: "8zc8B5kfk9k" },
    { title: "Adding Fractions with Like Denominators", videoId: "OVR7bKylosU" },
    { title: "Subtracting Fractions", videoId: "52QzX28DR6E" },
    { title: "Mixed Numbers and Improper Fractions", videoId: "MmmFwcNKlJ0" },
    { title: "Adding Fractions with Unlike Denominators", videoId: "52QzX28DR6E" },
    { title: "Subtracting Fractions with Unlike Denominators", videoId: "Z8z3mD-qx6Q" },
    { title: "Word Problems with Fractions", videoId: "4RCRQxIRoGs" },
  ],
  "6": [
    { title: "Variables and Expressions", videoId: "tO5s0lCa8Qo" },
    { title: "Evaluating Expressions", videoId: "RKHub7pW8T8" },
    { title: "Combining Like Terms", videoId: "atU6dUFtdRI" },
    { title: "Distributive Property", videoId: "v5f2w3BRc0U" },
    { title: "Solving One-Step Equations", videoId: "XAQgByKkAGI" },
    { title: "Solving Two-Step Equations", videoId: "K6rEwF3yJAY" },
    { title: "Inequalities and Their Solutions", videoId: "Uzx0phjM3w0" },
    { title: "Graphing Inequalities", videoId: "XAQgByKkAGI" },
    { title: "Word Problems with Equations", videoId: "9XbLF1Y4lRw" },
    { title: "Absolute Value Equations", videoId: "sO5lBV5Yl7U" },
  ],
  "8": [
    { title: "Introduction to Linear Equations", videoId: "XAQgByKkAGI" },
    { title: "Solving Equations with Variables on Both Sides", videoId: "K6rEwF3yJAY" },
    { title: "Slope and Y-Intercept", videoId: "tO5s0lCa8Qo" },
    { title: "Graphing Linear Equations", videoId: "m9REVA_LBZg" },
    { title: "Systems of Equations", videoId: "Vh0iF0X2aYQ" },
    { title: "Exponents and Powers", videoId: "LdX0d31F7rY" },
    { title: "Scientific Notation", videoId: "6WpR6dgn5kU" },
    { title: "Pythagorean Theorem", videoId: "1NKtv08q7SY" },
    { title: "Volume of Cylinders, Cones, and Spheres", videoId: "rW7111-bgXk" },
    { title: "Scatter Plots and Trend Lines", videoId: "c3cwPz2NM0o" },
  ],
  "9": [
    { title: "Solving Quadratic Equations by Factoring", videoId: "5v6zTDS1QYc" },
    { title: "Solving Quadratics Using the Quadratic Formula", videoId: "HNw1I-8qkLQ" },
    { title: "Vertex Form of a Quadratic", videoId: "8QIIiyV3h8Q" },
    { title: "Introduction to Polynomials", videoId: "yJ4y6K5HtBI" },
    { title: "Factoring Polynomials", videoId: "axQUf1o1ncQ" },
    { title: "Systems of Linear Equations", videoId: "Vh0iF0X2aYQ" },
    { title: "Exponential Functions", videoId: "9LQZ1N5GQZo" },
    { title: "Graphing Exponential Functions", videoId: "z9dF63RwG5k" },
    { title: "Introduction to Geometry Proofs", videoId: "8QIIiyV3h8Q" },
    { title: "Similar Triangles and Proportions", videoId: "YXdS6qgbzQQ" },
  ],
  "10": [
    { title: "Introduction to Trigonometry", videoId: "tO5s0lCa8Qo" },
    { title: "Trigonometric Ratios", videoId: "m9REVA_LBZg" },
    { title: "Solving Right Triangles", videoId: "g4LfgBgqX0E" },
    { title: "Graphs of Sine and Cosine", videoId: "QEqGqy4vJ1U" },
    { title: "Unit Circle", videoId: "9QqDv0mgw1c" },
    { title: "Law of Sines and Law of Cosines", videoId: "c3cwPz2NM0o" },
    { title: "Introduction to Complex Numbers", videoId: "rW7111-bgXk" },
    { title: "Operations with Complex Numbers", videoId: "5v6zTDS1QYc" },
    { title: "Conic Sections", videoId: "8QIIiyV3h8Q" },
    { title: "Sequences and Series", videoId: "LdX0d31F7rY" },
  ],
  "12": [
    { title: "Introduction to Limits", videoId: "riyP6ZnOWPc" },
    { title: "Derivatives and Differentiation", videoId: "U8LIXqBGPwQ" },
    { title: "Power Rule and Sum Rule", videoId: "qrrUIyN3V5g" },
    { title: "Product Rule and Quotient Rule", videoId: "f5JR0tg0Mus" },
    { title: "Chain Rule", videoId: "HaKox1z4HMI" },
    { title: "Applications of Derivatives", videoId: "U8LIXqBGPwQ" },
    { title: "Introduction to Integrals", videoId: "riyP6ZnOWPc" },
    { title: "Definite and Indefinite Integrals", videoId: "qrrUIyN3V5g" },
    { title: "Integration by Substitution", videoId: "f5JR0tg0Mus" },
    { title: "Fundamental Theorem of Calculus", videoId: "HaKox1z4HMI" },
  ],
};

const getLessonType = (lesson: LessonSummary): "video" | "interactive" | "practice" => {
  if (lesson.videoId || lesson.videoProvider) return "video";
  switch (lesson.difficulty) {
    case "beginner":
      return "video";
    case "intermediate":
      return "interactive";
    default:
      return "practice";
  }
};

const formatDuration = (seconds?: number): string => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getKhanId = (lesson: LessonSummary): string | undefined => {
  return lesson.videoId;
};

type MappedLesson = LessonSummary & {
  type: "video" | "interactive" | "practice";
  duration: string;
  khanId?: string;
};


const typeIcons = {
  video: <Play className="h-4 w-4" />,
  interactive: <Target className="h-4 w-4" />,
  practice: <CheckCircle className="h-4 w-4" />,
};

const LessonCard = memo(function LessonCard({
  lesson, idx, activeLesson, onLessonClick, onMarkComplete, completedLessonIds, saving, lessons, onBookmark
}: {
  lesson: MappedLesson;
  idx: number;
  activeLesson: number;
  onLessonClick: (idx: number) => void;
  onMarkComplete: (lesson: LessonSummary) => void;
  completedLessonIds: Set<string>;
  saving: boolean;
  lessons: LessonSummary[];
  onBookmark: (itemId: string, itemType: Favorite["item_type"], title: string) => Promise<void>;
}) {
  return (
    <Card
      className={cn(
        "flex items-center justify-between p-4 transition-all hover:shadow-md cursor-pointer",
        idx === activeLesson && "border-primary bg-primary/5"
      )}
      onClick={() => onLessonClick(idx)}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          lesson.type === "video" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
          lesson.type === "interactive" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" :
          "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        )}>
          {typeIcons[lesson.type as keyof typeof typeIcons]}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{lesson.title}</h3>
          <p className="text-sm text-muted-foreground">{lesson.duration}</p>
        </div>
        <Badge variant="outline" className="capitalize">{lesson.type}</Badge>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(lesson.id, "lesson", lesson.title);
          }}
          className="text-muted-foreground hover:text-yellow-500"
        >
          <Bookmark className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={completedLessonIds.has(lesson.id) ? "default" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            onMarkComplete(lessons.find(l => l.id === lesson.id) as LessonSummary);
          }}
          disabled={completedLessonIds.has(lesson.id) || saving}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          {completedLessonIds.has(lesson.id) ? "Completed" : "Mark Complete"}
        </Button>
      </div>
    </Card>
  );
});
LessonCard.displayName = "LessonCard";

const VideoCard = memo(function VideoCard({ video }: { video: { title: string; videoId: string } }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-muted">
        <iframe
          src={"https://www.youtube.com/embed/" + video.videoId}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          loading="lazy" />
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold text-sm">{video.title}</h4>
        <p className="text-xs text-muted-foreground mt-1">Khan Academy Lesson</p>
      </CardContent>
    </Card>
  );
});
VideoCard.displayName = "VideoCard";

const TopicCard = memo(function TopicCard({
  topic, onClick, onBookmark
}: {
  topic: TopicSummary & { title: string; lessons: number; completed: number; hasKhan: boolean };
  onClick: (t: TopicSummary) => void;
  onBookmark: (itemId: string, itemType: Favorite["item_type"], title: string) => Promise<void>;
}) {
  const isCompleted = topic.lessons > 0 && topic.completed === topic.lessons;
  const isInProgress = topic.completed > 0 && topic.completed < topic.lessons;
  const progress = topic.lessons > 0 ? Math.round((topic.completed / topic.lessons) * 100) : 0;

  return (
    <Card
      className="group hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 transition-all cursor-pointer"
      onClick={() => onClick(topic)}
    >
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold",
              getGradeColor(topic.grade as string)
            )}>
              {topic.grade === "K" ? "K" : topic.grade}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold group-hover:text-primary transition-colors">{topic.title}</h3>
              <p className="text-sm text-muted-foreground">
                {topic.domain} • Grade {topic.grade}
              </p>
            </div>
          </div>
          {isCompleted && (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              <CheckCircle className="h-3 w-3 mr-1" /> Done
            </Badge>
          )}
          {isInProgress && !isCompleted && (
            <Badge variant="secondary">In Progress</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-xs font-medium text-muted-foreground w-12 text-right">
            {topic.completed}/{topic.lessons}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {topic.hasKhan && (
              <Badge variant="outline" className="text-xs gap-1">
                <Play className="h-3 w-3" /> Khan Academy
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {topic.lessons} lessons
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" /> +{topic.lessons * 10} XP
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-yellow-500"
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(topic.id, "topic", topic.title);
              }}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
TopicCard.displayName = "TopicCard";

type TopicDetailViewProps = {
  topic: TopicSummary;
  lessons: LessonSummary[];
  mappedLessons: MappedLesson[];
  khanVideos: { title: string; videoId: string }[];
  activeLesson: number;
  setActiveLesson: (idx: number) => void;
  completedLessonIds: Set<string>;
  handleMarkComplete: (lesson: LessonSummary) => void;
  saving: boolean;
  onBack: () => void;
  onBookmark: (itemId: string, itemType: Favorite["item_type"], title: string) => Promise<void>;
};

function TopicDetailView({
  topic,
  lessons,
  mappedLessons,
  khanVideos,
  activeLesson,
  setActiveLesson,
  completedLessonIds,
  handleMarkComplete,
  saving,
  onBack,
  onBookmark,
}: TopicDetailViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={onBack}>
          <X className="mr-2 h-4 w-4" /> Back to Topics
        </Button>
        <h1 className="text-2xl font-bold">{topic.name}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{topic.domain}</Badge>
          <Badge className={cn(getGradeColor(topic.grade as string))}>Grade {topic.grade}</Badge>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border">
          <Tabs defaultValue="lessons" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="videos">Khan Academy</TabsTrigger>
              <TabsTrigger value="practice">Practice</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            <TabsContent value="lessons" className="p-4 space-y-3">
              {mappedLessons.map((lesson, idx) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  idx={idx}
                  activeLesson={activeLesson}
                  onLessonClick={setActiveLesson}
                  onMarkComplete={handleMarkComplete}
                  completedLessonIds={completedLessonIds}
                  saving={saving}
                  lessons={lessons}
                  onBookmark={onBookmark}
                />
              ))}
              {mappedLessons.length === 0 && (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  No lessons available for this topic yet.
                </p>
              )}
            </TabsContent>

            <TabsContent value="videos" className="p-4 space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  Khan Academy Videos
                </h3>
                {khanVideos.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    No Khan Academy videos available for this topic yet. Check back soon!
                  </p>
                ) : (
                  khanVideos.map((video, idx) => (
                    <Card key={idx} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-muted">
                        <iframe
                          src={`https://www.youtube.com/embed/${video.videoId}`}
                          title={video.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                          loading="lazy" />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-sm">{video.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">Khan Academy Lesson</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="practice" className="p-4 space-y-4">
              <h2 className="text-xl font-bold mb-4">Practice Problems</h2>
              <div className="space-y-3">
                {["Fraction Operations", "Equation Solving", "Word Problems", "Mixed Review"].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-primary" />
                      <span className="font-medium">{p}</span>
                    </div>
                    <Badge variant="secondary">{[10, 15, 8, 12][i]} problems</Badge>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4">
                <Zap className="mr-2 h-4 w-4" />
                Start Practice Session
              </Button>
            </TabsContent>

            <TabsContent value="review" className="p-4">
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">Review Summary</h2>
                <p className="text-muted-foreground">
                  You&apos;ve made great progress in {topic.name}! Keep practicing to maintain your skills.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">Concepts understood</p>
                      <p className="text-xs text-muted-foreground">65%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Time spent</p>
                      <p className="text-xs text-muted-foreground">2h 15m</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Target className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-sm">Next goal</p>
                      <p className="text-xs text-muted-foreground">Complete all lessons</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-sm">XP earned</p>
                      <p className="text-xs text-muted-foreground">+240 XP</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Active Lesson */}
        <div className="border rounded-lg overflow-hidden">
          <div className="border-b p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Lesson {activeLesson + 1}: {mappedLessons[activeLesson]?.title}
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{mappedLessons[activeLesson]?.type}</Badge>
                <Badge variant="outline">{mappedLessons[activeLesson]?.duration}</Badge>
              </div>
            </div>
          </div>
          <div className="p-6">
            {mappedLessons[activeLesson]?.type === "video" && mappedLessons[activeLesson]?.khanId && (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${mappedLessons[activeLesson].khanId}`}
                  title={mappedLessons[activeLesson].title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  loading="lazy" />
              </div>
            )}
            {mappedLessons[activeLesson]?.type === "video" && !mappedLessons[activeLesson]?.khanId && (
              <div className="aspect-video bg-muted flex items-center justify-center rounded-lg">
                <div className="text-center p-8">
                  <Play className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Video Lesson</h3>
                  <p className="text-muted-foreground mb-6">
                    Learn about {mappedLessons[activeLesson]?.title.toLowerCase()} in this interactive lesson.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button size="lg" onClick={() => setActiveLesson(Math.min(activeLesson + 1, mappedLessons.length - 1))}>
                      Next Lesson <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href={`/practice?topic=${topic.id}`}>
                        <Target className="mr-2 h-4 w-4" /> Practice Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {mappedLessons[activeLesson]?.type === "interactive" && (
              <div className="aspect-video bg-muted flex items-center justify-center rounded-lg">
                <div className="text-center p-8">
                  <Target className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Interactive Lesson</h3>
                  <p className="text-muted-foreground mb-6">
                    Explore {mappedLessons[activeLesson]?.title.toLowerCase()} with hands-on exercises and visualizations.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button size="lg" onClick={() => setActiveLesson(Math.min(activeLesson + 1, mappedLessons.length - 1))}>
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/visualizations">
                        <Flame className="mr-2 h-4 w-4" /> Try Visualizations
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setActiveLesson(Math.max(0, activeLesson - 1))}
                disabled={activeLesson === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Lesson {activeLesson + 1} of {mappedLessons.length}
              </span>
              <Button
                onClick={() => setActiveLesson(Math.min(mappedLessons.length - 1, activeLesson + 1))}
                disabled={activeLesson === mappedLessons.length - 1}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LearnPage() {
  const { topics, loading: topicsLoading } = useTopics();
  const { progress, loading: progressLoading } = useUserProgress();
  const { saveProgress, saving } = useSaveProgress();
  const { awardXP } = useAwardXP();
  const { toggleFavorite } = useFavorites();

  const [selectedGrade, setSelectedGrade] = useState("All Grades");
  const [selectedDomain, setSelectedDomain] = useState("All Domains");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLesson, setActiveLesson] = useState(0);
  const [viewMode, setViewMode] = useState<"topics" | "topic-detail">("topics");
  const [selectedTopic, setSelectedTopic] = useState<TopicSummary | null>(null);
  const topicStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number }> = {};
    for (const p of progress) {
      if (p.topicId) {
        if (!stats[p.topicId]) {
          stats[p.topicId] = { total: 0, completed: 0 };
        }
        stats[p.topicId].total++;
        if (p.status === "completed") {
          stats[p.topicId].completed++;
        }
      }
    }
    return stats;
  }, [progress]);

  const completedLessonIds = useMemo(() => {
    const ids = new Set<string>();
    for (const p of progress) {
      if (p.lessonId && p.status === "completed") {
        ids.add(p.lessonId);
      }
    }
    return ids;
  }, [progress]);

  const handleTopicSelect = (topic: TopicSummary) => {
    setSelectedTopic(topic);
    setViewMode("topic-detail");
    setActiveLesson(0);
  };

  const handleMarkComplete = async (lesson: LessonSummary) => {
    if (!selectedTopic) return;
    await saveProgress({
      topicId: selectedTopic.id,
      lessonId: lesson.id,
      status: "completed",
      mastery: 100,
      timeSpent: 0,
    });

    const xpReward = lesson.xpReward || 10;
    await awardXP(xpReward, `Completed lesson: ${lesson.title}`, lesson.id, "lesson");
  };

  const { lessons } = useLessons(selectedTopic?.id || "");
  const mappedLessons = useMemo(() => {
    return lessons.map(lesson => ({
      ...lesson,
      type: getLessonType(lesson),
      duration: formatDuration(lesson.duration),
      khanId: getKhanId(lesson),
    })) as MappedLesson[];
  }, [lessons]);
  const mappedTopics = useMemo(() => {
    return topics.map(topic => ({
      ...topic,
      title: topic.name,
      lessons: topicStats[topic.id]?.total || 0,
      completed: topicStats[topic.id]?.completed || 0,
      hasKhan: (khanTopics[String(topic.grade)] || []).length > 0,
    }));
  }, [topics, topicStats]);
  const khanVideos = selectedTopic ? (khanTopics[String(selectedTopic.grade)] || []) : [];

  if (viewMode === "topic-detail" && selectedTopic) {
    return (
      <TopicDetailView
        topic={selectedTopic}
        lessons={lessons}
        mappedLessons={mappedLessons}
        khanVideos={khanVideos}
        activeLesson={activeLesson}
        setActiveLesson={setActiveLesson}
        completedLessonIds={completedLessonIds}
        handleMarkComplete={handleMarkComplete}
        saving={saving}
        onBack={() => { setViewMode("topics"); setSelectedTopic(null); }}
        onBookmark={toggleFavorite}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex-1 lg:flex-none">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Learn Math
          </h1>
          <p className="text-muted-foreground">Structured K-12 courses with Khan Academy videos</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
          <div className="flex items-center gap-2">
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade === "All Grades" ? "All Grades" : grade === "K" ? "Kindergarten" : `Grade ${grade}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Domains" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-48"
            />
          </div>
        </div>
      </div>

      {(topicsLoading || progressLoading) && (
        <div className="grid gap-4 mb-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-8 w-16 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {(topicsLoading || progressLoading) ? (
        <div className="grid gap-4 mb-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-8 w-16 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 mb-6 lg:grid-cols-3">
          <Card className="border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700" />
            <CardContent className="p-4 relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 opacity-90" />
                <div className="flex-1">
                  <h3 className="font-semibold">Completed</h3>
                  <p className="text-sm opacity-90">
                    {mappedTopics.filter((t) => t.lessons > 0 && t.completed === t.lessons).length} topics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
            <CardContent className="p-4 relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 opacity-90" />
                <div className="flex-1">
                  <h3 className="font-semibold">In Progress</h3>
                  <p className="text-sm opacity-90">
                    {mappedTopics.filter((t) => t.completed > 0 && t.completed < t.lessons).length} topics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-violet-700" />
            <CardContent className="p-4 relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 opacity-90" />
                <div className="flex-1">
                  <h3 className="font-semibold">Total Lessons</h3>
                  <p className="text-sm opacity-90">{mappedTopics.reduce((sum, t) => sum + t.lessons, 0)} available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Streak Banner */}
      <Card className="border border-primary/10 bg-gradient-to-r from-primary/5 to-orange-500/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">7-Day Streak</p>
              <p className="text-sm text-muted-foreground">Keep it up! Practice today to maintain your streak.</p>
            </div>
          </div>
          <Button size="sm" asChild>
            <Link href="/practice">Practice Now</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Topics Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Topics
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {mappedTopics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} onClick={handleTopicSelect} onBookmark={toggleFavorite} />
          ))}
        </div>
      </div>
    </div>
  );
}
