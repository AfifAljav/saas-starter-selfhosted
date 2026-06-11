import { pgTable, varchar, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users";

export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    provider: varchar("provider", { length: 50 }).notNull(), // "github" | "google"
    providerUserId: varchar("provider_user_id", { length: 255 }).notNull(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerUserId] }),
  }),
);

export type OauthAccount = typeof oauthAccounts.$inferSelect;
export type NewOauthAccount = typeof oauthAccounts.$inferInsert;
