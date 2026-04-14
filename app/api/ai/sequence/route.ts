import { NextResponse } from "next/server";
import { generateAiContent } from "@/lib/api/ai-service";
import { getMemberSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const session = await getMemberSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { duration, focus } = await req.json();
    if (!focus || typeof focus !== "string") {
      return NextResponse.json({ error: "Focus is required" }, { status: 400 });
    }

    const text = await generateAiContent({
      prompt: `Waktu: ${duration || "15"} menit, Fokus: ${focus}`,
      systemInstruction:
                 `Anda adalah AI Personal Trainer Yoga profesional.
                Tugas:
                Buatkan urutan gerakan yoga berdasarkan waktu dan fokus pengguna.

                ATURAN OUTPUT:
                - Gunakan Bahasa Indonesia.
                - Nama pose WAJIB dalam Bahasa Inggris (contoh: Downward Dog, Cat-Cow, Child’s Pose, Savasana).
                - Maksimal 6–8 langkah saja.
                - Setiap langkah hanya 1 kalimat singkat (maks 15 kata).
                - Sertakan durasi singkat tiap pose (contoh: 1–2 menit).
                - Hindari penjelasan panjang atau teori.
                - Format sebagai list bernomor.

                Contoh format:
                1. Cat-Cow (2 menit): Gerakan pemanasan untuk fleksibilitas tulang belakang.
                2. Downward Dog (2 menit): Peregangan seluruh tubuh dan bahu.
                ...

                Tujuan: Jawaban harus ringkas, padat, mudah dibaca, dan langsung bisa dipraktikkan.
                `,
    });

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 503 },
    );
  }
}
