import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { normalizeAudioUrl } from "@/lib/audio-versioning";

export async function GET() {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tracks = await prisma.musicTrack.findMany({
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

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, artist, duration, url, category } = body;

  if (!title || !artist || !url || !category) {
    return NextResponse.json(
      { error: "Field title, artist, url, dan category wajib diisi" },
      { status: 400 },
    );
  }

  const normalizedUrl = await normalizeAudioUrl(url);

  const track = await prisma.musicTrack.create({
    data: {
      title,
      artist,
      duration: duration || "0:00",
      url: normalizedUrl,
      category,
    },
  });

  return NextResponse.json(
    {
      ...track,
      url: normalizedUrl,
    },
    { status: 201 },
  );
}
