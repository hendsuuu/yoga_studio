/**
 * One-time helper to generate a Google OAuth2 refresh token.
 *
 * Usage:
 *   1. cd backup-service
 *   2. npm install
 *   3. node get-token.js
 *   4. Browser opens automatically — sign in & allow access
 *   5. Token is printed in the terminal
 */

const http = require("http");
const { google } = require("googleapis");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "YOUR_CLIENT_SECRET";
const PORT = 3333;
const REDIRECT_URI = `http://localhost:${PORT}`;

if (CLIENT_ID === "YOUR_CLIENT_ID" || CLIENT_SECRET === "YOUR_CLIENT_SECRET") {
  console.error(
    "❌ Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars first.",
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/drive.file"],
});

// Start a temporary local server to catch the OAuth callback
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h2>Akses ditolak.</h2><p>Tutup tab ini dan coba lagi.</p>");
    console.error(`\n❌ Auth error: ${error}`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      "<h2>Berhasil!</h2><p>Refresh token sudah tercetak di terminal. Tutup tab ini.</p>",
    );

    console.log("\n✅ Success! Here is your refresh token:\n");
    console.log("─".repeat(60));
    console.log(tokens.refresh_token);
    console.log("─".repeat(60));
    console.log(
      "\nCopy value di atas ke Railway env var: GOOGLE_REFRESH_TOKEN\n",
    );
  } catch (err) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h2>Gagal</h2><p>" + err.message + "</p>");
    console.error("\n❌ Failed to exchange code:", err.message);
  }

  server.close();
  setTimeout(() => process.exit(0), 500);
});

server.listen(PORT, () => {
  console.log("\n=== NutriKlik Backup — Google Drive Token Generator ===\n");
  console.log(`Local server listening on http://localhost:${PORT}\n`);
  console.log("Buka URL berikut di browser (copy SEMUA, jangan terputus):\n");
  console.log(authUrl);
  console.log("\nLogin dengan akun Google, lalu klik Izinkan/Allow.");
  console.log("Token akan otomatis muncul di sini.\n");
  console.log("Menunggu callback...\n");
});
