"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  Flame,
  Zap,
  ArrowRight,
  RotateCcw,
  Target,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { recordActivity, StreakData } from "@/lib/streak";

export interface QuizQuestion {
  id: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

export interface QuizSession {
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  streak: number;
  answers: { questionId: string; selected: number; correct: boolean }[];
  startTime: number;
  completed: boolean;
}

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  topicId: string;
  answer: string;
  isCorrect: boolean;
  xpEarned: number;
  timeSpent: number;
  hintsUsed: number;
  createdAt: string;
}

const QUESTION_TO_EXERCISE_ID: Record<string, string> = {
  le1: "ex-le1", le2: "ex-le2", le3: "ex-le3", le4: "ex-le4", le5: "ex-le5",
  q1: "ex-q1", q2: "ex-q2", q3: "ex-q3", q4: "ex-q4",
  g1: "ex-g1", g2: "ex-g2", g3: "ex-g3", g4: "ex-g4",
  f1: "ex-f1", f2: "ex-f2", f3: "ex-f3", f4: "ex-f4",
  s1: "ex-s1", s2: "ex-s2", s3: "ex-s3", s4: "ex-s4",
  e1: "ex-e1", e2: "ex-e2", e3: "ex-e3", e4: "ex-e4",
};

const quizQuestions: Record<string, QuizQuestion[]> = {
  "linear-eq": [
    { id: "le1", topic: "Linear Equations", difficulty: "easy", question: "Solve for x: 2x + 5 = 15", options: ["x = 3", "x = 5", "x = 7", "x = 10"], correctAnswer: 1, explanation: "Subtract 5 from both sides: 2x = 10. Then divide by 2: x = 5.", points: 10 },
    { id: "le2", topic: "Linear Equations", difficulty: "easy", question: "What is the slope of the line y = 3x - 7?", options: ["-7", "3", "1/3", "-3"], correctAnswer: 1, explanation: "In slope-intercept form y = mx + b, m is the slope. So slope = 3.", points: 10 },
    { id: "le3", topic: "Linear Equations", difficulty: "medium", question: "Find the y-intercept of y = -2x + 8", options: ["-2", "8", "2", "-8"], correctAnswer: 1, explanation: "The y-intercept is the value of y when x = 0, which is 8.", points: 15 },
    { id: "le4", topic: "Linear Equations", difficulty: "medium", question: "Solve for x: 3(x - 2) = 12", options: ["x = 2", "x = 4", "x = 6", "x = 8"], correctAnswer: 2, explanation: "Divide by 3: x - 2 = 4. Add 2: x = 6.", points: 15 },
    { id: "le5", topic: "Linear Equations", difficulty: "hard", question: "Two lines are perpendicular. One has slope 2. What is the slope of the other?", options: ["2", "-2", "1/2", "-1/2"], correctAnswer: 3, explanation: "Perpendicular lines have slopes that are negative reciprocals. So -1/2.", points: 20 },
  ],
  "quadratic": [
    { id: "q1", topic: "Quadratic Functions", difficulty: "easy", question: "What are the solutions to x² - 5x + 6 = 0?", options: ["x = 2, x = 3", "x = -2, x = -3", "x = 1, x = 6", "x = -1, x = -6"], correctAnswer: 0, explanation: "Factor: (x-2)(x-3) = 0, so x = 2 or x = 3.", points: 10 },
    { id: "q2", topic: "Quadratic Functions", difficulty: "easy", question: "What is the vertex of y = x² - 4x + 3?", options: ["(2, -1)", "(-2, -1)", "(2, 1)", "(-2, 1)"], correctAnswer: 0, explanation: "Vertex x = -b/(2a) = 4/2 = 2. Then y = 2² - 4(2) + 3 = -1.", points: 10 },
    { id: "q3", topic: "Quadratic Functions", difficulty: "medium", question: "Using the quadratic formula, solve x² + 2x - 8 = 0", options: ["x = 2, x = -4", "x = -2, x = 4", "x = 2, x = 4", "x = -2, x = -4"], correctAnswer: 0, explanation: "x = (-2 ± √(4 + 32))/2 = (-2 ± 6)/2. So x = 2 or x = -4.", points: 15 },
    { id: "q4", topic: "Quadratic Functions", difficulty: "hard", question: "What is the discriminant of 3x² + 2x - 1 = 0?", options: ["4", "8", "16", "12"], correctAnswer: 2, explanation: "Discriminant = b² - 4ac = 4 - 4(3)(-1) = 4 + 12 = 16.", points: 20 },
  ],
  "geometry": [
    { id: "g1", topic: "Geometry", difficulty: "easy", question: "What is the area of a rectangle with length 8 and width 5?", options: ["13", "26", "40", "80"], correctAnswer: 2, explanation: "Area = length × width = 8 × 5 = 40.", points: 10 },
    { id: "g2", topic: "Geometry", difficulty: "easy", question: "What is the sum of angles in a triangle?", options: ["90°", "180°", "270°", "360°"], correctAnswer: 1, explanation: "The sum of interior angles in any triangle is always 180°.", points: 10 },
    { id: "g3", topic: "Geometry", difficulty: "medium", question: "What is the Pythagorean theorem?", options: ["a + b = c", "a² + b² = c²", "a² - b² = c²", "a/b = c"], correctAnswer: 1, explanation: "The Pythagorean theorem states a² + b² = c² for right triangles.", points: 15 },
    { id: "g4", topic: "Geometry", difficulty: "hard", question: "What is the volume of a sphere with radius 3? (Use π ≈ 3.14)", options: ["28.26", "113.04", "36π", "12π"], correctAnswer: 1, explanation: "Volume = (4/3)πr³ = (4/3) × 3.14 × 27 ≈ 113.04.", points: 20 },
  ],
  "fractions": [
    { id: "f1", topic: "Fractions", difficulty: "easy", question: "What is 1/2 + 1/4?", options: ["2/6", "1/3", "3/4", "2/4"], correctAnswer: 2, explanation: "1/2 = 2/4, so 2/4 + 1/4 = 3/4.", points: 10 },
    { id: "f2", topic: "Fractions", difficulty: "easy", question: "What is 3/4 - 1/2?", options: ["1/4", "2/4", "1/2", "1"], correctAnswer: 1, explanation: "1/2 = 2/4, so 3/4 - 2/4 = 1/4.", points: 10 },
    { id: "f3", topic: "Fractions", difficulty: "medium", question: "What is 2/3 × 3/4?", options: ["6/7", "1/2", "5/12", "1/3"], correctAnswer: 1, explanation: "(2×3)/(3×4) = 6/12 = 1/2.", points: 15 },
    { id: "f4", topic: "Fractions", difficulty: "hard", question: "What is 3/4 ÷ 2/5?", options: ["6/20", "15/8", "5/8", "8/15"], correctAnswer: 1, explanation: "To divide fractions, multiply by reciprocal: 3/4 × 5/2 = 15/8.", points: 20 },
  ],
  "statistics": [
    { id: "s1", topic: "Statistics", difficulty: "easy", question: "What is the mean of 2, 4, 6, 8, 10?", options: ["4", "5", "6", "7"], correctAnswer: 2, explanation: "Sum = 30. Count = 5. Mean = 30/5 = 6.", points: 10 },
    { id: "s2", topic: "Statistics", difficulty: "easy", question: "What is the median of 1, 3, 3, 6, 7, 8, 9?", options: ["3", "5", "6", "7"], correctAnswer: 2, explanation: "Sorted: 1, 3, 3, 6, 7, 8, 9. Middle value is 6.", points: 10 },
    { id: "s3", topic: "Statistics", difficulty: "medium", question: "What is the range of 5, 10, 15, 20, 25?", options: ["10", "15", "20", "25"], correctAnswer: 2, explanation: "Range = max - min = 25 - 5 = 20.", points: 15 },
    { id: "s4", topic: "Statistics", difficulty: "hard", question: "If P(A) = 0.3 and P(B) = 0.4 and A and B are independent, what is P(A and B)?", options: ["0.12", "0.7", "0.52", "0.1"], correctAnswer: 0, explanation: "P(A and B) = P(A) × P(B) = 0.3 × 0.4 = 0.12.", points: 20 },
  ],
  "exponents": [
    { id: "e1", topic: "Exponents", difficulty: "easy", question: "What is 2³?", options: ["6", "8", "9", "16"], correctAnswer: 1, explanation: "2³ = 2 × 2 × 2 = 8.", points: 10 },
    { id: "e2", topic: "Exponents", difficulty: "easy", question: "What is x⁰ for any non-zero x?", options: ["0", "1", "x", "undefined"], correctAnswer: 1, explanation: "Any non-zero number raised to power 0 equals 1.", points: 10 },
    { id: "e3", topic: "Exponents", difficulty: "medium", question: "Simplify: (x²)³", options: ["x⁵", "x⁶", "x⁸", "x⁹"], correctAnswer: 1, explanation: "(x²)³ = x^(2×3) = x⁶. Power rule.", points: 15 },
    { id: "e4", topic: "Exponents", difficulty: "hard", question: "What is √(-16)?", options: ["-4", "4i", "4", "undefined (real)"], correctAnswer: 1, explanation: "√(-16) = 4i in complex numbers. In real numbers it is undefined.", points: 20 },
  ],
};

export default function QuizCard({
  topicId,
  topicName,
  difficulty,
  numQuestions = 5,
  onComplete,
  onAnswer,
}: {
  topicId?: string;
  topicName?: string;
  difficulty?: "easy" | "medium" | "hard";
  numQuestions?: number;
  onComplete?: (score: number, total: number) => void;
  onAnswer?: (answer: { questionId: string; selected: number; correct: boolean; exerciseId: string; points: number }) => void;
}) {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [streakData] = useState<StreakData | null>(() => recordActivity());

  const startQuiz = () => {
    let questions: QuizQuestion[] = [];
    let allTopics: QuizQuestion[] = [];

    if (topicId && quizQuestions[topicId]) {
      const all = [...quizQuestions[topicId]];
      questions = all.sort(() => Math.random() - 0.5).slice(0, numQuestions);
    } else {
      allTopics = Object.values(quizQuestions).flat();
      questions = allTopics.sort(() => Math.random() - 0.5).slice(0, numQuestions);
    }

    if (difficulty) {
      const filtered = allTopics.length > 0 ? allTopics.filter(q => q.difficulty === difficulty) : Object.values(quizQuestions).flat().filter(q => q.difficulty === difficulty);
      questions = filtered.sort(() => Math.random() - 0.5).slice(0, numQuestions);
    }

    if (questions.length === 0) {
      questions = Object.values(quizQuestions).flat().slice(0, numQuestions);
    }

    setSession({
      questions,
      currentIndex: 0,
      score: 0,
      streak: 0,
      answers: [],
      startTime: Date.now(),
      completed: false,
    });
    setQuizComplete(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const submitAnswer = () => {
    if (!session || selectedAnswer === null) return;
    const currentQ = session.questions[session.currentIndex];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;

    const updated = {
      ...session,
      score: isCorrect ? session.score + currentQ.points : session.score,
      streak: isCorrect ? session.streak + 1 : 0,
      answers: [...session.answers, { questionId: currentQ.id, selected: selectedAnswer, correct: isCorrect }],
    };

    setSession(updated);
    setShowResult(true);

    if (onAnswer) {
      onAnswer({
        questionId: currentQ.id,
        selected: selectedAnswer,
        correct: isCorrect,
        exerciseId: QUESTION_TO_EXERCISE_ID[currentQ.id] || currentQ.id,
        points: currentQ.points,
      });
    }
  };

  const nextQuestion = () => {
    if (!session) return;
    if (session.currentIndex + 1 >= session.questions.length) {
      setSession({ ...session, completed: true });
      setQuizComplete(true);
      if (onComplete) onComplete(session.score, session.questions.reduce((sum, q) => sum + q.points, 0));
    } else {
      setSession({ ...session, currentIndex: session.currentIndex + 1 });
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetQuiz = () => {
    setSession(null);
    setQuizComplete(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  if (quizComplete && session) {
    const totalPoints = session.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((session.score / totalPoints) * 100);
    const correctCount = session.answers.filter(a => a.correct).length;

    return (
      <Card className="overflow-hidden">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg">
            <Trophy className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-3xl font-bold text-primary">{percentage}%</p>
              <p className="text-sm text-muted-foreground">Score</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-3xl font-bold text-orange-500">{session.streak}</p>
              <p className="text-sm text-muted-foreground">Best Streak</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-3xl font-bold">{correctCount}/{session.questions.length}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-3xl font-bold text-green-500">+{session.score}</p>
              <p className="text-sm text-muted-foreground">XP Earned</p>
            </div>
          </div>

          {streakData && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold">Current Streak</span>
                </div>
                <span className="text-xl font-bold text-orange-600">{streakData.currentStreak} days</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Answer Review:</p>
            {session.answers.map((answer, i) => {
              const q = session.questions[i];
              return (
                <div key={i} className={cn(
                  "flex items-start gap-3 p-3 rounded-lg text-sm",
                  answer.correct ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
                )}>
                  {answer.correct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{q.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your answer: {q.options[answer.selected]} • Correct: {q.options[q.correctAnswer]}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button onClick={resetQuiz} variant="outline" className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={() => onComplete?.(session.score, session.questions.reduce((sum, q) => sum + q.points, 0)) || resetQuiz()} className="flex-1">
              Continue Learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-500/5">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {topicName || "Practice Quiz"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Test your knowledge with {numQuestions} questions. Earn XP for correct answers and build your streak!
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-muted">
              <Target className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-xs font-medium">{numQuestions} Questions</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <Zap className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
              <p className="text-xs font-medium">Earn XP</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
              <p className="text-xs font-medium">Build Streak</p>
            </div>
          </div>
          <Button onClick={startQuiz} className="w-full" size="lg">
            <Play className="mr-2 h-4 w-4" />
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQ = session.questions[session.currentIndex];
  const isLastQuestion = session.currentIndex === session.questions.length - 1;

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-500/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Question {session.currentIndex + 1}/{session.questions.length}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{topicName || currentQ.topic}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={currentQ.difficulty === "easy" ? "default" : currentQ.difficulty === "medium" ? "secondary" : "destructive"}>
              {currentQ.difficulty}
            </Badge>
            <Badge variant="outline">{currentQ.points} XP</Badge>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex-1">
            <Progress value={((session.currentIndex) / session.questions.length) * 100} className="h-2" />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {session.currentIndex}/{session.questions.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <p className="text-lg font-medium leading-relaxed">{currentQ.question}</p>
        </div>

        <div className="grid gap-3">
          {currentQ.options.map((option, index) => {
            let variant: "default" | "outline" | "secondary" | "destructive" = "outline";
            let className = "";

            if (showResult) {
              if (index === currentQ.correctAnswer) {
                variant = "default";
                className = "bg-green-500 hover:bg-green-600 text-white border-green-500";
              } else if (index === selectedAnswer && index !== currentQ.correctAnswer) {
                variant = "destructive";
                className = "bg-red-500 hover:bg-red-600 text-white border-red-500";
              } else {
                className = "opacity-50";
              }
            } else if (selectedAnswer === index) {
              variant = "default";
            }

            return (
              <Button
                key={index}
                variant={variant}
                className={cn("w-full text-left justify-start py-4 px-5 h-auto", className)}
                onClick={() => !showResult && setSelectedAnswer(index)}
                disabled={showResult}
              >
                <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-left">{option}</span>
              </Button>
            );
          })}
        </div>

        {showResult && (
          <div className={cn(
            "p-4 rounded-lg border animate-in fade-in",
            session.answers[session.currentIndex]?.correct
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          )}>
            <div className="flex items-start gap-3">
              {session.answers[session.currentIndex]?.correct ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {session.answers[session.currentIndex]?.correct ? "Correct!" : "Incorrect"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{currentQ.explanation}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  +{session.answers[session.currentIndex]?.correct ? currentQ.points : 0} XP
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-bold text-sm">{session.score}</span>
              <span className="text-xs text-muted-foreground">XP</span>
            </div>
            {session.streak > 0 && (
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-bold text-sm">{session.streak}</span>
                <span className="text-xs text-muted-foreground">streak</span>
              </div>
            )}
          </div>

          {!showResult ? (
            <Button onClick={submitAnswer} disabled={selectedAnswer === null} size="lg">
              Submit Answer
            </Button>
          ) : (
            <Button onClick={nextQuestion} size="lg">
              {isLastQuestion ? "Finish Quiz" : "Next Question"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
