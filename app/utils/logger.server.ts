import pino from "pino";
import { env, isProd } from "./env.server";

const logger = pino({ level: env.LOG_LEVEL, base: undefined });

export function getLogger(requestId?: string) {
  return requestId ? logger.child({ requestId }) : logger;
}

export type Logger = ReturnType<typeof getLogger>;
