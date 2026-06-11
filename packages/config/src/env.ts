import { z } from "zod";

// ---------------------------------------------------------------------------
// Server-side environment variables
// ---------------------------------------------------------------------------

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url(),

  // Auth
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),

  // OAuth — optional
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Email
  EMAIL_PROVIDER: z.enum(["smtp", "resend", "ses"]).default("smtp"),
  EMAIL_FROM: z.string().email(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_SECURE: z.coerce.boolean().default(false),
  RESEND_API_KEY: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),

  // Billing
  BILLING_PROVIDER: z.enum(["stripe", "paddle"]).default("stripe"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_ID_PRO_ANNUAL: z.string().optional(),
  STRIPE_PRICE_ID_ENTERPRISE_MONTHLY: z.string().optional(),
  STRIPE_PRICE_ID_ENTERPRISE_ANNUAL: z.string().optional(),
  PADDLE_API_KEY: z.string().optional(),
  PADDLE_WEBHOOK_SECRET: z.string().optional(),
  PADDLE_PRICE_ID_PRO_MONTHLY: z.string().optional(),
  PADDLE_PRICE_ID_PRO_ANNUAL: z.string().optional(),

  // Analytics
  UMAMI_APP_SECRET: z.string().optional(),
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
  NEXT_PUBLIC_UMAMI_URL: z.string().url().optional(),
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const _parsed = serverEnvSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error("❌ Invalid environment variables:\n");
  for (const [field, issues] of Object.entries(_parsed.error.flatten().fieldErrors)) {
    console.error(`  ${field}: ${(issues as string[]).join(", ")}`);
  }
  throw new Error("Invalid environment variables. See above for details.");
}

export const env = _parsed.data;

export type Env = typeof env;
