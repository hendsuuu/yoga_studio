import { NextResponse } from "next/server";
import { generateAiContent, AiServiceError } from "@/lib/api/ai-service";
import { getMemberSession } from "@/lib/auth/session";
import { checkAiLimit, logAiUsage } from "@/lib/api/ai-limit";

export async function POST(req: Request) {
  try {
    const session = await getMemberSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { allowed, used, limit } = await checkAiLimit(session.id);
    if (!allowed) {
      return NextResponse.json(
        {
          error: `Batas AI harian tercapai (${used}/${limit}). Coba lagi besok.`,
        },
        { status: 429 },
      );
    }

    const { duration, focus } = await req.json();
    if (!focus || typeof focus !== "string") {
      return NextResponse.json({ error: "Focus is required" }, { status: 400 });
    }

    const text = await generateAiContent({
      prompt: `Waktu: ${duration || "15"} menit, Fokus: ${focus}`,
      systemInstruction: `Anda adalah AI Personal Trainer Yoga profesional.
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

    await logAiUsage(session.id, "sequence", focus);
    return NextResponse.json({ text });
  } catch (err) {
    if (err instanceof AiServiceError) {
      const status = err.code === "AI_RATE_LIMITED" ? 429 : 503;
      return NextResponse.json({ error: err.userMessage }, { status });
    }
    return NextResponse.json(
      { error: "Fitur AI sedang tidak tersedia. Silakan coba lagi nanti." },
      { status: 503 },
    );
  }
}
