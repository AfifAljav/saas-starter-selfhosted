import { GitHub } from "arctic";
import { env } from "@saas/config/env";

/**
 * GitHub OAuth 2.0 provider via Arctic.
 * Requires GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env.
 *
 * OAuth app setup: https://github.com/settings/developers
 * Callback URL: {APP_URL}/api/auth/github/callback
 */
export const github = new GitHub(
  env.GITHUB_CLIENT_ID ?? "",
  env.GITHUB_CLIENT_SECRET ?? "",
  {
    redirectURI: `${env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`,
  },
);

export interface GitHubUser {
  id: number;
  login: string;
  email: string | null;
  name: string | null;
  avatar_url: string;
}
