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

interface VerifyEmailProps {
  appName: string;
  appUrl: string;
  userName: string;
  verificationUrl: string;
}

export default function VerifyEmail({
  appName = "My SaaS",
  appUrl = "https://example.com",
  userName = "there",
  verificationUrl = "https://example.com/verify?token=abc123",
}: VerifyEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Verify your email address for {appName}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{appName}</Heading>
          <Section style={styles.section}>
            <Text style={styles.text}>Hi {userName},</Text>
            <Text style={styles.text}>
              Thanks for signing up! Please verify your email address to activate
              your account.
            </Text>
            <Button href={verificationUrl} style={styles.button}>
              Verify Email Address
            </Button>
            <Text style={styles.smallText}>
              This link expires in 24 hours. If you did not sign up for {appName},
              you can safely ignore this email.
            </Text>
            <Hr style={styles.hr} />
            <Text style={styles.footer}>
              If the button above doesn&apos;t work, copy and paste this link into
              your browser:
              <br />
              <Link href={verificationUrl} style={styles.link}>
                {verificationUrl}
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
    backgroundColor: "#0f172a",
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
  link: { color: "#0f172a" },
};
