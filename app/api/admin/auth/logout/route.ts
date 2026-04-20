import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAdminCookie, clearMemberCookie } from "@/lib/auth/session";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(clearMemberCookie());
  cookieStore.set(clearAdminCookie());
  return NextResponse.json({ success: true });
}
