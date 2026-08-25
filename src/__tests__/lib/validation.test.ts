import { TopicIdSchema, ProgressSchema, CommunityPostSchema, VoteSchema, ExerciseAttemptSchema } from "@/lib/validation";

describe("validation schemas", () => {
  it("validates topicId", () => {
    expect(() => TopicIdSchema.parse({ topicId: "" })).toThrow();
    expect(TopicIdSchema.parse({ topicId: "123" })).toEqual({ topicId: "123" });
  });

  it("validates progress input", () => {
    expect(() => ProgressSchema.parse({ mastery: 150 })).toThrow();
    expect(ProgressSchema.parse({ topicId: "123", mastery: 50 })).toEqual({ topicId: "123", mastery: 50, status: "in_progress", timeSpent: 0 });
  });

  it("validates community post", () => {
    expect(() => CommunityPostSchema.parse({ title: "ab", content: "short" })).toThrow();
    expect(CommunityPostSchema.parse({ title: "Valid title", content: "This is a valid post content" })).toBeTruthy();
  });

  it("validates vote", () => {
    expect(() => VoteSchema.parse({ value: 2 })).toThrow();
    expect(VoteSchema.parse({ postId: "123", value: 1 })).toBeTruthy();
    expect(VoteSchema.parse({ replyId: "456", value: -1 })).toBeTruthy();
  });

  it("validates exercise attempt", () => {
    expect(() => ExerciseAttemptSchema.parse({ answer: "", timeSpent: -1 })).toThrow();
    expect(ExerciseAttemptSchema.parse({ answer: "42", timeSpent: 30, hintsUsed: 0 })).toBeTruthy();
  });
});
