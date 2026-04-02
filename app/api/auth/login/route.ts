import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createToken, setMemberCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validators/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const member = await prisma.member.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, member.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 },
      );
    }

    if (!member.isActive) {
      return NextResponse.json(
        { error: "Akun tidak aktif. Hubungi admin." },
        { status: 403 },
      );
    }

    const token = await createToken({ id: member.id, role: "member" });
    const cookieStore = await cookies();
    cookieStore.set(setMemberCookie(token));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
