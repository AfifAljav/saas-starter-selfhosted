import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordProps {
  appName: string;
  userName: string;
  resetUrl: string;
}

export default function ResetPassword({
  appName = "My SaaS",
  userName = "there",
  resetUrl = "https://example.com/reset?token=abc123",
}: ResetPasswordProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Reset your {appName} password</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{appName}</Heading>
          <Section style={styles.section}>
            <Text style={styles.text}>Hi {userName},</Text>
            <Text style={styles.text}>
              We received a request to reset your password. Click the button below
              to choose a new password.
            </Text>
            <Button href={resetUrl} style={styles.button}>
              Reset Password
            </Button>
            <Text style={styles.smallText}>
              This link expires in <strong>1 hour</strong> and can only be used
              once. If you did not request a password reset, you can safely ignore
              this email — your password will not change.
            </Text>
            <Hr style={styles.hr} />
            <Text style={styles.footer}>
              If the button above doesn&apos;t work, copy and paste this link:
              <br />
              <Link href={resetUrl} style={styles.link}>
                {resetUrl}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: { backgroundColor: "#f6f9fc", fontFamily: "'Inter', sans-serif" },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    maxWidth: "560px",
    borderRadius: "8px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1a1a1a",
    padding: "24px 40px 0",
  },
  section: { padding: "0 40px" },
  text: { fontSize: "16px", lineHeight: "26px", color: "#333" },
  button: {
    backgroundColor: "#dc2626",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    padding: "12px 24px",
    textDecoration: "none",
    display: "inline-block",
    margin: "16px 0",
  },
  smallText: { fontSize: "13px", color: "#666", lineHeight: "22px" },
  hr: { borderColor: "#e6ebf1", margin: "24px 0" },
  footer: { fontSize: "12px", color: "#8898aa", lineHeight: "16px" },
  link: { color: "#dc2626" },
};
