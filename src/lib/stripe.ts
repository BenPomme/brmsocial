import Stripe from "stripe";
import { stripeSecretKey } from "./env";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  const key = stripeSecretKey();
  if (!key) throw new Error("STRIPE_SECRET_KEY is missing");
  if (!cached) cached = new Stripe(key);
  return cached;
}
