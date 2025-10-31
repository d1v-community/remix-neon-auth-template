import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { env } from "~/utils/env.server";

// Create Neon client
const neonClient = neon(env.DATABASE_URL);

// Adapter to support Drizzle's expected call signature (text, params, options)
// while using Neon's recommended `.query()` under the hood.
const client = Object.assign(
  (text: string, params?: any[], options?: any) =>
    (neonClient as any).query(text, params, options),
  {
    transaction: (neonClient as any).transaction?.bind(neonClient),
  },
);

export const db = drizzle(client as any, { schema });
export type DB = typeof db;
