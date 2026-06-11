import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { validateRequest } from "@saas/auth";

export const metadata: Metadata = {
  title: "Profile Settings",
};

export default async function ProfileSettingsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal account settings
        </p>
      </div>

      {/* Profile info */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">Personal Information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your name and email address.
        </p>
        <form action="/api/settings/profile" method="POST" className="mt-4 space-y-4">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium">
              Full name
            </label>
            <input
              id="profile-name"
              name="name"
              type="text"
              defaultValue={user.name}
              required
              minLength={2}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="profile-email"
              name="email"
              type="email"
              defaultValue={user.email}
              required
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {!user.emailVerifiedAt && (
              <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                ⚠ Email not verified.{" "}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/api/auth/verify-email/resend"
                  id="resend-verification-btn"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Resend verification email
                </a>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="profile-avatar" className="block text-sm font-medium">
              Avatar URL
            </label>
            <input
              id="profile-avatar"
              name="avatarUrl"
              type="url"
              defaultValue={user.avatarUrl ?? ""}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="https://example.com/avatar.png"
            />
          </div>

          <button
            id="profile-save-btn"
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">Change Password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Leave blank to keep your current password.
        </p>
        <form action="/api/settings/password" method="POST" className="mt-4 space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium">
              Current password
            </label>
            <input
              id="current-password"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="new-password-profile" className="block text-sm font-medium">
              New password
            </label>
            <input
              id="new-password-profile"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            id="password-change-btn"
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/30 bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold text-destructive">Danger Zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently delete your account. This action cannot be undone.
        </p>
        <button
          id="delete-account-btn"
          type="button"
          className="mt-4 rounded-md border border-destructive px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
