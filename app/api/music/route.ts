import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { normalizeAudioUrl } from "@/lib/audio-versioning";

export async function GET() {
  const tracks = await prisma.musicTrack.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const normalizedTracks = await Promise.all(
    tracks.map(async (track) => ({
      ...track,
      url: await normalizeAudioUrl(track.url),
    })),
  );

  return NextResponse.json(normalizedTracks);
}
