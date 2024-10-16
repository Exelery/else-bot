import type { createLogger } from "../utils/logger";

export type BaseConfig = {
  userAgent: string;
  domain: string;
  startupData: string;
  origin: string;
  userId?: number;
  jwt: string | null;
  logger: ReturnType<typeof createLogger>;
  proxy?: string;
};
