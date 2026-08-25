import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const notificationId = resolvedParams.notificationId;
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true, updated_at: now })
      .eq("id", notificationId)
      .eq("user_id", session.user.id)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const notificationId = resolvedParams.notificationId;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error deleting notification:", error);
      return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
