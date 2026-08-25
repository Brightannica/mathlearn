// Render Cron Job entry point
// Pings the web service to prevent cold start on free tier
const https = require("node:https");

const TARGET = process.env.TARGET_URL || "https://mathlearn-wuda.onrender.com/api/health";

function ping() {
  return new Promise((resolve) => {
    const url = new URL(TARGET);
    const req = https.get(url, { timeout: 30000 }, (res) => {
      console.log(`ping ${url.hostname}${url.pathname} → ${res.statusCode}`);
      resolve(res.statusCode || 0);
    });
    req.on("error", (err) => {
      console.log(`ping failed: ${err.message}`);
      resolve(0);
    });
    req.on("timeout", () => {
      console.log("ping timed out");
      req.destroy();
      resolve(0);
    });
  });
}

(async () => {
  const start = Date.now();
  const code = await ping();
  const ms = Date.now() - start;
  console.log(`done in ${ms}ms (status ${code})`);
  process.exit(0);
})();
