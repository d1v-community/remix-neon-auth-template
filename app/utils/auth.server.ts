import { db } from "~/db/db.server";
import { users } from "~/db/schema";
import { verifyToken, getTokenFromRequest } from "~/services/jwt.server";
import { eq } from "drizzle-orm";
import type { User } from "~/db/schema";

export async function getUserFromRequest(request: Request): Promise<User | null> {
  const token = getTokenFromRequest(request);

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const userResults = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  if (userResults.length === 0) {
    return null;
  }

  return userResults[0];
}

export async function requireUser(request: Request): Promise<User> {
  const user = await getUserFromRequest(request);

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return user;
}

export function createAuthHeaders(token: string): HeadersInit {
  return {
    "Set-Cookie": `auth-token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`,
  };
}

export function createLogoutHeaders(): HeadersInit {
  return {
    "Set-Cookie": `auth-token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`,
  };
}
