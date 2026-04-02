import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getMemberSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const recordings = await prisma.recording.findMany({
    where: { isPublished: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(recordings);
}
