import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { announcementSchema } from "@/lib/validators/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(announcements);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (data.startAt && typeof data.startAt === "string")
    data.startAt = new Date(data.startAt as string);
  if (data.endAt && typeof data.endAt === "string")
    data.endAt = new Date(data.endAt as string);

  const announcement = await prisma.announcement.create({ data: data as any });
  return NextResponse.json(announcement, { status: 201 });
}
