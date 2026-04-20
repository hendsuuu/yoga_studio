import { NextResponse } from "next/server";

import { getCurrentMemberSession } from "@/lib/auth/member-session";

export async function GET() {
  const member = await getCurrentMemberSession();

  if (!member) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json(member, {
    headers: { "Cache-Control": "no-store" },
  });
}
