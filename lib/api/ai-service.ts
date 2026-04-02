interface AiRequest {
  prompt: string;
  systemInstruction: string;
  imageData?: string;
}

export async function generateAiContent({
  prompt,
  systemInstruction,
  imageData,
}: AiRequest): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const parts: Record<string, unknown>[] = [{ text: prompt }];
  if (imageData) {
    parts.push({
      inlineData: { mimeType: "image/png", data: imageData },
    });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
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
    throw new Error(`AI API error: ${res.status}`);
  }

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || "";
}
