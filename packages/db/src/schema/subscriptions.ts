import {
  pgTable,
  uuid,
  varchar,
  pgEnum,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const billingProviderEnum = pgEnum("billing_provider", ["stripe", "paddle"]);

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "free",
  "pro",
  "enterprise",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "cancelled",
  "trialing",
  "incomplete",
]);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" })
    .unique(),
  provider: billingProviderEnum("provider").notNull().default("stripe"),
  providerCustomerId: varchar("provider_customer_id", { length: 255 }),
  providerSubscriptionId: varchar("provider_subscription_id", { length: 255 }),
  plan: subscriptionPlanEnum("plan").notNull().default("free"),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  /**
   * When the current billing period ends.
   * Null for free plans.
   */
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: varchar("cancel_at_period_end", { length: 5 })
    .notNull()
    .default("false"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type SubscriptionPlan = "free" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing" | "incomplete";
