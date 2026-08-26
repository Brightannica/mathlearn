// Simple in-memory rate limiter for API routes
// Tracks requests per IP with sliding window

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60_000, maxRequests: number = 60) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetAt) {
      this.limits.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequests - 1, resetAt: now + this.windowMs };
    }

    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    return { allowed: true, remaining: this.maxRequests - entry.count, resetAt: entry.resetAt };
  }

  reset(key: string): void {
    this.limits.delete(key);
  }
}

const globalForRL = globalThis as unknown as { __rateLimiters?: Map<string, RateLimiter> };
const limiters = globalForRL.__rateLimiters ?? new Map<string, RateLimiter>();
if (process.env.NODE_ENV !== "production") {
  globalForRL.__rateLimiters = limiters;
}

export function getRateLimiter(name: string, windowMs: number, maxRequests: number): RateLimiter {
  const key = `${name}-${windowMs}-${maxRequests}`;
  if (!limiters.has(key)) {
    limiters.set(key, new RateLimiter(windowMs, maxRequests));
  }
  return limiters.get(key)!;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "anonymous";
}

export function rateLimitResponse(remaining: number, resetAt: number): Response {
  return new Response(
    JSON.stringify({ error: "rate limit exceeded", resetAt }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(Math.floor(resetAt / 1000)),
        "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
      },
    }
  );
}

export function withRateLimit(
  name: string,
  windowMs: number,
  maxRequests: number,
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    const ip = getClientIp(request);
    const limiter = getRateLimiter(name, windowMs, maxRequests);
    const result = limiter.check(`${name}-${ip}`);
    if (!result.allowed) {
      return rateLimitResponse(result.remaining, result.resetAt);
    }
    return handler(request);
  };
}
