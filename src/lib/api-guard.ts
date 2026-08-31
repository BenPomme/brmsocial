import { NextResponse } from "next/server";
import { getSession, type Role, type Session } from "./auth";

export async function requireRole(roles: Role[]): Promise<Session | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  if (!roles.includes(session.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return session;
}

export function isResponse(x: Session | NextResponse): x is NextResponse {
  return x instanceof NextResponse;
}
