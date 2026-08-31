import { NextResponse } from "next/server";
import { envChecklist, OUTBOUND_ENABLED } from "@/lib/env";
import { OUTBOUND_JOB_KINDS } from "@/lib/outbound";

export async function GET() {
  const env = envChecklist();
  return NextResponse.json({
    ok: true,
    OUTBOUND_ENABLED,
    refusedWorkers: OUTBOUND_JOB_KINDS,
    env: {
      DATABASE_URL: env.DATABASE_URL,
      GOOGLE_PLACES_API_KEY: env.GOOGLE_PLACES_API_KEY,
      XAI_API_KEY: env.XAI_API_KEY,
      SESSION_SECRET: env.SESSION_SECRET,
    },
  });
}
