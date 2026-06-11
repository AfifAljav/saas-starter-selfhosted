import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { validateRequest } from "@saas/auth";
import { db } from "@saas/db";
import { memberships, organizations, subscriptions } from "@saas/db/schema";
import { eq } from "drizzle-orm";
import { getPlanById } from "@saas/config/plans";

export const metadata: Metadata = {
  title: "Billing Settings",
};

export default async function BillingSettingsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  // Fetch primary org
  const [membership] = await db
    .select({ org: organizations, role: memberships.role })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.orgId, organizations.id))
    .where(eq(memberships.userId, user.id))
    .limit(1);

  if (!membership) redirect("/onboarding");

  const { org, role } = membership;
  const isOwner = role === "owner";

  // Fetch subscription
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.orgId, org.id))
    .limit(1);

  const plan = getPlanById(subscription?.plan ?? "free");
  const status = subscription?.status ?? "active";
  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and payment details for{" "}
          <strong>{org.name}</strong>
        </p>
      </div>

      {/* Current plan */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold">Current Plan</h2>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-bold capitalize">{plan.name}</span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                  status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : status === "past_due"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {status.replace("_", " ")}
              </span>
            </div>
            {plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                ${plan.monthlyPrice}/month · {periodEnd ? `Renews ${periodEnd}` : ""}
              </p>
            )}
            {plan.monthlyPrice === 0 && (
              <p className="mt-1 text-sm text-muted-foreground">Free forever</p>
            )}
          </div>
          {isOwner && subscription?.providerCustomerId && (
            <form action="/api/billing/portal" method="POST">
              <input type="hidden" name="orgId" value={org.id} />
              <button
                id="billing-portal-btn"
                type="submit"
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                Manage Subscription
              </button>
            </form>
          )}
        </div>

        {/* Features */}
        <ul className="mt-4 space-y-2">
          {plan.features.map((feature) => (
            <li key={feature.label} className="flex items-center gap-2 text-sm">
              <span className={feature.included ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                {feature.included ? "✓" : "✗"}
              </span>
              <span className={feature.included ? "" : "text-muted-foreground line-through"}>
                {feature.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upgrade options */}
      {plan.id !== "enterprise" && isOwner && (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold">Upgrade Your Plan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Get access to more features and higher limits.
          </p>
          <div className="mt-4 flex gap-3">
            {plan.id === "free" && (
              <form action="/api/billing/checkout" method="POST">
                <input type="hidden" name="orgId" value={org.id} />
                <input type="hidden" name="plan" value="pro" />
                <input type="hidden" name="interval" value="monthly" />
                <button
                  id="upgrade-pro-monthly-btn"
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Upgrade to Pro — $29/mo
                </button>
              </form>
            )}
            <Link
              href="/pricing"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              View All Plans
            </Link>
          </div>
        </div>
      )}

      {!isOwner && (
        <p className="text-sm text-muted-foreground rounded-lg border border-border bg-card p-4">
          Only the organization owner can manage billing.
        </p>
      )}
    </div>
  );
}
