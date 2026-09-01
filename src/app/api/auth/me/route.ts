import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { envChecklist, OUTBOUND_ENABLED } from "@/lib/env";

export async function GET() {
  const session = await getSession();
  const env = envChecklist();
  return NextResponse.json({
    session,
    flags: {
      OUTBOUND_ENABLED,
      placesKey: env.GOOGLE_PLACES_API_KEY,
      dataforseo: env.DATAFORSEO_LOGIN && env.DATAFORSEO_PASSWORD,
      xaiKey: env.XAI_API_KEY,
      stripe: env.STRIPE_SECRET_KEY,
      stripeMode: env.stripeMode,
    },
  });
}
