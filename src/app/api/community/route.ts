import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { CommunityPostSchema } from "@/lib/validation";

interface ForumPost {
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
  created_at: string;
  updated_at: string;
  author_name: string;
  author_avatar: string | null;
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("forum_posts")
      .select(
        `
        id,
        title,
        slug,
        content,
        user_id,
        topic_id,
        tags,
        is_pinned,
        is_locked,
        views,
        created_at,
        updated_at
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }

    const posts: ForumPost[] = (data ?? []).map((row: Record<string, unknown>) => {
      return {
        id: row.id as string,
        title: row.title as string,
        slug: row.slug as string,
        content: row.content as string,
        user_id: row.user_id as string,
        topic_id: row.topic_id as string | null,
        tags: (row.tags as string[]) ?? [],
        is_pinned: (row.is_pinned as boolean) ?? false,
        is_locked: (row.is_locked as boolean) ?? false,
        views: (row.views as number) ?? 0,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
        author_name: "Unknown",
        author_avatar: null,
      };
    });

    if (posts.length > 0) {
      const userIds = posts.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, image")
        .in("id", userIds);

      const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));
      posts.forEach(post => {
        const profile = profileMap.get(post.user_id);
        if (profile) {
          post.author_name = profile.name ?? "Unknown";
          post.author_avatar = profile.image ?? null;
        }
      });
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Unexpected error in GET /api/community:", error);
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
    const validated = CommunityPostSchema.parse(body);
    const { title, content, tags, topicId } = validated;

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const { data, error } = await supabase
      .from("forum_posts")
      .insert({
        user_id: session.user.id,
        title: title.trim(),
        slug,
        content: content.trim(),
        tags: Array.isArray(tags) ? tags : [],
        topic_id: topicId || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating post:", error);
      return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/community:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
