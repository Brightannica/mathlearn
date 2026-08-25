import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const results: Record<string, { status: string; latency?: number; error?: string }> = {};

  // Check Prisma connection
  const prismaStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.prisma = { status: "ok", latency: Date.now() - prismaStart };
  } catch (error) {
    results.prisma = { status: "error", error: error instanceof Error ? error.message : "Unknown error" };
  }

  // Check Supabase connection
  const supabaseStart = Date.now();
  try {
    const { error } = await supabase.from("topics").select("count").limit(1);
    if (error) {
      results.supabase = { status: "error", error: error.message };
    } else {
      results.supabase = { status: "ok", latency: Date.now() - supabaseStart };
    }
  } catch (error) {
    results.supabase = { status: "error", error: error instanceof Error ? error.message : "Unknown error" };
  }

  const overallStatus = Object.values(results).every((r) => r.status === "ok") ? 200 : 503;

  return NextResponse.json(
    {
      status: overallStatus === 200 ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      services: results,
    },
    { status: overallStatus }
  );
}
