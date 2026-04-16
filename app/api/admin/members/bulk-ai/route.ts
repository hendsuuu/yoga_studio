import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAdminSession } from "@/lib/auth/session";

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { aiDailyLimit } = body;

  if (typeof aiDailyLimit !== "number" || aiDailyLimit < 0) {
    return NextResponse.json(
      { error: "aiDailyLimit harus berupa angka positif" },
      { status: 400 },
    );
  }

  const result = await prisma.user.updateMany({
    where: { role: "MEMBER" },
    data: { aiDailyLimit },
  });

  return NextResponse.json({ updated: result.count });
}
