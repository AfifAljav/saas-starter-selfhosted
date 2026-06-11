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

interface InviteMemberProps {
  appName: string;
  orgName: string;
  inviterName: string;
  role: "admin" | "member";
  acceptUrl: string;
  expiresInDays?: number;
}

export default function InviteMember({
  appName = "My SaaS",
  orgName = "Acme Corp",
  inviterName = "John Doe",
  role = "member",
  acceptUrl = "https://example.com/invite?token=abc123",
  expiresInDays = 7,
}: InviteMemberProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        {inviterName} invited you to join {orgName} on {appName}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{appName}</Heading>
          <Section style={styles.section}>
            <Text style={styles.text}>
              <strong>{inviterName}</strong> has invited you to join{" "}
              <strong>{orgName}</strong> as a <strong>{role}</strong>.
            </Text>
            <Button href={acceptUrl} style={styles.button}>
              Accept Invitation
            </Button>
            <Text style={styles.smallText}>
              This invitation expires in {expiresInDays} days. If you were not
              expecting this invitation, you can safely ignore this email.
            </Text>
            <Hr style={styles.hr} />
            <Text style={styles.footer}>
              Or copy and paste this link into your browser:
              <br />
              <Link href={acceptUrl} style={styles.link}>
                {acceptUrl}
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
    backgroundColor: "#7c3aed",
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
  link: { color: "#7c3aed" },
};
