import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const [profileRes, progressRes, achievementsRes] = await Promise.all([
      supabase.from("users").select("*").eq("id", userId).single(),
      supabase.from("user_progress").select("*").eq("user_id", userId),
      supabase.from("user_achievements").select("*, achievements(*)").eq("user_id", userId),
    ]);

    const profile = profileRes.data;
    const progress = progressRes.data || [];
    const userAchievements = achievementsRes.data || [];

    const totalXP = profile?.xp || 0;
    const level = profile?.level || 1;
    const currentStreak = profile?.streak || 0;
    const longestStreak = profile?.longestStreak || 0;
    const lessonsCompleted = progress.filter((p) => p.status === "completed").length;
    const achievementsUnlocked = userAchievements.filter((ua) => ua.completed).length;

    const recentProgress = [...progress]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    const recentActivity = recentProgress.map((p) => ({
      id: p.id,
      title: p.status === "completed" ? "Lesson Completed" : "Practice Updated",
      description: `Mastery: ${Math.round((p.mastery || 0) * 100)}%`,
      time: p.updatedAt,
      status: p.status,
    }));

    return NextResponse.json({
      stats: {
        totalXP,
        level,
        currentStreak,
        longestStreak,
        lessonsCompleted,
        achievementsUnlocked,
      },
      recentActivity,
      progress,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
