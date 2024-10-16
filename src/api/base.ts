import type { BaseConfig } from "../types/base";
import type { createLogger } from "../utils/logger";
import { getRandomProxy } from "../utils/utils";

export default class {
  userAgent: string;
  domain: string;
  startupData: string;
  proxy: string;
  origin: string;
  userId: number;
  jwt: string | null;
  logger: ReturnType<typeof createLogger>;
  constructor({
    userAgent,
    domain,
    startupData,
    origin,
    userId,
    jwt,
    logger,
    proxy,
  }: BaseConfig) {
    this.userAgent = userAgent;
    this.domain = domain;
    this.startupData = startupData;
    this.origin = origin;
    this.userId = userId ?? 0;
    this.jwt = jwt;
    this.proxy = proxy || "";
    this.logger = logger;
  }

  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language":
        "ru,en;q=0.9,ro;q=0.8,zh;q=0.7,th;q=0.6,es;q=0.5,it;q=0.4,ar;q=0.3,fr;q=0.2",
      "Content-Type": "application/json",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      Referer: `${this.origin}/`,
      Origin: this.origin,
      "User-Agent": this.userAgent,
    };

    // Add "X-Telegram-Api-Secret-Token" only if this.jwt is defined and not empty
    if (this.jwt) {
      headers["X-Telegram-Api-Secret-Token"] = this.jwt;
    }

    return headers;
  }

  getRequestOpts() {
    return {
      headers: this.getHeaders(),
      proxy: this.proxy,
    };
  }

  async request(pathname: string, opts: Record<string, unknown> = {}) {
    return await fetch(`https://${this.domain}${pathname}`, {
      ...opts,
      ...this.getRequestOpts(),
    });
  }
}
