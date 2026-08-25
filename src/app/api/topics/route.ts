import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getTopics, getLessonsByTopic, getExercisesByTopic, upsertUserProgress } from "@/lib/supabase-data";
import { TopicIdSchema, ProgressSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const topicIdResult = TopicIdSchema.safeParse({ topicId: searchParams.get("topicId") });
  if (!topicIdResult.success) {
    return NextResponse.json({ error: topicIdResult.error.errors[0]?.message }, { status: 400 });
  }
  const { topicId } = topicIdResult.data;

  try {
    if (type === "lessons" && topicId) {
      const lessons = await getLessonsByTopic(topicId);
      return NextResponse.json(lessons);
    }

    if (type === "exercises" && topicId) {
      const exercises = await getExercisesByTopic(topicId);
      return NextResponse.json(exercises);
    }

    const topics = await getTopics();
    return NextResponse.json(topics);
  } catch (error) {
    console.error("API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === "progress") {
      const validated = ProgressSchema.parse(data);

      const progress = await upsertUserProgress({
        userId: session.user.id,
        topicId: validated.topicId,
        ...(validated.lessonId ? { lessonId: validated.lessonId } : {}),
        ...(validated.subtopicId ? { subtopicId: validated.subtopicId } : {}),
        mastery: validated.mastery,
        status: validated.status,
        timeSpent: validated.timeSpent,
        ...(validated.completedAt ? { completedAt: validated.completedAt } : {}),
        ...(validated.masteredAt ? { masteredAt: validated.masteredAt } : {}),
      });

      return NextResponse.json(progress);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
