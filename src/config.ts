import path from "node:path";

export default {
  domain: "back.else.app",
  origin: "https://front.else.app",
  ws: 'ws-back.else.app',
  proxy: [],
  apiId: Bun.env.API_ID,
  apiHash: Bun.env.API_HASH,
  maxLifetime: 80_000, // seconds (real lifetime is 30 mins, but we get only ~28 mins to prevent errors)
  sessionsFolder: path.join(__dirname, "..", "sessions"),
  screenshotsFolder: path.join(__dirname, "..", "map"),
  referalId: "elsevbipy6ee0aem",
  // autoUpgrade: true,
  // useFastRecharge: true, // fast recharge by goods
  // checkPixelInfo: true,
  // setPixelsToMap: true,
  // screenMapDelay: 30, // seconds
  requestsDelay: {
    // seconds
    min: 1,
    max: 2,
  },
  runDelay: {
    // seconds
    onStart: 0, // Delay before run bot
    min: 1,
    max: 3,
  },
  claimDelay: {
    // seconds
    min: 1200,
    max: 4800,
  },
  random : 0.1   // random change to use boosts or make some task from 0 to 1
};
