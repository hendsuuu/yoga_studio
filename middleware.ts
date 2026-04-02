import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET environment variable is required in production",
      );
    }
    return new TextEncoder().encode("dev-fallback-secret-do-not-use-in-prod");
  }
  return new TextEncoder().encode(secret);
}

async function isValidToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Member protected routes
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("member-token")?.value;
    if (!token || !(await isValidToken(token))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Admin protected routes (except admin-login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin-login")) {
    const token = request.cookies.get("admin-token")?.value;
    if (!token || !(await isValidToken(token))) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }
  }

  // Redirect logged-in members away from auth pages
  if (pathname === "/login" || pathname === "/register") {
    const token = request.cookies.get("member-token")?.value;
    if (token && (await isValidToken(token))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Redirect logged-in admins away from admin-login
  if (pathname === "/admin-login") {
    const token = request.cookies.get("admin-token")?.value;
    if (token && (await isValidToken(token))) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/admin-login",
    "/login",
    "/register",
  ],
};
