import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import {
  createToken,
  clearAdminCookie,
  clearMemberCookie,
  setMemberCookie,
  setAdminCookie,
} from "@/lib/auth/session";
import { loginSchema } from "@/lib/validators/auth";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn("auth/login", "Validation failed", {
        errors: parsed.error.errors,
      });
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      logger.warn("auth/login", "User not found", { email: normalizedEmail });
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      logger.warn("auth/login", "Invalid password", {
        email: normalizedEmail,
      });
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 },
      );
    }

    if (!user.isActive) {
      logger.warn("auth/login", "Inactive account attempt", {
        email: normalizedEmail,
      });
      return NextResponse.json(
        { error: "Akun tidak aktif. Hubungi admin." },
        { status: 403 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(clearMemberCookie());
    cookieStore.set(clearAdminCookie());

    if (user.role === "ADMIN") {
      const token = await createToken({ id: user.id, role: "admin" });
      cookieStore.set(setAdminCookie(token));
      logger.info("auth/login", "Admin login success", {
        email: normalizedEmail,
      });
      return NextResponse.json({ success: true, role: "admin" });
    }

    const token = await createToken({ id: user.id, role: "member" });
    cookieStore.set(setMemberCookie(token));
    logger.info("auth/login", "Member login success", {
      email: normalizedEmail,
    });
    return NextResponse.json({ success: true, role: "member" });
  } catch (err) {
    logger.error("auth/login", "Login error", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
