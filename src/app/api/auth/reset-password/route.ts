import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getRateLimiter, getClientIp } from "@/lib/rate-limit";

const limiter = getRateLimiter("reset-password", 60_000, 3);

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const result = limiter.check(`reset-${ip}`);
    if (!result.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          },
        }
      );
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