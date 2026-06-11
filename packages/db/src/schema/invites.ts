import { pgTable, uuid, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { memberRoleEnum } from "./memberships";

export const invites = pgTable("invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  role: memberRoleEnum("role").notNull().default("member"),
  /**
   * SHA-256 hash of the raw invite token sent in the email.
   */
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  /**
   * Set when the invite is accepted.
   */
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Invite = typeof invites.$inferSelect;
export type NewInvite = typeof invites.$inferInsert;
