import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { ReplySchema } from "@/lib/validation";


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

    const { data: replies, error } = await supabase
      .from("forum_replies")
      .select(`
        id,
        post_id,
        user_id,
        parent_id,
        content,
        votes,
        is_accepted,
        created_at,
        updated_at
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching replies:", error);
      return NextResponse.json({ error: "Failed to fetch replies" }, { status: 500 });
    }

    const result = (replies || []).map((reply: Record<string, unknown>) => {
      return {
        id: reply.id as string,
        postId: reply.post_id as string,
        content: reply.content as string,
        authorName: null,
        authorImage: null,
        votes: (reply.votes as number) ?? 0,
        isAccepted: (reply.is_accepted as boolean) ?? false,
        createdAt: reply.created_at as string,
        updatedAt: reply.updated_at as string,
      };
    });

    if (result.length > 0) {
      const userIds = result.map(r => (replies as Record<string, unknown>[]).find((reply: Record<string, unknown>) => reply.id === r.id)?.user_id as string).filter(Boolean);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, image")
        .in("id", userIds);

      const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));
      result.forEach((reply, index) => {
        const originalReply = replies![index] as Record<string, unknown>;
        const userId = originalReply.user_id as string;
        const profile = profileMap.get(userId);
        if (profile) {
          reply.authorName = profile.name ?? null;
          reply.authorImage = profile.image ?? null;
        }
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Unexpected error in GET /api/community/[postId]/replies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
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

    const body = await request.json();
    const validated = ReplySchema.parse(body);
    const { content, parentId } = validated;

    const { data: reply, error } = await supabase
      .from("forum_replies")
      .insert({
        post_id: postId,
        user_id: session.user.id,
        parent_id: parentId || null,
        content: content.trim(),
      })
      .select(`
        id,
        post_id,
        user_id,
        parent_id,
        content,
        votes,
        is_accepted,
        created_at,
        updated_at
      `)
      .single();

    if (error || !reply) {
      console.error("Error creating reply:", error);
      return NextResponse.json({ error: "Failed to create reply" }, { status: 500 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, image")
      .eq("id", session.user.id)
      .single();

    const result = {
      id: reply.id as string,
      postId: reply.post_id as string,
      content: reply.content as string,
      authorName: profile?.name ?? null,
      authorImage: profile?.image ?? null,
      votes: (reply.votes as number) ?? 0,
      isAccepted: (reply.is_accepted as boolean) ?? false,
      createdAt: reply.created_at as string,
      updatedAt: reply.updated_at as string,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/community/[postId]/replies:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
