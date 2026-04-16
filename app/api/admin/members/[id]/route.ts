import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { memberUpdateSchema } from "@/lib/validators/admin";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = memberUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (
    data.membershipExpiresAt &&
    typeof data.membershipExpiresAt === "string"
  ) {
    data.membershipExpiresAt = new Date(data.membershipExpiresAt as string);
  }

  // Sync aiDailyLimitMax when admin updates aiDailyLimit
  if (typeof data.aiDailyLimit === "number") {
    data.aiDailyLimitMax = data.aiDailyLimit;
  }

  const updated = await prisma.user.update({
    where: { id, role: "MEMBER" },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.user.delete({ where: { id, role: "MEMBER" } });
  return NextResponse.json({ success: true });
}
