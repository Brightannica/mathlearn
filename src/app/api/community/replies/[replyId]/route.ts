import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

const REPLY_CONTENT_MIN = 5;
const REPLY_CONTENT_MAX = 2000;

async function getAuthorizedReply(replyId: string, sessionUserId: string) {
  const { data, error } = await supabase
    .from("forum_replies")
    .select("*")
    .eq("id", replyId)
    .eq("user_id", sessionUserId)
    .single();

  if (error || !data) {
    return { reply: null, error };
  }

  return { reply: data, error: null };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ replyId: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const replyId = resolvedParams.replyId;

    const { reply, error: authError } = await getAuthorizedReply(replyId, session.user.id);

    if (authError || !reply) {
      return NextResponse.json({ error: "Reply not found or you are not the author" }, { status: 403 });
    }

    const body = await request.json();
    const { content } = body as { content?: string };

    if (content === undefined || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const trimmed = content.trim();
    if (trimmed.length < REPLY_CONTENT_MIN) {
      return NextResponse.json(
        { error: `Content must be at least ${REPLY_CONTENT_MIN} characters` },
        { status: 400 }
      );
    }
    if (trimmed.length > REPLY_CONTENT_MAX) {
      return NextResponse.json(
        { error: `Content must be at most ${REPLY_CONTENT_MAX} characters` },
        { status: 400 }
      );
    }

    const { data: updatedReply, error } = await supabase
      .from("forum_replies")
      .update({ content: trimmed })
      .eq("id", replyId)
      .select("*")
      .single();

    if (error || !updatedReply) {
      console.error("Error updating reply:", error);
      return NextResponse.json({ error: "Failed to update reply" }, { status: 500 });
    }

    const { data: author } = await supabase
      .from("users")
      .select("name, image")
      .eq("id", session.user.id)
      .single();

    const result = {
      id: updatedReply.id as string,
      postId: updatedReply.post_id as string,
      content: updatedReply.content as string,
      authorName: author?.name ?? null,
      authorImage: author?.image ?? null,
      votes: (updatedReply.votes as number) ?? 0,
      isAccepted: (updatedReply.is_accepted as boolean) ?? false,
      createdAt: updatedReply.created_at as string,
      updatedAt: updatedReply.updated_at as string,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Unexpected error in PATCH /api/community/replies/[replyId]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ replyId: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const replyId = resolvedParams.replyId;

    const { reply, error: authError } = await getAuthorizedReply(replyId, session.user.id);

    if (authError || !reply) {
      return NextResponse.json({ error: "Reply not found or you are not the author" }, { status: 403 });
    }

    const { error } = await supabase
      .from("forum_replies")
      .delete()
      .eq("id", replyId);

    if (error) {
      console.error("Error deleting reply:", error);
      return NextResponse.json({ error: "Failed to delete reply" }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/community/replies/[replyId]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
