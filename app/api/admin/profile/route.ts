import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { adminProfileUpdateSchema } from "@/lib/validators/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
    },
  });

  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(admin);
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = adminProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  const admin = await prisma.user.findFirst({
    where: { id: session.id, role: "ADMIN" },
  });
  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { fullName, email, phone, currentPassword, newPassword } = parsed.data;
  const data: Record<string, unknown> = {};

  if (fullName) data.fullName = fullName;
  if (typeof phone === "string") data.phone = phone;
  if (email) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findFirst({
      where: { email: normalizedEmail, NOT: { id: admin.id } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah digunakan" },
        { status: 400 },
      );
    }
    data.email = normalizedEmail;
  }

  if (newPassword) {
    const valid = await verifyPassword(currentPassword || "", admin.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Password lama tidak sesuai" },
        { status: 400 },
      );
    }
    data.passwordHash = await hashPassword(newPassword);
  }

  const updated = await prisma.user.update({
    where: { id: admin.id },
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Akun admin sendiri tidak bisa dihapus" },
    { status: 405 },
  );
}
