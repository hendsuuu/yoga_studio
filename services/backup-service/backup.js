/**
 * Kelas Yoga Database Backup Service
 *
 * Dumps the PostgreSQL database using pg_dump and uploads the .sql file
 * to Google Drive using OAuth2 (personal account).
 *
 * Intended to run as a Railway cron service at 2:00 AM WIB (19:00 UTC).
 *
 * Required environment variables:
 *   DATABASE_URL              - PostgreSQL connection string
 *   GOOGLE_CLIENT_ID          - OAuth2 Client ID (from Google Cloud Console)
 *   GOOGLE_CLIENT_SECRET      - OAuth2 Client Secret
 *   GOOGLE_REFRESH_TOKEN      - OAuth2 Refresh Token (from get-token.js)
 *   GOOGLE_DRIVE_FOLDER_ID    - Google Drive folder ID to upload backups into
 *   BACKUP_RETENTION_DAYS     - (optional) Delete backups older than N days (default: 30)
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

// ─── Config ─────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || "30", 10);

if (!DATABASE_URL) {
  console.error("❌ Missing DATABASE_URL");
  process.exit(1);
}
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
  console.error(
    "❌ Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN",
  );
  console.error("   Run: node get-token.js to generate a refresh token.");
  process.exit(1);
}
if (!GOOGLE_DRIVE_FOLDER_ID) {
  console.error("❌ Missing GOOGLE_DRIVE_FOLDER_ID");
  process.exit(1);
}

// ─── Google Drive Auth (OAuth2) ─────────────────────────────────────────────

function getGoogleDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  return google.drive({ version: "v3", auth: oauth2Client });
}

// ─── Backup ─────────────────────────────────────────────────────────────────

async function runBackup() {
  const now = new Date();
  // WIB timestamp for filename (UTC+7)
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const timestamp = wib.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `yoga-backup-${timestamp}.sql`;
  const filepath = path.join("/tmp", filename);

  console.log(`🔄 Starting database backup: ${filename}`);
  console.log(`   Time (WIB): ${wib.toISOString()}`);

  // Step 1: pg_dump to plain .sql file
  try {
    // Check pg_dump version first
    const pgVersion = execSync("pg_dump --version", {
      encoding: "utf-8",
    }).trim();
    console.log(`   pg_dump version: ${pgVersion}`);

    execSync(
      `pg_dump "${DATABASE_URL}" --no-owner --no-acl --verbose -f "${filepath}"`,
      {
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 5 * 60 * 1000, // 5 minute timeout
      },
    );

    const stats = fs.statSync(filepath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`✅ Dump completed: ${sizeKB} KB`);

    if (stats.size < 100) {
      console.error(
        "❌ Dump file is suspiciously small (< 100 bytes). Aborting.",
      );
      const content = fs.readFileSync(filepath, "utf-8");
      console.error(`   File content: ${content.slice(0, 500)}`);
      fs.unlinkSync(filepath);
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ pg_dump failed:", err.message);
    if (err.stderr) console.error("   stderr:", err.stderr.toString());
    process.exit(1);
  }

  // Step 2: Upload to Google Drive
  const drive = getGoogleDriveClient();

  try {
    console.log("📤 Uploading to Google Drive...");
    const res = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [GOOGLE_DRIVE_FOLDER_ID],
        mimeType: "application/sql",
      },
      media: {
        mimeType: "application/sql",
        body: fs.createReadStream(filepath),
      },
      fields: "id,name,size",
      supportAllDrives: true,
    });

    const uploadedSizeMB = (
      parseInt(res.data.size || "0") /
      (1024 * 1024)
    ).toFixed(2);
    console.log(
      `✅ Uploaded: ${res.data.name} (${uploadedSizeMB} MB) — ID: ${res.data.id}`,
    );
  } catch (err) {
    console.error("❌ Google Drive upload failed:", err.message);
    // Cleanup local file before exiting
    fs.unlinkSync(filepath);
    process.exit(1);
  }

  // Step 3: Cleanup local file
  fs.unlinkSync(filepath);
  console.log("🧹 Local temp file removed");

  // Step 4: Delete old backups from Google Drive
  if (RETENTION_DAYS > 0) {
    await cleanupOldBackups(drive);
  }

  console.log("🎉 Backup completed successfully!");
}

// ─── Cleanup Old Backups ────────────────────────────────────────────────────

async function cleanupOldBackups(drive) {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
    const cutoffISO = cutoff.toISOString();

    console.log(
      `🗑️  Cleaning up backups older than ${RETENTION_DAYS} days (before ${cutoffISO})`,
    );

    const res = await drive.files.list({
      q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and name contains 'yoga-backup-' and createdTime < '${cutoffISO}' and trashed = false`,
      fields: "files(id,name,createdTime)",
      pageSize: 100,
      supportAllDrives: true,
    });

    const oldFiles = res.data.files || [];
    if (oldFiles.length === 0) {
      console.log("   No old backups to delete.");
      return;
    }

    for (const file of oldFiles) {
      await drive.files.delete({ fileId: file.id, supportAllDrives: true });
      console.log(`   Deleted: ${file.name} (${file.createdTime})`);
    }

    console.log(`✅ Cleaned up ${oldFiles.length} old backup(s)`);
  } catch (err) {
    // Non-fatal — don't exit on cleanup failure
    console.warn("⚠️  Cleanup failed (non-fatal):", err.message);
  }
}

// ─── Run ────────────────────────────────────────────────────────────────────

runBackup().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
