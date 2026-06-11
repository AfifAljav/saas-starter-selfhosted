import Stripe from "stripe";
import { env } from "@saas/config/env";
import type {
  BillingAdapter,
  BillingEventData,
  CheckoutParams,
  PortalSessionParams,
  SubscriptionInfo,
} from "./adapter";

// ---------------------------------------------------------------------------
// Stripe implementation of BillingAdapter
// ---------------------------------------------------------------------------

const stripe = new Stripe(env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-05-28.basil",
  typescript: true,
});

/**
 * Maps a Stripe Price ID to an internal plan name.
 * Update this when you add new plans.
 */
function priceIdToPlan(priceId: string): "free" | "pro" | "enterprise" {
  const map: Record<string, "free" | "pro" | "enterprise"> = {
    [env.STRIPE_PRICE_ID_PRO_MONTHLY ?? ""]: "pro",
    [env.STRIPE_PRICE_ID_PRO_ANNUAL ?? ""]: "pro",
    [env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY ?? ""]: "enterprise",
    [env.STRIPE_PRICE_ID_ENTERPRISE_ANNUAL ?? ""]: "enterprise",
  };
  return map[priceId] ?? "free";
}

function stripeStatusToInternal(
  status: Stripe.Subscription.Status,
): SubscriptionInfo["status"] {
  const map: Record<Stripe.Subscription.Status, SubscriptionInfo["status"]> = {
    active: "active",
    past_due: "past_due",
    canceled: "cancelled",
    trialing: "trialing",
    incomplete: "incomplete",
    incomplete_expired: "incomplete",
    unpaid: "past_due",
    paused: "past_due",
  };
  return map[status] ?? "incomplete";
}

export const stripeAdapter: BillingAdapter = {
  async createCheckoutSession(params: CheckoutParams): Promise<string> {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer: params.customerId,
      customer_email: params.customerId ? undefined : params.customerEmail,
      metadata: { orgId: params.orgId },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    return session.url;
  },

  async createPortalSession(params: PortalSessionParams): Promise<string> {
    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });

    return session.url;
  },

  async handleWebhook(payload: string, signature: string): Promise<BillingEventData> {
    const secret = env.STRIPE_WEBHOOK_SECRET ?? "";
    const event = stripe.webhooks.constructEvent(payload, signature, secret);

    const providerEventId = event.id;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          type: "checkout.session.completed",
          providerEventId,
          orgId: session.metadata?.orgId,
          customerId: session.customer as string | undefined,
          subscriptionId: session.subscription as string | undefined,
        };
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price.id ?? "";
        return {
          type: "customer.subscription.updated",
          providerEventId,
          customerId: sub.customer as string,
          subscriptionId: sub.id,
          plan: priceIdToPlan(priceId),
          status: stripeStatusToInternal(sub.status),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        };
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        return {
          type: "customer.subscription.deleted",
          providerEventId,
          customerId: sub.customer as string,
          subscriptionId: sub.id,
          plan: "free",
          status: "cancelled",
        };
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        return {
          type: "invoice.payment_failed",
          providerEventId,
          customerId: invoice.customer as string,
          subscriptionId: invoice.subscription as string | undefined,
          status: "past_due",
        };
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        return {
          type: "invoice.payment_succeeded",
          providerEventId,
          customerId: invoice.customer as string,
          subscriptionId: invoice.subscription as string | undefined,
          status: "active",
        };
      }

      default:
        throw new Error(`Unhandled Stripe event: ${event.type}`);
    }
  },

  async getSubscription(customerId: string): Promise<SubscriptionInfo | null> {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
      expand: ["data.items.data.price"],
    });

    const sub = subscriptions.data[0];
    if (!sub) return null;

    const priceId = sub.items.data[0]?.price.id ?? "";

    return {
      id: sub.id,
      customerId: sub.customer as string,
      plan: priceIdToPlan(priceId),
      status: stripeStatusToInternal(sub.status),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  },
};
