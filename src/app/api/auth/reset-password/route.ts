import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now - entry.lastReset > 60000) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }
  
  entry.count += 1;
  if (entry.count > 3) {
    return false;
  }
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const email = body?.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXTAUTH_URL}/auth/reset-password/confirm`,
    });

    if (error) {
      console.error("Password reset error:", error);
      return NextResponse.json({ error: error.message || "Failed to send reset email" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}