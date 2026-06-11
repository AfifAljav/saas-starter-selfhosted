import { NextRequest, NextResponse } from "next/server";
import { lucia, hashPassword, verifyPassword } from "@saas/auth";
import { db } from "@saas/db";
import {
  users,
  emailVerificationTokens,
  passwordResetTokens,
  sessions,
} from "@saas/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@saas/email";
import { VerifyEmailTemplate, ResetPasswordTemplate } from "@saas/email";
import { createId } from "@paralleldrive/cuid2";
import { createHash, randomBytes } from "crypto";
import React from "react";
import { env } from "@saas/config/env";

// ---------------------------------------------------------------------------
// Helper: generate a secure random token and return { raw, hash }
// ---------------------------------------------------------------------------
function generateToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

type Params = { params: { lucia: string[] } };

export async function POST(request: NextRequest, { params }: Params) {
  const [action, ...rest] = params.lucia;

  switch (action) {
    case "login":
      return handleLogin(request);
    case "register":
      return handleRegister(request);
    case "logout":
      return handleLogout(request);
    case "reset-password":
      return handleResetPasswordRequest(request);
    default:
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  const [action] = params.lucia;

  switch (action) {
    case "github":
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/api/auth/github/init`,
      );
    case "google":
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/api/auth/google/init`,
      );
    default:
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

async function handleLogin(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString().toLowerCase().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/login?error=missing_fields`,
      { status: 303 },
    );
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user || !user.hashedPassword) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/login?error=invalid_credentials`,
      { status: 303 },
    );
  }

  const validPassword = await verifyPassword(user.hashedPassword, password);
  if (!validPassword) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/login?error=invalid_credentials`,
      { status: 303 },
    );
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  const response = NextResponse.redirect(
    `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
    { status: 303 },
  );
  response.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return response;
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

async function handleRegister(request: NextRequest) {
  const formData = await request.formData();
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().toLowerCase().trim();
  const password = formData.get("password")?.toString();

  if (!name || !email || !password || password.length < 8) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/register?error=invalid_input`,
      { status: 303 },
    );
  }

  // Check duplicate email
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/register?error=email_taken`,
      { status: 303 },
    );
  }

  const hashedPassword = await hashPassword(password);
  const userId = createId();

  await db.insert(users).values({
    id: userId,
    email,
    name,
    hashedPassword,
  });

  // Create email verification token
  const { raw, hash } = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await db.insert(emailVerificationTokens).values({
    userId,
    tokenHash: hash,
    expiresAt,
  });

  // Send verification email
  await sendEmail({
    to: email,
    subject: `Verify your email — ${env.NEXT_PUBLIC_APP_NAME}`,
    template: React.createElement(VerifyEmailTemplate, {
      appName: env.NEXT_PUBLIC_APP_NAME,
      appUrl: env.NEXT_PUBLIC_APP_URL,
      userName: name,
      verificationUrl: `${env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${raw}`,
    }),
  });

  // Create session
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  const response = NextResponse.redirect(
    `${env.NEXT_PUBLIC_APP_URL}/onboarding`,
    { status: 303 },
  );
  response.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return response;
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

async function handleLogout(request: NextRequest) {
  const cookieName = lucia.sessionCookieName;
  const sessionId = request.cookies.get(cookieName)?.value;

  if (sessionId) {
    await lucia.invalidateSession(sessionId);
  }

  const blankCookie = lucia.createBlankSessionCookie();
  const response = NextResponse.redirect(
    `${env.NEXT_PUBLIC_APP_URL}/login`,
    { status: 303 },
  );
  response.cookies.set(blankCookie.name, blankCookie.value, blankCookie.attributes);
  return response;
}

// ---------------------------------------------------------------------------
// Password reset request
// ---------------------------------------------------------------------------

async function handleResetPasswordRequest(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString().toLowerCase().trim();

  if (!email) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/reset-password?error=missing_email`,
      { status: 303 },
    );
  }

  // Always redirect with success to prevent email enumeration
  const redirectUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?step=sent`;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return NextResponse.redirect(redirectUrl, { status: 303 });

  const { raw, hash } = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: hash,
    expiresAt,
  });

  await sendEmail({
    to: email,
    subject: `Reset your password — ${env.NEXT_PUBLIC_APP_NAME}`,
    template: React.createElement(ResetPasswordTemplate, {
      appName: env.NEXT_PUBLIC_APP_NAME,
      userName: user.name,
      resetUrl: `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${raw}`,
    }),
  });

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
