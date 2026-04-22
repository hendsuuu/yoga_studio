import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { createVersionedAudioFilename } from "@/lib/audio-versioning";
import {
  buildManagedAudioUrl,
  isSupabaseAudioStorageConfigError,
  uploadAudioToSupabase,
} from "@/lib/audio-storage";

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

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = createVersionedAudioFilename(file.name, buffer);

  try {
    await uploadAudioToSupabase({
      filename: safeName,
      buffer,
      contentType: file.type || "application/octet-stream",
    });
  } catch (error) {
    const message = isSupabaseAudioStorageConfigError(error)
      ? "Supabase storage audio belum dikonfigurasi"
      : error instanceof Error
        ? error.message
        : "Gagal mengupload audio";

    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ url: buildManagedAudioUrl(safeName) });
}
