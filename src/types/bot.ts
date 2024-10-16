import type { SessionData } from "./sessions";
import type { WebSocket } from "ws";
import type { UserInfo } from "./users";
export type PixelInput = [x: number, y: number];

export type Account = {
  // id: number; // it isn't user id
  userId: number;
  sessionData: SessionData;
  balance: number;
  jwt: string | null;
  // ws: null | WebSocket;
  startupData: string | null;
  lastRenewAt: number;
  lastErrorAt: number;
  info?: UserInfo
  
};


