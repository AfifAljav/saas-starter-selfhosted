import { Lucia, TimeSpan } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@saas/db";
import { sessions, users } from "@saas/db/schema";


// ---------------------------------------------------------------------------
// Lucia v3 — self-hosted session management
// ---------------------------------------------------------------------------

const adapter = new DrizzlePostgreSQLAdapter(db as any, sessions as any, users as any);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(30, "d"), // 30-day sessions (remember me)
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },
  getUserAttributes(attributes) {
    return {
      id: attributes.id,
      email: attributes.email,
      name: attributes.name,
      avatarUrl: attributes.avatarUrl,
      emailVerifiedAt: attributes.emailVerifiedAt,
    };
  },
});

// ---------------------------------------------------------------------------
// Type augmentation for Lucia
// ---------------------------------------------------------------------------

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      id: string;
      email: string;
      name: string;
      avatarUrl: string | null;
      emailVerifiedAt: Date | null;
    };
  }
}

// ---------------------------------------------------------------------------
// Password hashing (Argon2id — PRD §6.1)
// ---------------------------------------------------------------------------

import { hash, verify } from "@node-rs/argon2";

export const hashPassword = (password: string): Promise<string> =>
  hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

export const verifyPassword = (hash: string, password: string): Promise<boolean> =>
  verify(hash, password);

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

import { cookies } from "next/headers";
import type { Session } from "lucia";

export type AuthUser = import("lucia").User;

/**
 * Validates the current request's session cookie.
 * Returns { user, session } or { user: null, session: null }.
 */
export async function validateRequest(): Promise<
  { user: AuthUser; session: Session } | { user: null; session: null }
> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return { user: null, session: null };
  }

  const result = await lucia.validateSession(sessionId);

  try {
    if (result.session?.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    if (!result.session) {
      const blankCookie = lucia.createBlankSessionCookie();
      cookieStore.set(blankCookie.name, blankCookie.value, blankCookie.attributes);
    }
  } catch {
    // Cookie manipulation may fail in some contexts (middleware, etc.)
  }

  return result as { user: AuthUser; session: Session } | { user: null; session: null };
}

export { lucia as auth };
