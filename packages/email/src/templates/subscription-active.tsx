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

interface SubscriptionActiveProps {
  appName: string;
  appUrl: string;
  userName: string;
  planName: string;
  nextBillingDate: string;
}

export default function SubscriptionActive({
  appName = "My SaaS",
  appUrl = "https://example.com",
  userName = "there",
  planName = "Pro",
  nextBillingDate = "July 11, 2026",
}: SubscriptionActiveProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your {planName} subscription is now active</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{appName}</Heading>
          <Section style={styles.section}>
            <Text style={styles.text}>Hi {userName},</Text>
            <Text style={styles.text}>
              Your <strong>{planName}</strong> subscription is now active. Thank you
              for your purchase!
            </Text>
            <Section style={styles.infoBox}>
              <Text style={styles.infoText}>
                <strong>Plan:</strong> {planName}
              </Text>
              <Text style={styles.infoText}>
                <strong>Next billing date:</strong> {nextBillingDate}
              </Text>
            </Section>
            <Button href={`${appUrl}/settings/billing`} style={styles.button}>
              Manage Subscription
            </Button>
            <Hr style={styles.hr} />
            <Text style={styles.footer}>
              You can update or cancel your subscription at any time from your
              billing settings.
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
  infoBox: {
    backgroundColor: "#f8fafc",
    borderRadius: "6px",
    padding: "12px 16px",
    margin: "16px 0",
  },
  infoText: { fontSize: "14px", lineHeight: "22px", color: "#334155", margin: "4px 0" },
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
