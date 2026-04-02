import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { recordingSchema } from "@/lib/validators/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const recordings = await prisma.recording.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(recordings);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = recordingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  const { date, ...rest } = parsed.data;
  const recording = await prisma.recording.create({
    data: { ...rest, date: new Date(date) },
  });
  return NextResponse.json(recording, { status: 201 });
}
