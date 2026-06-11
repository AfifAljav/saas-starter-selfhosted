import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const billingEventTypeEnum = pgEnum("billing_event_type", [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.payment_succeeded",
]);

/**
 * Immutable audit log of all billing webhook events.
 * Used for debugging and idempotency checks.
 */
export const billingEvents = pgTable("billing_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  /**
   * The provider's event ID (e.g. Stripe's evt_...).
   * Used for idempotency — reject duplicate events.
   */
  providerEventId: varchar("provider_event_id", { length: 255 }).notNull().unique(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "set null" }),
  /**
   * Raw JSON payload from the provider.
   */
  payload: text("payload").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

export type BillingEvent = typeof billingEvents.$inferSelect;
export type NewBillingEvent = typeof billingEvents.$inferInsert;
