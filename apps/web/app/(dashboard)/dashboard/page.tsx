import type { Metadata } from "next";
import { validateRequest } from "@saas/auth";
import { db } from "@saas/db";
import { memberships, organizations, subscriptions } from "@saas/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  // Fetch user's organizations and subscription status
  const userMemberships = await db
    .select({
      org: organizations,
      role: memberships.role,
    })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.orgId, organizations.id))
    .where(eq(memberships.userId, user.id));

  // Redirect to onboarding if no org
  if (userMemberships.length === 0) {
    redirect("/onboarding");
  }

  const primaryOrg = userMemberships[0].org;

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.orgId, primaryOrg.id))
    .limit(1);

  const planName = subscription?.plan ?? "free";
  const subscriptionStatus = subscription?.status ?? "active";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}. Here&apos;s what&apos;s happening with{" "}
          <strong>{primaryOrg.name}</strong>.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Subscription status */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                planName === "pro"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : planName === "enterprise"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                    : "bg-secondary text-secondary-foreground"
              }`}
            >
              {planName.charAt(0).toUpperCase() + planName.slice(1)}
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold capitalize">{planName}</p>
          <p className="mt-1 text-xs text-muted-foreground capitalize">
            Status:{" "}
            <span
              className={
                subscriptionStatus === "active"
                  ? "text-green-600 dark:text-green-400"
                  : "text-yellow-600 dark:text-yellow-400"
              }
            >
              {subscriptionStatus}
            </span>
          </p>
        </div>

        {/* Team members */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Team Members</p>
          <p className="mt-2 text-2xl font-bold">{userMemberships.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your role:{" "}
            <span className="capitalize font-medium">
              {userMemberships[0].role}
            </span>
          </p>
        </div>

        {/* Organization */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Organization</p>
          <p className="mt-2 text-2xl font-bold truncate">{primaryOrg.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Slug: <code className="text-xs">{primaryOrg.slug}</code>
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/settings/team", label: "Invite Team Members", icon: "👥" },
            { href: "/settings/billing", label: "Manage Billing", icon: "💳" },
            { href: "/settings/profile", label: "Update Profile", icon: "👤" },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-md border border-border p-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span className="text-xl">{action.icon}</span>
              <span className="font-medium">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
