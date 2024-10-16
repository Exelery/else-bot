import BaseRequest from "./base";
import type {
  FullEnergy,
  RealtimeData,
  Startup,
  UserConfig,
  UserResponse,
} from "../types/users";
import type { Tasks } from "../types/tasks";

export class UsersRequest extends BaseRequest {
  async startup() {
    try {
      this.logger.info(`Fetching startup data for userId: ${this.userId}`);
      const res = await this.request(
        `/api/v1/user/startup?${this.startupData}`
      );
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      this.logger.debug('Startup data:', data);
      return data as Startup;
    } catch (err) {
      this.logger.error(`Failed to get startup data for userId: ${this.userId}`, {
        error: (err as Error)?.message
      });
      return undefined;
    }
  }

  async me() {
    try {
      this.logger.info(`Fetching user data for userId: ${this.userId}`);
      const res = await this.request(`/api/v1/user?userId=${this.userId}`);
      const data = (await res.json()) as UserResponse;
      if (data.error) {
        throw new Error(data.error?.toString());
      }
      this.logger.debug('User data:', data);
      return data as UserResponse;
    } catch (err) {
      this.logger.error(`Failed to get user data for userId: ${this.userId}`, {
        error: (err as Error)?.message
      });
      return undefined;
    }
  }

  async getUserConfig() {
    try {
      this.logger.info(`Fetching user config for userId: ${this.userId}`);
      const res = await this.request(`/api/v1/config?userId=${this.userId}`);
      if (res.status === 500) {
        const data = await res.text();
        throw new Error(data);
      }

      const data = (await res.json()) as UserConfig;
      if (data.error) {
        throw new Error(data.error?.toString());
      }
      this.logger.debug('User config:', data);
      return data;
    } catch (err) {
      this.logger.error(`Failed to get user config `, {
        error: (err as Error)?.message
      });
      return undefined;
    }
  }

  async getTasks() {
    try {
      this.logger.info(`Fetching tasks for userId: ${this.userId}`);
      const res = await this.request(
        `/api/v1/task?userId=${this.userId}&page=1&perPage=100`
      );
      if (res.status === 500) {
        const data = await res.text();
        throw new Error(data);
      }

      const data = await res.json();
      if (data.hasOwnProperty("error")) {
        throw new Error(data.error);
      }
      this.logger.debug('Tasks data:', data);
      return data as Tasks;
    } catch (err) {
      this.logger.error(`Failed to get tasks for userId: ${this.userId}`, {
        error: (err as Error)?.message
      });
      return undefined;
    }
  }

  async setFulltank() {
    try {
      if (!this.jwt) {
        throw new Error(`${this.userId} has no jwt token`);
      }
      this.logger.info(`Starting tank energy for userId: ${this.userId}`);
      const res = await this.request(`/api/v1/user/set-full-tank`, {
        method: "POST",
        body: JSON.stringify({ userId: this.userId }),
      });
      if (res.status === 500) {
        const data = await res.text();
        throw new Error(data);
      }

      const data = (await res.json()) as FullTankResponse;
      if (data.error) {
        throw new Error(data.error?.toString());
      }

      this.logger.info(`Successfully tanked full energy for userId: ${this.userId}`, {
        ptc: data.realtimeData.ptc,
        ptc_total: data.realtimeData.ptc_total
      });

      return data;
    } catch (err) {
      this.logger.error(`Failed to tank full energy for userId: ${this.userId}`, {
        error: (err as Error)?.message
      });
      return undefined;
    }
  }

  async getDaily() {
    try {
      if (!this.jwt) {
        throw new Error(`${this.userId} has no jwt token`);
      }
      this.logger.info(`Starting get daily for userId: ${this.userId}`);
      const res = await this.request(`/api/v1/user/get-daily`, {
        method: "POST",
        body: JSON.stringify({ userId: this.userId }),
      });
      if (res.status === 500) {
        const data = await res.text();
        throw new Error(data);
      }

      const data = (await res.json()) as DailyResponse;
      if (data.error) {
        throw new Error(data.error?.toString());
      }

      this.logger.info(`Successfully got daily`, {
        ptc: data.realtimeData.ptc,
        ptc_total: data.realtimeData.ptc_total
      });

      return data;
    } catch (err) {
      this.logger.error(`Failed to get daily`, {
        error: (err as Error)?.message
      });
      return undefined;
    }
  }
}

type FullTankResponse = {
  data: FullEnergy;
  error: null | string;
  realtimeData: RealtimeData;
};

type DailyResponse = {
  data: boolean;
  error: null | string;
  realtimeData: RealtimeData;
};
