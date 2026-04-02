import { NextResponse } from "next/server";
import { generateAiContent } from "@/lib/api/ai-service";
import { getMemberSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const session = await getMemberSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { mood } = await req.json();
    if (!mood || typeof mood !== "string") {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    const text = await generateAiContent({
      prompt: `Saya merasa ${mood}`,
      systemInstruction:
        "Berikan panduan meditasi pendek & afirmasi Bahasa Indonesia yang hangat. PENTING: Dilarang menggunakan istilah 'Pose Mayat'.",
    });

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 503 },
    );
  }
}
