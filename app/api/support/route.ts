import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configs = await prisma.appConfig.findMany({
    where: {
      key: { in: ["wa_admin", "email_admin"] },
    },
  });

  const result: Record<string, string> = {};
  for (const c of configs) {
    result[c.key] = c.value;
  }

  return NextResponse.json(result);
}
