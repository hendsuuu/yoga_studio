interface AiRequest {
  prompt: string;
  systemInstruction: string;
  imageData?: string;
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function generateAiContent({
  prompt,
  systemInstruction,
  imageData,
}: AiRequest): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-gemini-api-key")
    throw new Error("GEMINI_API_KEY is not configured");

  const parts: Record<string, unknown>[] = [{ text: prompt }];
  if (imageData) {
    parts.push({
      inlineData: { mimeType: "image/png", data: imageData },
    });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
      }),
    },
  );

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    console.error(`Gemini API error ${res.status}: ${errorBody}`);
    throw new Error(`AI API error: ${res.status}`);
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error(
      "Gemini returned no text:",
      JSON.stringify(json).slice(0, 500),
    );
    throw new Error("AI returned empty response");
  }
  return text;
}
