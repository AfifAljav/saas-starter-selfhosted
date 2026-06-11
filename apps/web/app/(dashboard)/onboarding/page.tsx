import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { validateRequest } from "@saas/auth";
import { db } from "@saas/db";
import { memberships, organizations } from "@saas/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Get Started",
};

export default async function OnboardingPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  // If user already has an org, skip onboarding
  const existing = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .limit(1);

  if (existing.length > 0) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user.name}! 👋
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Let&apos;s get you set up. Create a new organization or join an existing one.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Create org */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="text-2xl">🏢</div>
            <h2 className="mt-2 text-base font-semibold">Create Organization</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Start fresh with your own organization and invite teammates.
            </p>
            <form action="/api/onboarding/create-org" method="POST" className="mt-4 space-y-3">
              <input
                id="org-name"
                name="name"
                type="text"
                required
                minLength={2}
                placeholder="Acme Corp"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                id="create-org-btn"
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Create Organization
              </button>
            </form>
          </div>

          {/* Join with invite */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="text-2xl">🔗</div>
            <h2 className="mt-2 text-base font-semibold">Join with Invite</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Have an invite link? Paste it below to join an existing organization.
            </p>
            <form action="/api/onboarding/join" method="POST" className="mt-4 space-y-3">
              <input
                id="invite-token"
                name="token"
                type="text"
                required
                placeholder="Paste your invite token"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                id="join-org-btn"
                type="submit"
                className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent transition-colors"
              >
                Join Organization
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
