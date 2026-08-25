import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const csrfTokens = new Map<string, number>();
const isProduction = process.env.NODE_ENV === "production";

function getRateLimitKey(ip: string, route: string): string {
  return `${ip}:${route}`;
}

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

function cleanupRateLimitEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

function generateCSRFToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

function setCSRFCookie(response: NextResponse): void {
  const token = generateCSRFToken();
  const expiresAt = Date.now() + 86400 * 1000;
  csrfTokens.set(token, expiresAt);

  const cookie = `mathlearn-csrf-token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${isProduction ? "; Secure" : ""}`;
  response.headers.set("Set-Cookie", cookie);
}

function cleanupExpiredCSRFTokens(): void {
  const now = Date.now();
  for (const [token, expiry] of csrfTokens.entries()) {
    if (now > expiry) {
      csrfTokens.delete(token);
    }
  }
}

setInterval(cleanupRateLimitEntries, 5 * 60 * 1000);
setInterval(cleanupExpiredCSRFTokens, 5 * 60 * 1000);

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function validateCSRF(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const expectedOrigin = `${request.nextUrl.protocol}//${host}`;

  if (origin === expectedOrigin) {
    return true;
  }

  const csrfToken = request.headers.get("x-next-csrf");
  if (!csrfToken) {
    return false;
  }

  const expiry = csrfTokens.get(csrfToken);
  if (!expiry || Date.now() > expiry) {
    if (expiry) {
      csrfTokens.delete(csrfToken);
    }
    return false;
  }

  csrfTokens.delete(csrfToken);
  return true;
}

const publicPaths = ["/auth/signin", "/auth/signup", "/auth/reset-password", "/auth/callback", "/auth/error", "/_next", "/favicon.svg", "/og-image.svg", "/icon-192x192.svg", "/icon-512x512.svg"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);
  const method = request.method;

  if (pathname === "/" && method === "GET") {
    const session = await getSession();
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
    const response = NextResponse.next();
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    setCSRFCookie(response);
    return response;
  }

  if (!pathname.startsWith("/api")) {
    const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
    
    if (!isPublicPath) {
      const session = await getSession();
      if (!session) {
        return NextResponse.redirect(new URL("/auth/signin", request.url));
      }
    }
    
    return NextResponse.next();
  }

  const isAuthRoute = pathname.startsWith("/api/auth");

  if (!isAuthRoute && (method === "POST" || method === "PATCH" || method === "DELETE")) {
    if (!validateCSRF(request)) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }
  }

  let limit = 100;
  const windowMs = 15 * 60 * 1000;

  if (isAuthRoute) {
    limit = 5;
  } else if (method === "POST" || method === "PATCH" || method === "DELETE") {
    if (
      pathname.startsWith("/api/community/") ||
      pathname.startsWith("/api/progress") ||
      pathname.match(/^\/api\/exercises\/.*\/attempts/)
    ) {
      limit = 30;
    }
  }

  const rateLimitKey = getRateLimitKey(ip, pathname);
  if (!checkRateLimit(rateLimitKey, limit, windowMs)) {
    const entry = rateLimitMap.get(rateLimitKey);
    const retryAfter = entry ? Math.ceil((entry.resetAt - Date.now()) / 1000) : 60;

    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/", "/((?!_next/static|_next/image|images|public).*)"],
};
