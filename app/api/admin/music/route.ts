import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tracks = await prisma.musicTrack.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tracks);
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

  const track = await prisma.musicTrack.create({
    data: {
      title,
      artist,
      duration: duration || "0:00",
      url,
      category,
    },
  });

  return NextResponse.json(track, { status: 201 });
}
