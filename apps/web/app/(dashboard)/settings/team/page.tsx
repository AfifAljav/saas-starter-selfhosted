import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { validateRequest } from "@saas/auth";
import { db } from "@saas/db";
import { memberships, organizations, users, invites } from "@saas/db/schema";
import { eq, and, isNull } from "drizzle-orm";


export const metadata: Metadata = {
  title: "Team Settings",
};

export default async function TeamSettingsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  // Fetch current org and membership
  const [currentMembership] = await db
    .select({
      org: organizations,
      role: memberships.role,
    })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.orgId, organizations.id))
    .where(eq(memberships.userId, user.id))
    .limit(1);

  if (!currentMembership) redirect("/onboarding");

  const { org, role } = currentMembership;
  const canManage = role === "owner" || role === "admin";

  // Fetch all members
  const teamMembers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: memberships.role,
      joinedAt: memberships.createdAt,
    })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.orgId, org.id));

  // Fetch pending invites
  const pendingInvites = await db
    .select()
    .from(invites)
    .where(and(eq(invites.orgId, org.id), isNull(invites.acceptedAt)));


  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">
          Manage members and invitations for <strong>{org.name}</strong>
        </p>
      </div>

      {/* Invite member */}
      {canManage && (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold">Invite a Team Member</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            They will receive an invitation email with an accept link.
          </p>
          <form
            action="/api/settings/team/invite"
            method="POST"
            className="mt-4 flex gap-3"
          >
            <input type="hidden" name="orgId" value={org.id} />
            <input
              id="invite-email"
              name="email"
              type="email"
              required
              placeholder="colleague@example.com"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              id="invite-role"
              name="role"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              id="send-invite-btn"
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Send Invite
            </button>
          </form>
        </div>
      )}

      {/* Member list */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">
            Members ({teamMembers.length})
          </h2>
        </div>
        <ul className="divide-y divide-border">
          {teamMembers.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-semibold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {member.name}
                    {member.id === user.id && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold capitalize">
                  {member.role}
                </span>
                {canManage && member.id !== user.id && (
                  <form action="/api/settings/team/remove" method="POST">
                    <input type="hidden" name="orgId" value={org.id} />
                    <input type="hidden" name="userId" value={member.id} />
                    <button
                      type="submit"
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold">
              Pending Invitations ({pendingInvites.length})
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {pendingInvites.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="text-sm font-medium">{invite.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    Invited as {invite.role}
                  </p>
                </div>
                {canManage && (
                  <form action="/api/settings/team/revoke-invite" method="POST">
                    <input type="hidden" name="inviteId" value={invite.id} />
                    <button
                      type="submit"
                      className="text-xs text-muted-foreground hover:text-destructive hover:underline"
                    >
                      Revoke
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
