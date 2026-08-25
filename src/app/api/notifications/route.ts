import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { MarkNotificationsSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get("unread") === "true";

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (unreadOnly) {
      query = query.eq("read", false);
    }

    const { data: notifications, error } = await query;

    if (error) throw error;

    return NextResponse.json(notifications || []);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = MarkNotificationsSchema.parse(body);
    const { notificationIds, all } = validated;

    const now = new Date().toISOString();

    if (all) {
      const { data, error } = await supabase
        .from("notifications")
        .update({ read: true, updated_at: now })
        .eq("user_id", session.user.id)
        .select("id");

      if (error) throw error;

      return NextResponse.json({
        success: true,
        updatedCount: data?.length || 0,
      });
    }

    if (notificationIds && notificationIds.length > 0) {
      const { data, error } = await supabase
        .from("notifications")
        .update({ read: true, updated_at: now })
        .in("id", notificationIds)
        .eq("user_id", session.user.id)
        .select("id");

      if (error) throw error;

      return NextResponse.json({
        success: true,
        updatedCount: data?.length || 0,
      });
    }

    return NextResponse.json(
      { error: "Provide notificationIds or all=true" },
      { status: 400 }
    );
  } catch (error) {
    console.error("API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
