import { db } from "~/db/db.server";
import { auditLogs } from "~/db/schema";

type AuditInput = {
  action: string;
  actorUserId?: string | null;
  orgId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAudit(input: AuditInput) {
  const { action, actorUserId, orgId, targetType, targetId, metadata } = input;
  await db.insert(auditLogs).values({
    action,
    actorUserId: actorUserId ?? null,
    orgId: orgId ?? null,
    targetType: targetType ?? null,
    targetId: targetId ?? null,
    metadata: metadata ?? {},
  });
}

