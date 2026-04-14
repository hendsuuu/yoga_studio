import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const AUDIO_DIR =
  process.env.AUDIO_DIR || path.join(process.cwd(), "public", "audio");

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "File tidak ditemukan" },
      { status: 400 },
    );
  }

  if (!file.type.startsWith("audio/")) {
    return NextResponse.json(
      { error: "Hanya file audio yang diizinkan" },
      { status: 400 },
    );
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Ukuran file maksimal 50MB" },
      { status: 400 },
    );
  }

  const ext = path.extname(file.name) || ".mp3";
  const safeName = `${randomUUID()}${ext}`;

  await mkdir(AUDIO_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(AUDIO_DIR, safeName), buffer);

  return NextResponse.json({ url: `/api/audio/${safeName}` });
}
