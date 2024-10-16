import BaseRequest from "./base";
import type {
  BoostInfo,
  RealtimeData,
} from "../types/users";


export class BoostsRequest extends BaseRequest {
  async increaseBoost(boost: "multitap" | "energy-limit", levelToBuy: number) {
    try {
      if (!this.jwt) {
        throw new Error(`No JWT token available`);
      }
      this.logger.info(`Starting to buy boost ${boost}`);

      const res = await this.request(`/api/v1/user/boost`, {
        method: "POST",
        body: JSON.stringify({
          boost,
          levelToBuy,
          userId: this.userId,
        }),
      });
      if (res.status === 500) {
        // internal server error
        const data = await res.text();
        throw new Error(data);
      }

      const data = (await res.json()) as BoostResponse;
      if (data.error) {
        throw new Error(data.error?.toString());
      }
      this.logger.info(`Successfully bought boost ${boost}`, {
        ptc: data.realtimeData.ptc,
        ptc_total: data.realtimeData.ptc_total
      });
      return data;
    } catch (err) {
      this.logger.error(`Failed to buy boost ${boost}`, {
        error: (err as Error)?.message
      });
      return undefined;
    }
  }

}

type BoostResponse = {
  data: BoostInfo;
  error: null | string;
  realtimeData: RealtimeData;
};
