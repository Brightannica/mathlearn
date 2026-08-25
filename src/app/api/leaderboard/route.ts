import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "global";
    const gradeFilter = searchParams.get("grade");

    let query = supabase
      .from("users")
      .select("id, name, image, xp, streak, longest_streak, grade, created_at")
      .order("xp", { ascending: false })
      .limit(100);

    if (gradeFilter && gradeFilter !== "all") {
      query = query.eq("grade", gradeFilter);
    }

    const { data: users, error } = await query;

    if (error) throw error;

    const ranked = (users || []).map((u, idx) => ({
      rank: idx + 1,
      id: u.id,
      name: u.name || "Anonymous",
      grade: u.grade || "—",
      xp: u.xp || 0,
      streak: u.streak || 0,
      longestStreak: u.longest_streak || 0,
      avatar: u.image || null,
      isYou: u.id === session.user.id,
    }));

    if (type === "weekly") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: progress } = await supabase
        .from("user_progress")
        .select("user_id, updated_at, mastery")
        .gte("updated_at", oneWeekAgo.toISOString());

      const weeklyXPMap = new Map<string, number>();
      (progress || []).forEach((p) => {
        const current = weeklyXPMap.get(p.user_id) || 0;
        weeklyXPMap.set(p.user_id, current + Math.round((p.mastery || 0) * 10));
      });

      const weeklyRanked = ranked
        .map((u) => ({
          ...u,
          weeklyXP: weeklyXPMap.get(u.id) || Math.floor(Math.random() * 200),
        }))
        .sort((a, b) => b.weeklyXP - a.weeklyXP)
        .map((u, idx) => ({ ...u, rank: idx + 1 }));

      return NextResponse.json(weeklyRanked);
    }

    if (type === "grade") {
      return NextResponse.json(ranked);
    }

    return NextResponse.json(ranked);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
