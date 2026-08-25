import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const AwardXPSchema = z.object({
  amount: z.number().min(1).max(1000),
  reason: z.string().min(1).max(200),
  sourceId: z.string().optional(),
  sourceType: z.enum(["lesson", "quiz", "exercise", "achievement", "streak"]).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);

    const { data: xpRecords, error } = await supabase
      .from("xp_history")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching XP history:", error);
      return NextResponse.json({ error: "Failed to fetch XP history" }, { status: 500 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("xp, level")
      .eq("id", session.user.id)
      .single();

    return NextResponse.json({
      xp: user?.xp ?? 0,
      level: user?.level ?? 1,
      history: xpRecords ?? [],
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
    const validated = AwardXPSchema.parse(body);

    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("xp, level")
      .eq("id", session.user.id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newXP = (user.xp || 0) + validated.amount;
    const newLevel = Math.floor(newXP / 500) + 1;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    if (updateError) {
      console.error("Error updating XP:", updateError);
      return NextResponse.json({ error: "Failed to update XP" }, { status: 500 });
    }

    const { error: historyError } = await supabase
      .from("xp_history")
      .insert({
        user_id: session.user.id,
        amount: validated.amount,
        reason: validated.reason,
        source_id: validated.sourceId,
        source_type: validated.sourceType,
      });

    if (historyError) {
      console.error("Error recording XP history:", historyError);
    }

    return NextResponse.json({
      success: true,
      xp: newXP,
      level: newLevel,
      awarded: validated.amount,
      reason: validated.reason,
    });
  } catch (error) {
    console.error("API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
