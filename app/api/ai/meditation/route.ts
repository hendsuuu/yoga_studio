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

    const { mood } = await req.json();
    if (!mood || typeof mood !== "string") {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    const text = await generateAiContent({
      prompt: `
      Pengguna sedang merasa ${mood}.

      Berikan panduan meditasi singkat yang menenangkan, lalu tutup dengan afirmasi positif.

      Gunakan Bahasa Indonesia yang hangat, lembut, dan terasa natural (tidak kaku atau terlalu formal).

      Struktur:
      - Meditasi: 2–3 kalimat pendek berisi panduan napas atau menenangkan diri.
      - Afirmasi: 1–2 kalimat positif yang sederhana dan mudah dirasakan.

      Jangan bertele-tele, hindari bahasa yang terlalu puitis atau panjang.
      Pastikan jawabannya ringkas dan nyaman dibaca.
      Total maksimal sekitar 80–100 kata.

      Catatan:
      Jangan gunakan istilah "Pose Mayat".
      `,
      systemInstruction: `
      Anda adalah pemandu meditasi yang hangat dan suportif.
      Gunakan bahasa yang terasa seperti berbicara langsung ke pengguna, natural, tidak kaku, dan menenangkan.
      Fokus pada kesederhanaan dan kejelasan.

      Tugas Anda hanya membantu dalam topik yang masih berhubungan dengan yoga, termasuk:
      - pose / asana
      - breathing / pranayama
      - meditasi
      - stretching
      - alignment
      - rutinitas latihan
      - relaksasi
      - manfaat yoga
      - tips latihan yoga yang aman

      Aturan penting:
      - Jika pertanyaan pengguna masih terkait yoga, jawab dengan Bahasa Indonesia yang natural, ringkas, dan jelas.
      - Jika pertanyaan TIDAK terkait yoga, jangan jawab isi pertanyaannya.
      - Untuk pertanyaan di luar yoga, balas singkat dan sopan dengan kalimat seperti:
        "Maaf, saya hanya bisa membantu untuk topik seputar yoga, meditasi, pernapasan, dan relaksasi."
      - Jangan mencoba menebak atau tetap menjawab topik lain.
      - Jika menyebut nama pose, gunakan nama gerakan dalam Bahasa Inggris standar.
      - Jangan gunakan istilah "Pose Mayat"; gunakan "Savasana".
      `,
    });

    await logAiUsage(session.id, "meditation", mood);
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
