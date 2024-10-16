import { sleep } from "bun";
import type { Account } from "./types/bot";
import config from "./config";
import { getSessionsData } from "./sessions";
import { getInitData } from "./initData";
import type { RealtimeData } from "./types/users";
import { randDelay, randInt, utils } from "./utils/utils";
import { UsersRequest } from "./api/users";
import { TapWebSocket } from "./api/websocket";
import type { SessionData } from "./types/sessions";
import { CategoryRequest } from "./api/categories";
import { random, sample } from "lodash";
import { BoostsRequest } from "./api/boosts";
import { createLogger } from "./utils/logger";

async function main() {
  const sessions = await getSessionsData();

  console.log(sessions.length)
  // todo: add logging?

  for (const session of sessions) {
    const bot = new ElseBotNew(session);

     bot.run();
  }
}

await main();

class ElseBotNew {
  private logger: ReturnType<typeof createLogger>;
  accountData!: Account & RealtimeData;
  totalPlaced = 0;
  lastClaimedAt = 0;

  isPaused = false;

  nextClaimDelay = 0;
  nextRunDelay = config.runDelay.onStart * 1000;
  maxLifetime = config.maxLifetime * 1000;
  timer: ReturnType<typeof setTimeout> | undefined = undefined;
  tapApi?: TapWebSocket;

  constructor(session: SessionData) {
    this.initializeAccountData(session);
    this.logger = createLogger(session.id.toString());
  }

  // Initializes the basic account data structure
  private initializeAccountData(session: SessionData): void {
    this.accountData = {
      balance: 0,
      lvl: 0,
      ppc: 0,
      pph: 0,
      pps: 0,
      ptc: 0,
      ptc_rps: 0,
      ptc_total: 0,
      pst: 0,
      uid: "",
      ms: 0,

      //   ws: null,
      jwt: null,
      //   id: 1,
      userId: session.id,
      sessionData: session,
      startupData: null,
      lastRenewAt: 0,
      lastErrorAt: 0,
    };
  }

  async initAccountData() {
    if (
      this.accountData.startupData &&
      this.accountData.lastRenewAt + this.maxLifetime > Date.now()
    ) {
      return this.accountData;
    }

    const session = this.accountData.sessionData;
    this.logger.info(`🦊 Getting initData...`);
    let startupData = null;
    try {
      startupData = await getInitData(session);
    } catch (err) {
      this.logger.error(`😢 Failed to get auth data`, {
        username: session.username,
        firstName: session.firstName,
        lastName: session.lastName,
        error: (err as Error).message,
      });
    }

    this.accountData = {
      ...this.accountData,
      startupData,
      lastRenewAt: Date.now(),
    };

    return this;
  }

  async accountStartup() {
    if (!this.accountData.startupData) {
      this.logger.info(`❄️ Skipping unauthorized account...`);
      return this.accountData;
    }
    if (
      this.accountData.jwt &&
      this.accountData.lastRenewAt + this.maxLifetime > Date.now()
    ) {
      return this.accountData;
    }

    this.logger.info(`📦 Getting account mining status with random delay...`);
    await sleep(utils.randRequestDelay());
    const startData = await new UsersRequest(
      this.getRequestData(this.accountData)
    ).startup();

    this.accountData = {
      ...this.accountData,
      ...startData?.realtimeData,
      jwt: startData?.data.jwt ?? null,
      lastRenewAt: Date.now(),
    };

    const userRequests = new UsersRequest(
      this.getRequestData(this.accountData)
    );

    await sleep(utils.randRequestDelay());
    await this.updateUserInfo();

    const configData = await userRequests.getUserConfig();

    return this;
  }

  getRequestData(account: Account) {
    return {
      userAgent: account.sessionData.userAgent,
      domain: config.domain,
      startupData: account.startupData as string,
      origin: config.origin,
      userId: account.userId,
      jwt: account.jwt,
      logger: this.logger,
      proxy: account.sessionData.proxy,
    };
  }

  async initWs() {
    if (!this.accountData.jwt) {
      this.logger.info(`❄️ Skipping unauthorized account...`);
      return this.accountData;
    }

    this.logger.info(`🤖 Start init WebSocket...`);
    await sleep(utils.randRequestDelay());

    this.tapApi = new TapWebSocket(
      this.getRequestData(this.accountData),
      this.accountData
    );
    this.tapApi.setConnections(this.updateRealtimeData.bind(this));
  }

  async tap() {
    try {
      await sleep(utils.randRequestDelay());
      await this.tapApi?.tap();
    } catch (err) {
      console.error(err);
    }
  }

  updateRealtimeData(data: RealtimeData | undefined) {
    if (data) {
      for (const key of Object.keys(data) as (keyof RealtimeData)[]) {
        this.accountData[key] = data[key] as never;
      }
    }
  }

  async loop() {
    while (!this.isPaused) {
      await this.tap();
      this.logger.debug("Tap completed");

      let delay = utils.randRunDelay();

      this.logger.debug(``, {
        ptc: this.accountData.ptc,
        ptc_total: this.accountData.ptc_total,
      });
      if (this.accountData.ptc < 150) {
        const done = await this.performActions();

        if (!done) {
          delay = utils.randLongRunDelay();
          this.logSleepTime(delay);
        }
      }

      await sleep(delay);
    }
  }

  private async performActions() {
    let done = false;
    if (this.accountData.info?.is_got_dar === false) {
      await this.getDaily();
      done = true;
    }

    const currentTime = Date.now();
    const energyCooldown = this.accountData?.info?.full_energy?.cooldown;

    if (this.shouldTankFull(currentTime, energyCooldown)) {
      await this.tankFull();
      done = true;
    } else if (this.shouldBuyCategoryItem()) {
      await this.buyCategoryItemLoop();
      done = true;
    } else if (this.shouldBuyBoost()) {
      await this.buyBoost();
      done = true;
    }
    return done;
  }

  private shouldTankFull(
    currentTime: number,
    energyCooldown: number | undefined
  ): boolean {
    return (
      energyCooldown !== undefined &&
      energyCooldown < currentTime &&
      utils.randomRoll()
    );
  }

  private shouldBuyCategoryItem(): boolean {
    const multiplier = this.accountData?.pph < 10_000 ? 3 : 1;
    return utils.randomRoll(multiplier) && this.accountData.balance > 10_000;
  }

  private shouldBuyBoost(): boolean {
    return utils.randomRoll() //&& this.accountData > 100_000;
  }

  private logSleepTime(delay: number) {
    const { minutes, seconds } = this.formatTime(delay);
    this.logger.info(`💤 Sleeping for long delay`, { delay, minutes, seconds });
  }

  private formatTime(time: number): { minutes: number; seconds: number } {
    const totalSeconds = Math.floor(time / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { minutes, seconds };
  }

  async buyBoost() {
    const boost = sample(["energy-limit", "multitap"])! as
      | "energy-limit"
      | "multitap";

    const { price, level } = this.accountData?.info?.boost[boost]!;
    if (price < this.accountData.balance) {
      const response = await new BoostsRequest(
        this.getRequestData(this.accountData)
      ).increaseBoost(boost, level + 1);

      if (response?.realtimeData) {
        this.updateRealtimeData(response?.realtimeData);
      }
      await sleep(utils.randRunDelay());
      await this.updateUserInfo();
    }
  }

  async updateUserInfo() {
    const userData = await new UsersRequest(
      this.getRequestData(this.accountData)
    ).me();

    if (userData) {
      this.accountData.info = userData.data;
    }
    await sleep(utils.randRunDelay());
  }
  async run() {
    this.logger.info("🚀 Starting bot run");
    await this.initAccountData();
    await this.accountStartup();
    await this.initWs();
    await this.loop();
  }

  async buyCategoryItemLoop() {
    const randomI = randInt(1, 3);
    for (let i = 0; i < randomI; i++) {
      this.logger.info(
        `🤖 Iteration ${i + 1}/${randomI}: Attempting to buy category item...`
      );
      await this.buyCategoryItem();
      await sleep(utils.randRunDelay());
    }
  }
  async buyCategoryItem() {
    this.logger.info(`🤖 Start to buy category item...`);
    const categoryApi = new CategoryRequest(
      this.getRequestData(this.accountData)
    );

    const response = await categoryApi.findAndBuy(this.accountData.balance);

    if (response?.realtimeData) {
      this.updateRealtimeData(response?.realtimeData);
    }
  }

  async getDaily() {
    const response = await new UsersRequest(
      this.getRequestData(this.accountData)
    ).getDaily();
    if (response?.realtimeData) {
      this.updateRealtimeData(response?.realtimeData);
    }

    await sleep(utils.randRunDelay());

    await this.updateUserInfo();
  }

  async tankFull() {
    const response = await new UsersRequest(
      this.getRequestData(this.accountData)
    ).setFulltank();
    if (response?.realtimeData) {
      this.updateRealtimeData(response?.realtimeData);
    }

    if (this.accountData.info && response?.data) {
      this.accountData.info.full_energy.cooldown = response?.data.cooldown;
      this.accountData.info.full_energy.count = response?.data.count;
    }

    await sleep(utils.randRunDelay());
  }
}
