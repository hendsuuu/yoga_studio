import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import {
  clearAdminCookie,
  clearMemberCookie,
  createToken,
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
      logger.warn("admin/auth/login", "Validation failed", {
        errors: parsed.error.errors,
      });
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const admin = await prisma.user.findFirst({
      where: { email: email.toLowerCase().trim(), role: "ADMIN" },
    });

    if (!admin) {
      logger.warn("admin/auth/login", "Admin not found", { email });
      return NextResponse.json({ error: "Kredensial salah" }, { status: 401 });
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      logger.warn("admin/auth/login", "Invalid password", { email });
      return NextResponse.json({ error: "Kredensial salah" }, { status: 401 });
    }

    const token = await createToken({ id: admin.id, role: "admin" });
    const cookieStore = await cookies();
    cookieStore.set(clearMemberCookie());
    cookieStore.set(clearAdminCookie());
    cookieStore.set(setAdminCookie(token));

    logger.info("admin/auth/login", "Admin login success", { email });
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("admin/auth/login", "Login error", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
