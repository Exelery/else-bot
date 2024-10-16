import type { RealtimeData } from "./users";

type Task = {
  _id: string;
  name: string;
  description: string;
  profit: number;
  url: string;
  type: string;
  image: string;
  icon: string;
  iconColor: string;
  taskStatus: "approved" | "pending" | "rejected"; // Assuming these are possible statuses
  value?: string; // Optional, only present for referral tasks
  chat_id?: number; // Optional, only present for Telegram subscription tasks
};

export type Tasks = {
  data: {
    tasks: Task[];
    total: {
      totalCount: number;
    };
  };
  error: null | string; // Assuming error can be a string if present
  realtimeData: RealtimeData;
};
