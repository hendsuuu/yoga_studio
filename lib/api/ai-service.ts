import { GoogleGenAI } from "@google/genai";

interface AiRequest {
  prompt: string;
  systemInstruction: string;
  imageData?: string;
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export type AiErrorCode =
  | "AI_NOT_CONFIGURED"
  | "AI_RATE_LIMITED"
  | "AI_OVERLOADED"
  | "AI_EMPTY_RESPONSE"
  | "AI_CONTENT_BLOCKED"
  | "AI_UNAVAILABLE";

export class AiServiceError extends Error {
  code: AiErrorCode;
  userMessage: string;

  constructor(
    code: AiErrorCode,
    userMessage: string,
    technicalDetail?: string,
  ) {
    super(technicalDetail || userMessage);
    this.code = code;
    this.userMessage = userMessage;
  }
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-gemini-api-key") {
    throw new AiServiceError(
      "AI_NOT_CONFIGURED",
      "Fitur AI belum tersedia saat ini. Silakan hubungi admin.",
      "GEMINI_API_KEY is not configured",
    );
  }
  return new GoogleGenAI({ apiKey });
}

export async function generateAiContent({
  prompt,
  systemInstruction,
  imageData,
}: AiRequest): Promise<string> {
  const ai = getClient();

  const contents: Array<
    { text: string } | { inlineData: { mimeType: string; data: string } }
  > = [{ text: prompt }];

  if (imageData) {
    contents.push({
      inlineData: { mimeType: "image/png", data: imageData },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
      },
    });

    const text = response.text;
    if (!text) {
      console.error(
        "Gemini returned no text:",
        JSON.stringify(response).slice(0, 500),
      );
      throw new AiServiceError(
        "AI_EMPTY_RESPONSE",
        "AI tidak dapat memberikan jawaban saat ini. Silakan coba lagi.",
        "Gemini returned empty response",
      );
    }
    return text;
  } catch (err) {
    if (err instanceof AiServiceError) throw err;

    const error = err as { status?: number; message?: string; code?: string };
    const status = error.status;
    const message = error.message || "";

    console.error(`Gemini SDK error [${status}]: ${message}`);

    if (status === 429) {
      throw new AiServiceError(
        "AI_RATE_LIMITED",
        "Layanan AI sedang ramai. Silakan tunggu beberapa saat dan coba lagi.",
        `Rate limited: ${message}`,
      );
    }

    if (status === 503 || status === 500) {
      throw new AiServiceError(
        "AI_OVERLOADED",
        "Server AI sedang dalam pemeliharaan. Silakan coba beberapa menit lagi.",
        `Server error ${status}: ${message}`,
      );
    }

    if (
      message.includes("SAFETY") ||
      message.includes("blocked") ||
      message.includes("RECITATION")
    ) {
      throw new AiServiceError(
        "AI_CONTENT_BLOCKED",
        "Permintaan tidak dapat diproses. Coba ubah pertanyaan Anda.",
        `Content blocked: ${message}`,
      );
    }

    throw new AiServiceError(
      "AI_UNAVAILABLE",
      "Fitur AI sedang tidak tersedia. Silakan coba lagi nanti.",
      `Unexpected error: ${message}`,
    );
  }
}
