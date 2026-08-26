// Service worker for mathitout static site
// Intercepts navigation to the main app and shows warmup if needed

const APP_ORIGIN = "https://mathlearn-wuda.onrender.com";
const HEALTH_PATH = "/api/health";
const WARMUP_URL = "/";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle navigation requests to the main app
  if (url.origin === APP_ORIGIN && event.request.mode === "navigate") {
    event.respondWith(handleAppNavigation(event.request));
    return;
  }

  // For everything else, pass through
  event.respondWith(fetch(event.request));
});

async function handleAppNavigation(request) {
  try {
    // Try the navigation with a short timeout
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 10000);
    const response = await fetch(request, { signal: ctrl.signal });
    clearTimeout(timeout);

    if (response.ok) return response;

    // If the main app returned an error, serve the warmup page
    return Response.redirect(WARMUP_URL, 302);
  } catch (e) {
    // Network error or timeout — redirect to warmup
    return Response.redirect(WARMUP_URL, 302);
  }
}
