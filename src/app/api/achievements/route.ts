import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: achievements, error } = await supabase
      .from("achievements")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    const { data: userAchievements } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", session.user.id);

    return NextResponse.json({
      achievements: achievements || [],
      userAchievements: userAchievements || [],
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
