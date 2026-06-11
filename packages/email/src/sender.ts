import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { render } from "@react-email/components";
import { env } from "@saas/config/env";
import type { ReactElement } from "react";

// ---------------------------------------------------------------------------
// Email sender — pluggable transport (smtp | resend | ses)
// ---------------------------------------------------------------------------

function createTransport(): Transporter {
  switch (env.EMAIL_PROVIDER) {
    case "smtp": {
      return nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT ?? 587,
        secure: env.SMTP_SECURE,
        auth:
          env.SMTP_USER && env.SMTP_PASSWORD
            ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
            : undefined,
      });
    }

    case "resend": {
      if (!env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER=resend");
      }
      return nodemailer.createTransport({
        host: "smtp.resend.com",
        port: 465,
        secure: true,
        auth: {
          user: "resend",
          pass: env.RESEND_API_KEY,
        },
      });
    }

    case "ses": {
      if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
        throw new Error(
          "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required when EMAIL_PROVIDER=ses",
        );
      }
      // Uses SES SMTP endpoint — no extra SDK needed
      return nodemailer.createTransport({
        host: `email-smtp.${env.AWS_REGION ?? "us-east-1"}.amazonaws.com`,
        port: 465,
        secure: true,
        auth: {
          user: env.AWS_ACCESS_KEY_ID,
          pass: env.AWS_SECRET_ACCESS_KEY,
        },
      });
    }

    default:
      throw new Error(`Unknown EMAIL_PROVIDER: ${env.EMAIL_PROVIDER}`);
  }
}

// Lazily initialize transport
let _transport: Transporter | null = null;

function getTransport(): Transporter {
  if (!_transport) {
    _transport = createTransport();
  }
  return _transport;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  /** A React Email component element */
  template: ReactElement;
  /** Optional plain-text fallback */
  text?: string;
}

/**
 * Renders a React Email template and sends it via the configured transport.
 */
export async function sendEmail({
  to,
  subject,
  template,
  text,
}: SendEmailOptions): Promise<void> {
  const html = await render(template);

  await getTransport().sendMail({
    from: env.EMAIL_FROM,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    html,
    text: text ?? "",
  });
}
