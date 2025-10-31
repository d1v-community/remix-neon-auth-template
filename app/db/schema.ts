import { pgTable, text, timestamp, jsonb, bigserial, primaryKey, index } from "drizzle-orm/pg-core";

// Users table (Lucia)
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull(),
});

// Removed: Lucia session/key tables

// Organizations & RBAC (basic)
export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
});

export const memberships = pgTable(
  "memberships",
  {
    userId: text("user_id").notNull(),
    orgId: text("org_id").notNull(),
    role: text("role").notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.orgId], name: "memberships_pk" }),
    userIdx: index("memberships_user_idx").on(table.userId),
    orgIdx: index("memberships_org_idx").on(table.orgId),
  })
);

// Audit log
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    orgId: text("org_id"),
    actorUserId: text("actor_user_id"),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  },
  (table) => ({
    createdIdx: index("audit_logs_created_idx").on(table.createdAt),
  })
);

export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
