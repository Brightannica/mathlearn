import { z } from "zod";

// Query params
export const TopicIdSchema = z.object({
  topicId: z.string().min(1, "topicId is required"),
});

export const ExerciseIdSchema = z.object({
  exerciseId: z.string().min(1, "exerciseId is required"),
});

export const PostIdSchema = z.object({
  postId: z.string().min(1, "postId is required"),
});

export const ReplyIdSchema = z.object({
  replyId: z.string().min(1, "replyId is required"),
});

export const NotificationIdSchema = z.object({
  notificationId: z.string().min(1, "notificationId is required"),
});

// Request bodies
export const ProgressSchema = z.object({
  topicId: z.string().min(1, "topicId is required"),
  lessonId: z.string().optional(),
  subtopicId: z.string().optional(),
  mastery: z.number().min(0).max(100).default(0),
  status: z.string().default("in_progress"),
  timeSpent: z.number().min(0).default(0),
  completedAt: z.string().optional(),
  masteredAt: z.string().optional(),
});

export const CommunityPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be at most 200 characters"),
  content: z.string().min(10, "Content must be at least 10 characters").max(5000, "Content must be at most 5000 characters"),
  tags: z.array(z.string()).optional(),
  topicId: z.string().optional(),
});

export const CommunityPostUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(10).max(5000).optional(),
  tags: z.array(z.string()).optional(),
});

export const ReplySchema = z.object({
  content: z.string().min(5, "Content must be at least 5 characters").max(2000, "Content must be at most 2000 characters"),
  parentId: z.string().optional(),
});

export const VoteSchema = z.object({
  postId: z.string().optional(),
  replyId: z.string().optional(),
  value: z.union([z.literal(1), z.literal(-1)]),
}).refine((data) => (data.postId && !data.replyId) || (!data.postId && data.replyId), {
  message: "Exactly one of postId or replyId must be provided",
});

export const ExerciseAttemptSchema = z.object({
  answer: z.string().min(1, "answer is required"),
  timeSpent: z.number().min(0, "timeSpent must be a non-negative number"),
  hintsUsed: z.number().min(0, "hintsUsed must be a non-negative number"),
});

export const MarkNotificationsSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
  all: z.boolean().optional(),
}).refine((data) => data.all || (data.notificationIds && data.notificationIds.length > 0), {
  message: "Either all=true or notificationIds must be provided",
});

export const ProfileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  grade: z.enum(["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  image: z.string().url().optional(),
});

// Type exports
export type TopicIdInput = z.infer<typeof TopicIdSchema>;
export type ExerciseIdInput = z.infer<typeof ExerciseIdSchema>;
export type PostIdInput = z.infer<typeof PostIdSchema>;
export type ReplyIdInput = z.infer<typeof ReplyIdSchema>;
export type NotificationIdInput = z.infer<typeof NotificationIdSchema>;
export type ProgressInput = z.infer<typeof ProgressSchema>;
export type CommunityPostInput = z.infer<typeof CommunityPostSchema>;
export type CommunityPostUpdateInput = z.infer<typeof CommunityPostUpdateSchema>;
export type ReplyInput = z.infer<typeof ReplySchema>;
export type VoteInput = z.infer<typeof VoteSchema>;
export type ExerciseAttemptInput = z.infer<typeof ExerciseAttemptSchema>;
export type MarkNotificationsInput = z.infer<typeof MarkNotificationsSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
