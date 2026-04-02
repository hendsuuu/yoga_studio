import { NextResponse } from "next/server";
import { generateAiContent } from "@/lib/api/ai-service";
import { getMemberSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const session = await getMemberSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const text = await generateAiContent({
      prompt: query,
      systemInstruction:
        "Berikan edukasi yoga profesional dalam Bahasa Indonesia. PENTING: Gunakan nama gerakan dalam Bahasa Inggris standar (Downward Dog, Cat-Cow, dll). Dilarang menggunakan istilah 'Pose Mayat'.",
    });

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 503 },
    );
  }
}
