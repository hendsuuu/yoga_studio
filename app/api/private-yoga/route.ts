import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const sessions = await prisma.privateYoga.findMany({
    where: { isActive: true },
    include: { coach: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(sessions);
}
