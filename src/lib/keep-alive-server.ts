// Self-keep-alive: runs inside the Next.js server process.
// Pings the health endpoint every 5 minutes to prevent Render free-tier spin-down.
// This only works once the service is already running — the *first* cold start
// still needs an external trigger, which is handled by the GitHub Actions cron
// and the client-side ColdStartWatchdog.

const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const HEALTH_PATH = "/api/health";
const SELF_URL =
  process.env.NEXTAUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  "http://localhost:3000";

type KeepAliveState = { timer: ReturnType<typeof setTimeout> | null };
const state: KeepAliveState = { timer: null };

function startKeepAlive() {
  if (typeof window !== "undefined") return; // server-only
  if (state.timer) return; // already running

  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) return;

  const url = `${SELF_URL.replace(/\/$/, "")}${HEALTH_PATH}`;

  const ping = () => {
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 30000);
      fetch(url, { signal: ctrl.signal, cache: "no-store" })
        .then((r) => {
          clearTimeout(timeout);
          if (r.ok) {
            console.log(`[keep-alive] ping ok ${r.status}`);
          }
        })
        .catch(() => {
          clearTimeout(timeout);
        });
    } catch {
      // ignore
    }
  };

  // First ping after 2 minutes, then every 5 minutes
  const initialTimer = setTimeout(() => {
    ping();
    state.timer = setInterval(ping, PING_INTERVAL_MS) as unknown as ReturnType<typeof setTimeout>;
  }, 2 * 60 * 1000);

  state.timer = initialTimer;
}

startKeepAlive();
