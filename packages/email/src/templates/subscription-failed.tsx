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

interface SubscriptionFailedProps {
  appName: string;
  appUrl: string;
  userName: string;
  planName: string;
  retryDate: string;
}

export default function SubscriptionFailed({
  appName = "My SaaS",
  appUrl = "https://example.com",
  userName = "there",
  planName = "Pro",
  retryDate = "June 18, 2026",
}: SubscriptionFailedProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Action required: Payment failed for your {planName} subscription</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{appName}</Heading>
          <Section style={styles.section}>
            <Text style={styles.text}>Hi {userName},</Text>
            <Text style={styles.text}>
              We were unable to process your payment for the{" "}
              <strong>{planName}</strong> plan. Your account will remain active
              while we retry, but please update your payment method to avoid
              service interruption.
            </Text>
            <Section style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ We will retry the payment on <strong>{retryDate}</strong>.
              </Text>
            </Section>
            <Button href={`${appUrl}/settings/billing`} style={styles.button}>
              Update Payment Method
            </Button>
            <Hr style={styles.hr} />
            <Text style={styles.footer}>
              If you have already updated your payment method, you can ignore
              this email. Contact support if you need help.
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
  warningBox: {
    backgroundColor: "#fef3c7",
    borderRadius: "6px",
    borderLeft: "4px solid #f59e0b",
    padding: "12px 16px",
    margin: "16px 0",
  },
  warningText: { fontSize: "14px", lineHeight: "22px", color: "#92400e", margin: 0 },
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
  hr: { borderColor: "#e6ebf1", margin: "24px 0" },
  footer: { fontSize: "12px", color: "#8898aa", lineHeight: "16px" },
};
