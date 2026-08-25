import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getUserProgress, upsertUserProgress } from "@/lib/supabase-data";
import { ProgressSchema } from "@/lib/validation";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const progress = await getUserProgress(session.user.id);
    return NextResponse.json(progress);
  } catch (error) {
    console.error("API error:", error);
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
    const validated = ProgressSchema.parse(body);

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
  } catch (error) {
    console.error("API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
