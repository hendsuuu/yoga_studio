import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  deleteInternalAudioFile,
  extractAudioFilenameFromUrl,
  normalizeAudioUrl,
} from "@/lib/audio-versioning";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.musicTrack.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const normalizedUrl = body.url
    ? await normalizeAudioUrl(body.url)
    : existing.url;
  const previousAudioFilename = extractAudioFilenameFromUrl(existing.url);
  const nextAudioFilename = extractAudioFilenameFromUrl(normalizedUrl);

  const updated = await prisma.musicTrack.update({
    where: { id },
    data: {
      title: body.title ?? existing.title,
      artist: body.artist ?? existing.artist,
      duration: body.duration ?? existing.duration,
      url: normalizedUrl,
      category: body.category ?? existing.category,
    },
  });

  let deletedReplacedAudioFile = false;

  if (
    previousAudioFilename &&
    previousAudioFilename !== nextAudioFilename
  ) {
    const otherTracks = await prisma.musicTrack.findMany({
      where: { id: { not: id } },
      select: { url: true },
    });

    const isStillReferenced = otherTracks.some(
      (track) =>
        extractAudioFilenameFromUrl(track.url) === previousAudioFilename,
    );

    if (!isStillReferenced) {
      deletedReplacedAudioFile =
        await deleteInternalAudioFile(previousAudioFilename);
    }
  }

  return NextResponse.json({
    ...updated,
    url: normalizedUrl,
    deletedReplacedAudioFile,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.musicTrack.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const audioFilename = extractAudioFilenameFromUrl(existing.url);
  let deletedAudioFile = false;

  if (audioFilename) {
    const otherTracks = await prisma.musicTrack.findMany({
      where: { id: { not: id } },
      select: { url: true },
    });

    const isStillReferenced = otherTracks.some(
      (track) => extractAudioFilenameFromUrl(track.url) === audioFilename,
    );

    await prisma.musicTrack.delete({ where: { id } });

    if (!isStillReferenced) {
      deletedAudioFile = await deleteInternalAudioFile(audioFilename);
    }

    return NextResponse.json({ success: true, deletedAudioFile });
  }

  await prisma.musicTrack.delete({ where: { id } });
  return NextResponse.json({ success: true, deletedAudioFile: false });
}
