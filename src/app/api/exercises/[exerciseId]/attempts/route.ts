import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { ExerciseAttemptSchema } from "@/lib/validation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  const { exerciseId } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("exercise_attempts")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("exercise_id", exerciseId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  const { exerciseId } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = ExerciseAttemptSchema.parse(body);
    const { answer, timeSpent, hintsUsed } = validated;

    const { data: exercise, error: exerciseError } = await supabase
      .from("exercises")
      .select("solution, correct_answer, xp_reward")
      .eq("id", exerciseId)
      .single();

    if (exerciseError || !exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    const normalizedAnswer = answer.trim().toLowerCase();
    const correctAnswer = (exercise.correct_answer || "").trim().toLowerCase();
    const isCorrect = correctAnswer.length > 0
      ? normalizedAnswer === correctAnswer
      : normalizedAnswer === exercise.solution.trim().toLowerCase();

    const xpEarned = isCorrect ? exercise.xp_reward : 0;

    const { data: attempt, error: attemptError } = await supabase
      .from("exercise_attempts")
      .insert({
        user_id: session.user.id,
        exercise_id: exerciseId,
        answer: answer.trim(),
        is_correct: isCorrect,
        xp_earned: xpEarned,
        time_spent: timeSpent,
        hints_used: hintsUsed,
      })
      .select("*")
      .single();

    if (attemptError) throw attemptError;

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
