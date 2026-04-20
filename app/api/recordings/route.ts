import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/auth/session";

function normalizeRecordingDate(rawDate: string | null) {
  if (!rawDate) {
    return "";
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : "";
}

function createRecordingDateRange(date: string) {
  return {
    gte: new Date(`${date}T00:00:00.000Z`),
    lte: new Date(`${date}T23:59:59.999Z`),
  };
}

export async function GET(req: Request) {
  const session = await getMemberSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const recordingDate = normalizeRecordingDate(searchParams.get("date"));

  const recordings = await prisma.recording.findMany({
    where: {
      isPublished: true,
      ...(query
        ? {
            title: {
              contains: query,
              mode: "insensitive",
            },
          }
        : {}),
      ...(recordingDate
        ? { date: createRecordingDateRange(recordingDate) }
        : {}),
    },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(recordings, {
    headers: { "Cache-Control": "no-store" },
  });
}
