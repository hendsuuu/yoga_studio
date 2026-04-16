import { NextResponse } from "next/server";
import { generateAiContent } from "@/lib/api/ai-service";
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

    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const text = await generateAiContent({
      prompt: `
      Pertanyaan pengguna:
      "${query}"

      Jawab pertanyaan ini sebagai edukasi yoga yang jelas, hangat, dan mudah dipahami.

      Gunakan Bahasa Indonesia yang natural, tidak terlalu formal, dan tidak bertele-tele.
      Jika menyebut pose, gunakan nama gerakan dalam Bahasa Inggris standar seperti Downward Dog, Cat-Cow, Child’s Pose, dan Savasana.
      Jangan gunakan istilah "Pose Mayat".

      Buat jawaban tetap ringkas namun tetap informatif.
      Kalau perlu, jelaskan dengan langkah sederhana atau poin singkat yang mudah dipraktikkan.
      Hindari penjelasan yang terlalu teknis kecuali memang dibutuhkan oleh pertanyaan pengguna.
      `,
      systemInstruction: `
      Anda adalah instruktur yoga profesional yang komunikatif dan suportif.
      Jawab dengan gaya yang natural, ringkas, dan edukatif, seperti sedang menjelaskan langsung kepada pengguna.
      Utamakan kejelasan, kenyamanan dibaca, dan manfaat praktis.

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

    await logAiUsage(session.id, "library", query);
    return NextResponse.json({ text });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI service unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
