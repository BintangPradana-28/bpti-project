import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  browser: {
    asObject: true,
  },
});

export function logAuditEvent(event: {
  action: string;
  actorId?: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  logger.info({
    event: "audit",
    ...event,
  });
}
