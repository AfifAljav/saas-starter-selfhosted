import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface SubscriptionCancelledProps {
  appName: string;
  appUrl: string;
  userName: string;
  planName: string;
  accessUntil: string;
}

export default function SubscriptionCancelled({
  appName = "My SaaS",
  appUrl = "https://example.com",
  userName = "there",
  planName = "Pro",
  accessUntil = "July 11, 2026",
}: SubscriptionCancelledProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your {planName} subscription has been cancelled</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{appName}</Heading>
          <Section style={styles.section}>
            <Text style={styles.text}>Hi {userName},</Text>
            <Text style={styles.text}>
              Your <strong>{planName}</strong> subscription has been cancelled.
              You will continue to have access to all {planName} features until{" "}
              <strong>{accessUntil}</strong>, after which your account will be
              moved to the Free plan.
            </Text>
            <Text style={styles.text}>
              We are sorry to see you go. If there&apos;s anything we could have
              done better, please let us know by replying to this email.
            </Text>
            <Button href={`${appUrl}/settings/billing`} style={styles.button}>
              Reactivate Subscription
            </Button>
            <Hr style={styles.hr} />
            <Text style={styles.footer}>
              Your data will not be deleted. You can reactivate your subscription
              at any time.
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
  hr: { borderColor: "#e6ebf1", margin: "24px 0" },
  footer: { fontSize: "12px", color: "#8898aa", lineHeight: "16px" },
};
