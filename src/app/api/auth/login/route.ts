import { NextResponse } from "next/server";
import { homeForRole, loginWithPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string };
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }
  const session = await loginWithPassword(email, password);
  if (!session) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, role: session.role, home: homeForRole(session.role) });
}
