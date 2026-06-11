// ---------------------------------------------------------------------------
// BillingAdapter — the interface every billing provider must implement.
// Taken directly from PRD §6.3.
// ---------------------------------------------------------------------------

export interface CheckoutParams {
  /** Internal organization ID */
  orgId: string;
  /** Stripe/Paddle price ID */
  priceId: string;
  /** URL to redirect after successful checkout */
  successUrl: string;
  /** URL to redirect after cancelled checkout */
  cancelUrl: string;
  /** Customer email (pre-fills the checkout form) */
  customerEmail?: string;
  /** Existing provider customer ID (if known) */
  customerId?: string;
}

export interface PortalSessionParams {
  customerId: string;
  returnUrl: string;
}

export type BillingEventType =
  | "checkout.session.completed"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.payment_failed"
  | "invoice.payment_succeeded";

export interface BillingEventData {
  type: BillingEventType;
  /** Provider's raw event ID for idempotency */
  providerEventId: string;
  orgId?: string;
  customerId?: string;
  subscriptionId?: string;
  plan?: "free" | "pro" | "enterprise";
  status?: "active" | "past_due" | "cancelled" | "trialing" | "incomplete";
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

export interface SubscriptionInfo {
  id: string;
  customerId: string;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "past_due" | "cancelled" | "trialing" | "incomplete";
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

/**
 * Every billing provider (Stripe, Paddle, etc.) must implement this interface.
 * Swapping providers requires only changing the active implementation and
 * setting BILLING_PROVIDER in .env.
 */
export interface BillingAdapter {
  /**
   * Creates a hosted checkout session and returns the redirect URL.
   */
  createCheckoutSession(params: CheckoutParams): Promise<string>;

  /**
   * Creates a billing portal session for self-serve plan management.
   * Returns the redirect URL.
   */
  createPortalSession(params: PortalSessionParams): Promise<string>;

  /**
   * Parses and validates an incoming webhook payload.
   * Throws if the signature is invalid.
   */
  handleWebhook(payload: string, signature: string): Promise<BillingEventData>;

  /**
   * Fetches the current subscription state for a customer.
   */
  getSubscription(customerId: string): Promise<SubscriptionInfo | null>;
}
