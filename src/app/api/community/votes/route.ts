import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { VoteSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = VoteSchema.parse(body);
    const { postId, replyId, value } = validated;

    const votePayload: Record<string, string | number> = {
      user_id: session.user.id,
      value,
    };

    if (postId) {
      votePayload.post_id = postId;
    }
    if (replyId) {
      votePayload.reply_id = replyId;
    }

    const { error } = await supabase
      .from("forum_votes")
      .upsert(votePayload, {
        onConflict: postId ? "user_id,post_id" : "user_id,reply_id",
      });

    if (error) {
      console.error("Error upserting vote:", error);
      return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
    }

    return NextResponse.json({ success: true, value });
  } catch (error) {
    console.error("Unexpected error in POST /api/community/votes:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
