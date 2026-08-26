import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getLessonsByTopic, getExercisesByTopic } from "@/lib/supabase-data";
import { TopicIdSchema } from "@/lib/validation";

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
    if (type === "exercises" && topicId) {
      const exercises = await getExercisesByTopic(topicId);
      return NextResponse.json(exercises, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
      });
    }

    if (topicId) {
      const lessons = await getLessonsByTopic(topicId);
      return NextResponse.json(lessons, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
      });
    }

    return NextResponse.json({ error: "topicId is required" }, { status: 400 });
  } catch (error) {
    console.error("API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
