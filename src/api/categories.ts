import { sleep } from "bun";
import type { RealtimeData } from "../types/users";
import { utils } from "../utils/utils";
import BaseRequest from "./base";
import { sample } from "lodash";
export class CategoryRequest extends BaseRequest {
  async getAll() {
    try {
      this.logger.info(`Fetching all categories...`);
      const response = await this.request(
        `/api/v1/item/categories?userId=${this.userId}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      this.logger.info(`Successfully fetched categories`);
      return data as CategoriesResponse;
    } catch (err) {
      this.logger.error(`Failed to fetch categories`, {
        error: (err as Error)?.message
      });
      return undefined;
    }
  }

  async getCategoryInfo(categoryId: string) {
    try {
      console.log(
        `Fetching category info for userId: ${this.userId}, categoryId: ${categoryId}...`
      );
      const response = await this.request(
        `/api/v1/item?userId=${this.userId}&categoryId=${categoryId}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      console.log(
        `Successfully fetched category info for userId: ${this.userId}, categoryId: ${categoryId}`
        // data
      );
      return data as CategoryInfoResponse;
    } catch (err) {
      console.error(
        `Failed to fetch category info for userId: ${
          this.userId
        }, categoryId: ${categoryId}, reason: ${(err as Error)?.message}`
      );
      return undefined;
    }
  }

  async purchaseItem(itemId: string, levelToBuy: number) {
    const body = {
      userId: this.userId,
      itemId,
      levelToBuy,
    };

    try {
      this.logger.info(`Purchasing item, itemId: ${itemId}, levelToBuy: ${levelToBuy}...`);
      const response = await this.request(`/api/v1/item/purchase`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as PurchaseResponse;

      if (data.error) {
        throw new Error(data.error);
      }

      this.logger.info(`Successfully purchased item, itemId: ${itemId}, levelToBuy: ${levelToBuy}`);
      return data;
    } catch (err) {
      this.logger.error(`Failed to purchase item, itemId: ${itemId}, levelToBuy: ${levelToBuy}`, {
        error: (err as Error)?.message
      });
      return undefined;
    }
  }

  async getAvailableItemsInCategory(categoryId: string) {
    try {
      this.logger.info(`Fetching available items in category, categoryId: ${categoryId}...`);
      const allItems = await this.getCategoryInfo(categoryId);

      if (allItems) {
        const availableItems = allItems.data.filter(
          (el) => !el.limitation.disabled
        );
        this.logger.info(`Successfully fetched available items in category, categoryId: ${categoryId}, total: ${availableItems.length}`);
        return availableItems;
      }
    } catch (err) {
      this.logger.error(`Failed to fetch available items in category, categoryId: ${categoryId}`, {
        error: (err as Error)?.message
      });
      return undefined;
    }
  }

  async getAvailableItem(balance: number) {
    let itemForBuy;
    const alreadyCheckedIds: string[] = [];

    do {
      try {
        this.logger.info(`Searching for available item within budget, balance: ${balance}...`);
        const categories = await this.getAll();

        if (categories) {
          await sleep(utils.randRequestDelay());
          const categoryIds = categories.data
            .map((el) => el._id)
            .filter((el) => !alreadyCheckedIds.includes(el));
          const categoryId = sample(categoryIds);

          if (categoryId) {
            const items = await this.getAvailableItemsInCategory(categoryId);
            await sleep(utils.randRequestDelay());
            alreadyCheckedIds.push(categoryId);
            if (items?.find((el) => el.price < balance)) {
              itemForBuy = sample(items.filter((el) => el.price < balance));
              this.logger.info(`Found available item within budget, name: ${itemForBuy?.name}, lvl: ${itemForBuy?.nextLevel}`);
            }
          } else {
            this.logger.info(`No available categories, attempts: ${categoryIds.length}/9`);
            return undefined;
          }
        }
      } catch (err) {
        this.logger.error(`Failed to find available item within budget`, {
          error: (err as Error)?.message
        });
      }
    } while (!itemForBuy);

    return itemForBuy;
  }

  async findAndBuy(balance: number) {
    const item = await this.getAvailableItem(balance);

    await sleep(utils.randRequestDelay());
    if (!item) {
      this.logger.error(`No items to buy`);
    } else {
      const response = await this.purchaseItem(item._id, item.nextLevel);
      await sleep(utils.randRequestDelay());
      return response;
    }
  }
}
type CategoryData = {
  _id: string;
  name: string;
  description: string;
  image: string;
  order: number;
  total: number;
  used: number;
};

type CategoriesResponse = {
  data: CategoryData[];
  error: string | null;
  realtimeData: RealtimeData;
};

// Type definition for the parent object inside the "limitation" property
type Parent = {
  item_id: string;
  level: number;
  name: string;
};

// Type definition for the "limitation" object inside each item
type Limitation = {
  friends: number;
  ttl: number | null;
  show_in_country: string[];
  level: number;
  disabled: boolean;
  parent?: Parent; // Optional property
};

// Type definition for individual items inside the "data" array
type ItemData = {
  _id: string;
  name: string;
  description: string;
  order: number;
  limitation: Limitation;
  currentLevel: number;
  nextLevel: number;
  price: number;
  profit: number;
  nextProfit: number;
  image: string;
  cooldown?: number | null; // Optional property
};

// Type definition for the overall response object
type CategoryInfoResponse = {
  data: ItemData[];
  error: string | null;
  realtimeData: RealtimeData;
};

interface PurchaseResponse {
  data: {
    _id: string;
    item_id: string;
    user_id: string;
    __v: number;
    cooldown: string | null;
    created_at: string;
    level: number;
    updated_at: string;
  };
  error: string | null;
  realtimeData: RealtimeData;
}
