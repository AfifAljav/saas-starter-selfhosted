import { Google } from "arctic";
import { env } from "@saas/config/env";

/**
 * Google OAuth 2.0 provider via Arctic.
 * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.
 *
 * OAuth app setup: https://console.cloud.google.com/apis/credentials
 * Callback URL: {APP_URL}/api/auth/google/callback
 */
export const google = new Google(
  env.GOOGLE_CLIENT_ID ?? "",
  env.GOOGLE_CLIENT_SECRET ?? "",
  `${env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
);

export interface GoogleUser {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
}
