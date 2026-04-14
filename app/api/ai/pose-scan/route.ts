import { NextResponse } from "next/server";
import { generateAiContent } from "@/lib/api/ai-service";
import { getMemberSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const session = await getMemberSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { imageData } = await req.json();
    if (!imageData || typeof imageData !== "string") {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // Basic validation: check it looks like base64
    if (imageData.length > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large" }, { status: 400 });
    }

    const text = await generateAiContent({
      prompt: `
      Analisis pose yoga dari gambar ini.

      Tugas:
      - Identifikasi pose yang paling mungkin.
      - Berikan analisis alignment dalam tepat 3 bagian.
      - Fokus pada evaluasi visual dari pose pada gambar.
      - Jika pose tidak sepenuhnya jelas, sebutkan "kemungkinan pose".

      Aturan:
      - Gunakan Bahasa Indonesia.
      - Nama pose wajib dalam Bahasa Inggris standar.
      - Jangan gunakan istilah "Pose Mayat"; gunakan "Savasana".
      - Jawaban harus compact, jelas, dan profesional.
      - Hindari penjelasan panjang, teori umum, atau pengantar.

      Format output:
      1. Pose: [nama pose]
      2. Yang sudah baik: [1-2 kalimat singkat]
      3. Yang perlu diperbaiki: [1-2 kalimat singkat]
      4. Saran aman: [1 kalimat singkat]

      Batas:
      - Total maksimal 100-120 kata.
      - Tiap bagian singkat dan langsung ke inti.
      `,
      systemInstruction: `
      Anda adalah instruktur yoga profesional yang ahli dalam alignment.
      Berikan analisis teknis yang ringkas, akurat, mudah dipahami, dan langsung praktis.
      Jangan bertele-tele. Jangan mengulang isi. Jangan menambahkan disclaimer panjang.
      `,
      imageData,
    });

    return NextResponse.json({ text });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI service unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
