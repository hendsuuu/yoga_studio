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
        "Anda adalah AI Personal Trainer Yoga profesional. Buatkan urutan gerakan yoga sesuai waktu dan fokus pengguna. PENTING: Gunakan nama gerakan dalam Bahasa Inggris standar (Downward Dog, Cat-Cow, dll). Dilarang menggunakan istilah 'Pose Mayat', gunakan 'Savasana'.",
    });

    return NextResponse.json({ text });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI service unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
