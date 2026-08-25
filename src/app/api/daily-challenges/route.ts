import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const CompleteChallengeSchema = z.object({
  challengeId: z.string().min(1),
});

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0];

    const { data: challenge, error: challengeError } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("date", today)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ challenge: null, userCompletion: null });
    }

    const { data: completion } = await supabase
      .from("user_daily_challenges")
      .select("*")
      .eq("challenge_id", challenge.id)
      .eq("user_id", session.user.id)
      .single();

    return NextResponse.json({
      challenge,
      userCompletion: completion,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = CompleteChallengeSchema.parse(body);

    const today = new Date().toISOString().split("T")[0];
    const { data: challenge, error: challengeError } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("id", validated.challengeId)
      .eq("date", today)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from("user_daily_challenges")
      .select("*")
      .eq("challenge_id", validated.challengeId)
      .eq("user_id", session.user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already completed" }, { status: 400 });
    }

    const { data: completion, error: completionError } = await supabase
      .from("user_daily_challenges")
      .insert({
        challenge_id: validated.challengeId,
        user_id: session.user.id,
        completed: true,
        xp_earned: challenge.xp_bonus,
      })
      .select()
      .single();

    if (completionError) {
      console.error("Error completing challenge:", completionError);
      return NextResponse.json({ error: "Failed to complete challenge" }, { status: 500 });
    }

    return NextResponse.json(completion, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
