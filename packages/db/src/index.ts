import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@saas/config/env";
import * as schema from "./schema/index";

// ---------------------------------------------------------------------------
// Database client
// ---------------------------------------------------------------------------

const connectionString = env.DATABASE_URL;

/**
 * Use a single connection for migrations and scripts.
 * For the web app, we use a pool (see below).
 */
const migrationClient = postgres(connectionString, { max: 1 });

/**
 * Connection pool for the application.
 * postgres.js handles pooling internally.
 */
const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });

export { migrationClient, schema };
export type DB = typeof db;
