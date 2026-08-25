import { supabase } from "@/lib/supabase";

function toCamelCase(obj: Record<string, unknown> | null | undefined): Record<string, unknown> | null | undefined {
  if (!obj) return obj;
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = obj[key];
    }
  }
  return result;
}

function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      result[snakeKey] = obj[key];
    }
  }
  return result;
}

export type Topic = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  grade?: string;
  domain?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Lesson = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  videoUrl?: string;
  videoProvider?: string;
  videoId?: string;
  duration?: number;
  order: number;
  difficulty: string;
  xpReward: number;
  topicId: string;
  subtopicId?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Exercise = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  type: string;
  difficulty: string;
  xpReward: number;
  timeLimit?: number;
  hints: string[];
  solution: string;
  explanation?: string;
  topicId: string;
  subtopicId?: string;
  lessonId?: string;
  options?: unknown;
  correctAnswer?: string;
  answerFormat?: string;
  variables?: unknown;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type UserProgress = {
  id: string;
  userId: string;
  topicId?: string;
  subtopicId?: string;
  lessonId?: string;
  mastery: number;
  status: string;
  timeSpent: number;
  lastAttemptedAt?: string;
  completedAt?: string;
  masteredAt?: string;
  createdAt: string;
  updatedAt: string;
};

export async function getTopics() {
  const { data, error } = await supabase.from("topics").select("*").order("order", { ascending: true });

  if (error) throw error;
  return (data || []).map(row => toCamelCase(row)) as Topic[];
}

export async function getTopicBySlug(slug: string) {
  const { data, error } = await supabase.from("topics").select("*").eq("slug", slug).single();

  if (error) throw error;
  return toCamelCase(data) as Topic;
}

export async function getLessonsByTopic(topicId: string) {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("topic_id", topicId)
    .eq("is_published", true)
    .order("order", { ascending: true });

  if (error) throw error;
  return (data || []).map(row => toCamelCase(row)) as Lesson[];
}

export async function getExercisesByTopic(topicId: string) {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("topic_id", topicId)
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map(row => toCamelCase(row)) as Exercise[];
}

export async function getUserProgress(userId: string) {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(row => toCamelCase(row)) as UserProgress[];
}

export async function upsertUserProgress(progress: Partial<UserProgress> & { userId: string }) {
  const snakeData = toSnakeCase(progress);

  let onConflict = "user_id";
  if (snakeData.lesson_id) {
    onConflict = "user_id,lesson_id";
  } else if (snakeData.subtopic_id) {
    onConflict = "user_id,subtopic_id";
  } else if (snakeData.topic_id) {
    onConflict = "user_id,topic_id";
  }

  const { data, error } = await supabase
    .from("user_progress")
    .upsert(snakeData, { onConflict })
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(data) as UserProgress;
}
