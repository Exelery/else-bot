import { randomBytes } from "crypto";
import { HttpsProxyAgent } from "https-proxy-agent";
import type { BaseConfig } from "../types/base";
import { randDelay, utils } from "../utils/utils";
import WebSocket from "ws";
import type { Account } from "../types/bot";
import type { RealtimeData } from "../types/users";
import { sleep } from "bun";
import config from "../config";
import { random } from "lodash";
import { createLogger } from "../utils/logger";

export class TapWebSocket {
  userAgent: string;
  startupData: string;
  proxy: string;
  userId: number;
  jwt: string;
  ws: WebSocket | null;
  lastActivityTime: number;
  pingMonitor: NodeJS.Timer | null = null;
  private pingInterval: number = 50_000; // 30 seconds
  accountData: Account & RealtimeData;
  reqId?: number;
  private logger: ReturnType<typeof createLogger>;

  constructor(
    { userAgent, startupData, userId, jwt, logger, proxy }: BaseConfig,
    accountData: Account & RealtimeData
  ) {
    this.userAgent = userAgent;
    this.startupData = startupData;
    this.userId = userId ?? 0;
    this.jwt = jwt!;
    // this.proxy = getRandomProxy();
    this.ws = null;
    this.lastActivityTime = Date.now();
    this.accountData = accountData;
    this.logger = logger;
    this.proxy = proxy || "";
  }
  getRequestOpts() {
    return {
      headers: this.getHeaders(),
      proxy: this.proxy,
    };
  }

  getHeaders(): Record<string, string> {
    const headers = {
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language":
        "ru,en;q=0.9,ro;q=0.8,zh;q=0.7,th;q=0.6,es;q=0.5,it;q=0.4,ar;q=0.3,fr;q=0.2",
      "Cache-Control": "no-cache",
      Connection: "Upgrade",
      Host: "ws-back.else.app",
      Origin: "https://front.else.app",
      Pragma: "no-cache",
      "Sec-WebSocket-Extensions": "permessage-deflate; client_max_window_bits",
      "Sec-WebSocket-Key": this.generateKey(),
      "Sec-WebSocket-Version": "13",
      Upgrade: "websocket",
      "User-Agent": this.userAgent,
    };

    // Add "X-Telegram-Api-Secret-Token" only if this.jwt is defined and not empty
    return headers;
  }

  generateKey() {
    const bytes = randomBytes(16);

    // Convert the 16-byte buffer to a base64-encoded string
    return bytes.toString("base64");
  }

  async setConnections(updateFn: (data: RealtimeData | undefined) => void) {
    // this.logger.info(this.proxy);
    const agent = this.proxy ? new HttpsProxyAgent(this.proxy) : undefined;
    const headers = this.getHeaders();
    const ws = new WebSocket(
      `wss://ws-back.else.app/ws/?token=${this.jwt}&userId=${this.userId}`,
      { agent, headers }
    );
    this.ws = ws;

    ws.on("open", () => {
      this.logger.info("Connected to the WebSocket server");
      this.startPingMonitor();

      if (this.accountData.ptc < this.accountData.ptc_total) {
        setInterval(
          () => (this.accountData.ptc += this.accountData.ptc_rps),
          1000
        );
      }
    });

    ws.on("error", (error) => {
      this.logger.error("WebSocket error:", error);
    });

    ws.on("message", async (data: Buffer) => {
      const message = data.toString();
      this.lastActivityTime = Date.now();

      try {
        const object = JSON.parse(message) as
          | { data: RealtimeData; error: null; event: string; reqId: number }
          | WsErrorAnswer;
        if (object.data === null && object.error == "token-expired") {
          await sleep(
            randDelay(config.requestsDelay.min, config.requestsDelay.max)
          );
          this.logger.info(`Try to reinit ws`);
          await this.setConnections(updateFn);
        } else if (object.data && object.data.balance) {
          const {
            data: { balance, lvl, ptc_rps, pph, ppc, ptc, ptc_total },
          } = object;
          //  console.log(
          //`🤖 | Account #${this.accountData.userId} | Balance: ${balance} | Level: ${lvl} | Points per Click: ${ppc} | Energy per second: ${ptc_rps} | Points per Hour: ${pph}| Available energy: ${ptc}/${ptc_total}`

          this.logger.info(`Account status update`, {
            balance,
            lvl,
            ppc,
            ptc_rps,
            pph,
            ptc,
            ptc_total,
          });
          updateFn(object.data);
        } else {
          this.logger.debug(`Received message: ${message}`);
        }
      } catch (error) {
        this.logger.error("Error parsing JSON:", error);
      }
    });

    ws.on("close", async () => {
      this.logger.info("Connection closed");
      this.reqId = undefined;
      this.clearPingMonitor();
      await this.setConnections(updateFn);
    });

    return ws;
  }

  async tap() {
    try {
      await sleep(utils.randRequestDelay());

      if (this.ws === null) {
        this.logger.warn("No WebSocket connection");
        return;
      }
      const { ppc, ptc } = this.accountData;
      const points = utils.generatePoints(ppc, ptc);

      if (Number(points) < ptc) {
        if (!this.reqId) this.reqId = Date.now();

        this.ws!.send(
          JSON.stringify({
            event: "click",
            data: {
              points: `0`,
            },
            reqId: this.reqId++,
          })
        );

        const waitTime = (Number(points) / (ppc * random(2, 6))) * 1000;
        this.logger.info(`Sleeping before sending points`, {
          points,
          waitTime: (waitTime / 1000).toFixed(),
        });
        await sleep(waitTime);

        const data = {
          event: "click",
          data: {
            points: `${points.toFixed()}`,
          },
          reqId: this.reqId++,
        };

        this.ws!.send(JSON.stringify(data));
      }
    } catch (err) {
      this.logger.error("Error in tap function:", err);
    }
  }

  startPingMonitor(): void {
    this.pingMonitor = setInterval(() => {
      const now = Date.now();
      if (now - this.lastActivityTime > this.pingInterval) {
        this.sendPing();
      }
    }, this.pingInterval);
  }
  private sendPing(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.logger.debug("Sending ping to keep the connection alive...");
      this.ws.send(JSON.stringify({ event: "ping", data: null }));
    }
  }
  clearPingMonitor(): void {
    if (this.pingMonitor) {
      clearInterval(this.pingMonitor);
      this.pingMonitor = null;
    }
  }
}

type WsErrorAnswer = {
  event: string;
  data: null;
  error: "token-expired" | "cant-update-user";
};
