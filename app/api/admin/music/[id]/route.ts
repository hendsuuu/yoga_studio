import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { normalizeAudioUrl } from "@/lib/audio-versioning";

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

  return NextResponse.json({
    ...updated,
    url: normalizedUrl,
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

  await prisma.musicTrack.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
