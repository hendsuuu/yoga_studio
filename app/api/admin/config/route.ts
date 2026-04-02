import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { appConfigSchema } from "@/lib/validators/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const configs = await prisma.appConfig.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json(configs);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = appConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  const config = await prisma.appConfig.upsert({
    where: { key: parsed.data.key },
    update: { value: parsed.data.value },
    create: parsed.data,
  });
  return NextResponse.json(config);
}
