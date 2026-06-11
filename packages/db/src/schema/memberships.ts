import { pgTable, uuid, varchar, pgEnum, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { organizations } from "./organizations";

export const memberRoleEnum = pgEnum("member_role", ["owner", "admin", "member"]);

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    /**
     * A user can only have one membership per organization.
     */
    uniqueMembership: unique("unique_membership").on(table.orgId, table.userId),
  }),
);

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
export type MemberRole = "owner" | "admin" | "member";
