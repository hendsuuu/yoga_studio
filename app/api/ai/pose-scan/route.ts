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
      prompt:
        "Analisis alignment pose yoga dalam 3 bagian. PENTING: Gunakan nama pose Inggris standar. Dilarang menggunakan istilah 'Pose Mayat'.",
      systemInstruction:
        "Berikan analisis teknis alignment yoga profesional Bahasa Indonesia.",
      imageData,
    });

    return NextResponse.json({ text });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI service unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
