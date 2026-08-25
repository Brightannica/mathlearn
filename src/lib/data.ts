// Unified data access layer
// Abstracts Prisma (auth/users) vs Supabase (content/progress) duality

import { supabase } from "./supabase";
import { prisma } from "./prisma";

// Re-export Supabase data functions for content
export {
  getTopics,
  getTopicBySlug,
  getLessonsByTopic,
  getExercisesByTopic,
  getUserProgress,
  upsertUserProgress,
} from "./supabase-data";

// Re-export Prisma client for auth/user operations
export { prisma } from "./prisma";

// Unified user profile access
export async function getUserProfile(userId: string) {
  // Try Supabase users table first (for content features)
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      return data;
    }
  } catch {
    console.warn("Supabase users table not available, falling back to Prisma");
  }

  // Fallback to Prisma User model (for auth features)
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        xp: true,
        level: true,
        streak: true,
        longestStreak: true,
      },
    });
    return user;
  } catch (e) {
    console.error("Failed to fetch user profile from both sources:", e);
    return null;
  }
}

// Unified progress sync
export async function syncProgressToSupabase(
  userId: string,
  topicId: string,
  lessonId: string,
  mastery: number
) {
  const { upsertUserProgress } = await import("./supabase-data");
  return upsertUserProgress({
    userId,
    topicId,
    lessonId,
    mastery,
    status: mastery >= 80 ? "mastered" : mastery > 0 ? "in_progress" : "not_started",
    timeSpent: 0,
  });
}

// Helper to determine which database to use for a given operation
export function getDataProvider(
  operation: "auth" | "content" | "progress" | "forum"
) {
  switch (operation) {
    case "auth":
      return { provider: "prisma" as const, client: prisma };
    case "content":
    case "progress":
    case "forum":
      return { provider: "supabase" as const, client: supabase };
    default:
      return { provider: "supabase" as const, client: supabase };
  }
}
