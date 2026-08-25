import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const FavoriteSchema = z.object({
  itemId: z.string().min(1),
  itemType: z.enum(["lesson", "exercise", "post", "topic"]),
  title: z.string().min(1).max(200),
});

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("API error:", error);
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
    const validated = FavoriteSchema.parse(body);

    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: session.user.id,
        item_id: validated.itemId,
        item_type: validated.itemType,
        title: validated.title,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating favorite:", error);
      return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, itemType } = body as { itemId: string; itemType: string };

    if (!itemId || !itemType) {
      return NextResponse.json({ error: "itemId and itemType are required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", session.user.id)
      .eq("item_id", itemId)
      .eq("item_type", itemType);

    if (error) {
      console.error("Error deleting favorite:", error);
      return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
