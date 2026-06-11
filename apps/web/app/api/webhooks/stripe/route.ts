import { NextRequest, NextResponse } from "next/server";
import { billing } from "@saas/billing";
import { db } from "@saas/db";
import { subscriptions, billingEvents, memberships, users } from "@saas/db/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "@saas/email";
import {
  SubscriptionActiveTemplate,
  SubscriptionFailedTemplate,
  SubscriptionCancelledTemplate,
} from "@saas/email";
import React from "react";
import { env } from "@saas/config/env";


export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  let event;
  try {
    event = await billing.handleWebhook(rawBody, signature);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency check — skip events we've already processed
  const existing = await db
    .select({ id: billingEvents.id })
    .from(billingEvents)
    .where(eq(billingEvents.providerEventId, event.providerEventId))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Store raw event for audit log
  await db.insert(billingEvents).values({
    providerEventId: event.providerEventId,
    eventType: event.type,
    orgId: event.orgId ?? null,
    payload: rawBody,
  });

  // Handle events
  switch (event.type) {
    case "checkout.session.completed": {
      if (!event.orgId || !event.customerId) break;

      await db
        .insert(subscriptions)
        .values({
          orgId: event.orgId,
          provider: env.BILLING_PROVIDER,
          providerCustomerId: event.customerId,
          providerSubscriptionId: event.subscriptionId,
          plan: "pro",
          status: "active",
        })
        .onConflictDoUpdate({
          target: subscriptions.orgId,
          set: {
            providerCustomerId: event.customerId,
            providerSubscriptionId: event.subscriptionId,
            plan: "pro",
            status: "active",
            updatedAt: new Date(),
          },
        });

      // Notify org owner
      await notifyOrgOwner(event.orgId, async (owner) => {
        await sendEmail({
          to: owner.email,
          subject: `Your Pro subscription is now active — ${env.NEXT_PUBLIC_APP_NAME}`,
          template: React.createElement(SubscriptionActiveTemplate, {
            appName: env.NEXT_PUBLIC_APP_NAME,
            appUrl: env.NEXT_PUBLIC_APP_URL,
            userName: owner.name,
            planName: "Pro",
            nextBillingDate: "Next month",
          }),
        });
      });
      break;
    }

    case "customer.subscription.updated": {
      if (!event.customerId) break;

      await db
        .update(subscriptions)
        .set({
          plan: event.plan ?? "free",
          status: event.status ?? "active",
          currentPeriodEnd: event.currentPeriodEnd ?? null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.providerCustomerId, event.customerId));
      break;
    }

    case "customer.subscription.deleted": {
      if (!event.customerId) break;

      await db
        .update(subscriptions)
        .set({ plan: "free", status: "cancelled", updatedAt: new Date() })
        .where(eq(subscriptions.providerCustomerId, event.customerId));

      // Notify org owner
      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.providerCustomerId, event.customerId))
        .limit(1);

      if (sub?.orgId) {
        await notifyOrgOwner(sub.orgId, async (owner) => {
          await sendEmail({
            to: owner.email,
            subject: `Your subscription has been cancelled — ${env.NEXT_PUBLIC_APP_NAME}`,
            template: React.createElement(SubscriptionCancelledTemplate, {
              appName: env.NEXT_PUBLIC_APP_NAME,
              appUrl: env.NEXT_PUBLIC_APP_URL,
              userName: owner.name,
              planName: "Pro",
              accessUntil: sub.currentPeriodEnd?.toLocaleDateString("en-US") ?? "today",
            }),
          });
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      if (!event.customerId) break;

      await db
        .update(subscriptions)
        .set({ status: "past_due", updatedAt: new Date() })
        .where(eq(subscriptions.providerCustomerId, event.customerId));

      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.providerCustomerId, event.customerId))
        .limit(1);

      if (sub?.orgId) {
        await notifyOrgOwner(sub.orgId, async (owner) => {
          await sendEmail({
            to: owner.email,
            subject: `Payment failed — action required — ${env.NEXT_PUBLIC_APP_NAME}`,
            template: React.createElement(SubscriptionFailedTemplate, {
              appName: env.NEXT_PUBLIC_APP_NAME,
              appUrl: env.NEXT_PUBLIC_APP_URL,
              userName: owner.name,
              planName: "Pro",
              retryDate: "in 3 days",
            }),
          });
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

// ---------------------------------------------------------------------------
// Helper: look up the owner of an org and call cb with their user record
// ---------------------------------------------------------------------------

async function notifyOrgOwner(
  orgId: string,
  cb: (owner: { id: string; email: string; name: string }) => Promise<void>,
): Promise<void> {
  const [ownerMembership] = await db
    .select({ userId: memberships.userId })
    .from(memberships)
    .where(and(eq(memberships.orgId, orgId), eq(memberships.role, "owner")))
    .limit(1);

  if (!ownerMembership) return;

  const [owner] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, ownerMembership.userId))
    .limit(1);

  if (owner) await cb(owner);
}
