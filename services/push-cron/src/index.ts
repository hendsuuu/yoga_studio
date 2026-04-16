import "dotenv/config";
import cron from "node-cron";

const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "0 6 * * *"; // daily at 06:00 WIB (UTC+7 = 23:00 UTC prev day)
const APP_URL = process.env.APP_URL;
const CRON_SECRET = process.env.CRON_SECRET;

if (!APP_URL) {
  console.error("[push-cron] ERROR: APP_URL is required");
  process.exit(1);
}
if (!CRON_SECRET) {
  console.error("[push-cron] ERROR: CRON_SECRET is required");
  process.exit(1);
}

console.log(`[push-cron] Starting push notification cron service...`);
console.log(`[push-cron] Schedule: ${CRON_SCHEDULE}`);
console.log(`[push-cron] App URL: ${APP_URL}`);
console.log(`[push-cron] Time: ${new Date().toISOString()}`);

async function triggerPushSend() {
  const url = `${APP_URL}/api/push/send`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    const data = (await res.json()) as {
      sent?: number;
      failed?: number;
      error?: string;
    };

    if (!res.ok) {
      console.error(`[push-cron] Request failed ${res.status}: ${data.error}`);
      return;
    }

    console.log(
      `[push-cron] Done at ${new Date().toISOString()} — sent: ${data.sent}, failed: ${data.failed}`,
    );
  } catch (err) {
    console.error(`[push-cron] Network error calling ${url}:`, err);
  }
}

// Run immediately on startup
triggerPushSend();

// Schedule recurring job
cron.schedule(CRON_SCHEDULE, () => {
  console.log(`[push-cron] Running at ${new Date().toISOString()}`);
  triggerPushSend();
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[push-cron] Received SIGTERM, shutting down...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[push-cron] Received SIGINT, shutting down...");
  process.exit(0);
});
