import { db } from "~/db/db.server";
import { memberships } from "~/db/schema";
import { eq, and } from "drizzle-orm";

export type Role = "owner" | "admin" | "member" | "viewer";

const roleOrder: Record<Role, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

export async function getRole(userId: string, orgId: string): Promise<Role | null> {
  const rows = await db.select().from(memberships).where(and(eq(memberships.userId, userId), eq(memberships.orgId, orgId)));
  if (rows.length === 0) return null;
  const role = rows[0].role as Role;
  return role;
}

export function hasRole(role: Role, minimum: Role) {
  return roleOrder[role] >= roleOrder[minimum];
}

export async function requireRole(userId: string, orgId: string, minimum: Role) {
  const role = await getRole(userId, orgId);
  if (!role || !hasRole(role as Role, minimum)) {
    const e = new Response("Forbidden", { status: 403 });
    throw e;
  }
  return role as Role;
}

