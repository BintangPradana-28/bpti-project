import { prisma } from "./prisma";
import { logger } from "./logger";
import { headers } from "next/headers";

interface RecordAuditParams {
  action: string;
  entity: string;
  entityId?: string;
  actorId?: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  notes?: string;
}

export async function recordAudit({
  action,
  entity,
  entityId,
  actorId,
  beforeState,
  afterState,
  notes,
}: RecordAuditParams) {
  try {
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    try {
      const headerList = await headers();
      ipAddress = headerList.get("x-forwarded-for") || headerList.get("x-real-ip");
      userAgent = headerList.get("user-agent");
    } catch {
      // In non-request context (e.g. seed/background tasks)
    }

    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        actorId,
        beforeState: beforeState ? JSON.parse(JSON.stringify(beforeState)) : undefined,
        afterState: afterState ? JSON.parse(JSON.stringify(afterState)) : undefined,
        ipAddress,
        userAgent,
        notes,
      },
    });

    logger.info({
      audit: true,
      action,
      entity,
      entityId,
      actorId,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to record audit log");
  }
}
