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

interface WelcomeProps {
  appName: string;
  appUrl: string;
  userName: string;
}

export default function Welcome({
  appName = "My SaaS",
  appUrl = "https://example.com",
  userName = "there",
}: WelcomeProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to {appName}!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{appName}</Heading>
          <Section style={styles.section}>
            <Text style={styles.text}>Hi {userName},</Text>
            <Text style={styles.text}>
              Your email address has been verified. Welcome to {appName}! 🎉
            </Text>
            <Text style={styles.text}>
              Here&apos;s what you can do next:
            </Text>
            <ul style={styles.list}>
              <li>Create or join an organization</li>
              <li>Invite teammates</li>
              <li>Explore your dashboard</li>
            </ul>
            <Button href={`${appUrl}/dashboard`} style={styles.button}>
              Go to Dashboard
            </Button>
            <Hr style={styles.hr} />
            <Text style={styles.footer}>
              If you have any questions, reply to this email or check our
              documentation.
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
  list: { fontSize: "16px", lineHeight: "26px", color: "#333", paddingLeft: "20px" },
  button: {
    backgroundColor: "#16a34a",
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
