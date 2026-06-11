import { env } from "@saas/config/env";
import { stripeAdapter } from "./stripe";
import { paddleAdapter } from "./paddle";
import type { BillingAdapter } from "./adapter";

/**
 * Returns the active billing adapter based on BILLING_PROVIDER env var.
 * Swapping providers requires only changing .env — no code changes.
 */
export function getBillingAdapter(): BillingAdapter {
  switch (env.BILLING_PROVIDER) {
    case "stripe":
      return stripeAdapter;
    case "paddle":
      return paddleAdapter;
    default:
      throw new Error(`Unknown BILLING_PROVIDER: ${env.BILLING_PROVIDER}`);
  }
}

export const billing = getBillingAdapter();

export type { BillingAdapter, CheckoutParams, BillingEventData, SubscriptionInfo } from "./adapter";
