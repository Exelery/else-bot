export type League = "bronze" | "silver" | "gold" | "platinum";

export type Startup = {
  data: {
    accumulatedPoints: number;
    justCreated: boolean;
    jwt: string;
  };
  error: string | null;
  realtimeData: RealtimeData;
};

export type RealtimeData = {
  balance: number;
  lvl: number;
  ppc: number;
  pph: number;
  pps: number;
  ptc: number;
  ptc_rps: number;
  ptc_total: number;
  pst: number;
  uid: string;
  ms: number;
};

export type UserResponse = {
  data: UserInfo;
  error: string | null;
  realtimeData: RealtimeData;
};

export type UserInfo = {
  full_energy: FullEnergy;
  boost: Boosts;
  notification: {
    inform3DaysIdle: boolean;
  };
  pd?: {
    birthday: string;
    gender: string;
    country: string;
    city: string;
  };
  _id: string;
  tg_user_id: string;
  chat_id: string;
  day_at_row: number;
  is_got_dar: boolean;
  avatar: string;
  name: string;
  last_name: string;
  nickname: string;
  is_new: boolean;
  last_activity: string;
  country: string;
  initCountry: string;
  userAgent: string;
};

export type FullEnergy = {
  count: number;
  cooldown: number;
};

export type Boosts = {
  multitap: BoostInfo;
  "energy-limit": BoostInfo;
};

export type BoostInfo = {
  level: number;
  price: number;
  profit: number;
};

export type LevelName =
  | "Ground"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Titanium"
  | "Palladium"
  | "Platinum"
  | "Sapphire"
  | "Emerald"
  | "Diamond"
  | "Ultimate";

// Type for a single level entry
type LevelEntry = {
  name: LevelName; // Type for the level name
  points: number | null; // Points can be a number or null
};

export type UserConfig = {
  data: Array<{
    _id?: string;
    name: string;
    group: string;
    value: number | number[] | Record<string, number> | Array<LevelEntry>;
    description: string;
    __v?: number; // Optional since it's not present in every object
  }>;
  error: string | null;
  realtimeData: RealtimeData;
};
