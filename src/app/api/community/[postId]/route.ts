import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { CommunityPostUpdateSchema } from "@/lib/validation";

async function getPost(postId: string) {
  const { data, error } = await supabase
    .from("forum_posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (error || !data) {
    return { post: null, error };
  }

  return { post: data, error: null };
}

async function getAuthorizedPost(postId: string, sessionUserId: string) {
  const { data, error } = await supabase
    .from("forum_posts")
    .select("*")
    .eq("id", postId)
    .eq("user_id", sessionUserId)
    .single();

  if (error || !data) {
    return { post: null, error };
  }

  return { post: data, error: null };
}

interface ForumPostDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  user_id: string;
  topic_id: string | null;
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
  views: number;
  replies_count: number;
  votes_count: number;
  created_at: string;
  updated_at: string;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const postId = resolvedParams.postId;

    const { post, error } = await getPost(postId);

    if (error || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const { count: repliesCount } = await supabase
      .from("forum_replies")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    const { count: upvotesCount } = await supabase
      .from("forum_votes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .eq("value", 1);

    const { count: downvotesCount } = await supabase
      .from("forum_votes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .eq("value", -1);

    const votesCount = (upvotesCount ?? 0) - (downvotesCount ?? 0);

    await supabase
      .from("forum_posts")
      .update({ views: (post.views ?? 0) + 1 })
      .eq("id", postId);

    const result: ForumPostDetail = {
      id: post.id as string,
      title: post.title as string,
      slug: post.slug as string,
      content: post.content as string,
      user_id: post.user_id as string,
      topic_id: post.topic_id as string | null,
      tags: (post.tags as string[]) ?? [],
      is_pinned: (post.is_pinned as boolean) ?? false,
      is_locked: (post.is_locked as boolean) ?? false,
      views: (post.views ?? 0) + 1,
      replies_count: repliesCount ?? 0,
      votes_count: votesCount,
      created_at: post.created_at as string,
      updated_at: post.updated_at as string,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Unexpected error in GET /api/community/[postId]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const postId = resolvedParams.postId;

    const { post, error: authError } = await getAuthorizedPost(postId, session.user.id);

    if (authError || !post) {
      return NextResponse.json({ error: "Post not found or you are not the author" }, { status: 403 });
    }

    const body = await request.json();
    const validated = CommunityPostUpdateSchema.parse(body);

    const updates: Record<string, unknown> = {};

    if (validated.title !== undefined) {
      updates.title = validated.title.trim();
    }

    if (validated.content !== undefined) {
      updates.content = validated.content.trim();
    }

    if (validated.tags !== undefined) {
      updates.tags = validated.tags;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("forum_posts")
      .update(updates)
      .eq("id", postId)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating post:", error);
      return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error in PATCH /api/community/[postId]:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const postId = resolvedParams.postId;

    const { post, error: authError } = await getAuthorizedPost(postId, session.user.id);

    if (authError || !post) {
      return NextResponse.json({ error: "Post not found or you are not the author" }, { status: 403 });
    }

    const { error } = await supabase.from("forum_posts").delete().eq("id", postId);

    if (error) {
      console.error("Error deleting post:", error);
      return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/community/[postId]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
