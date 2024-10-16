import {
  MemoryStorage,
  TelegramClient,
  tl,
  type TransportFactory,
} from "@mtcute/bun";

import config from "./config";
import type { SessionData } from "./types/sessions";
import { getTransportByConfig } from "./utils/utils";
import { parse } from "@telegram-apps/init-data-node";

const { apiId, apiHash } = config;

export async function getInitData(sessionData: SessionData) {
  const tg = new TelegramClient({
    apiId,
    apiHash,
    disableUpdates: true,
    storage: new MemoryStorage(),
    transport: getTransportByConfig as TransportFactory,
  });

  await tg.start({
    session: sessionData.session,
  });

  const peer = await tg.resolvePeer("else_app_bot");
  // console.log("peer", peer);
  const inputBotApp: tl.RawInputBotAppShortName = {
    _: "inputBotAppShortName",
    botId: peer as unknown as tl.TypeInputUser,
    shortName: "start",
  };

  const webViewData = await tg.call({
    _: "messages.requestAppWebView",
    peer,
    writeAllowed: true,
    platform: "android", // it doesn't matter, it's not used in initData
    startParam: `ref=${config.referalId}`,
    app: inputBotApp,
  });

  console.log("full", webViewData.url);
  const webAppData = webViewData.url
    .split("#tgWebAppData=")?.[1]
    ?.split("&")?.[0];

  await tg.close();
  // console.log(decodeURIComponent(webAppData));
  // return decodeURIComponent(webAppData);
  const initData = parse(decodeURIComponent(webAppData));
  // console.log(encodeURIComponent(btoa(decodeURIComponent(webAppData))));
  console.log("initData", initData);
  const startupData = `userId=${initData.user?.id}&avatar=${
    initData.user?.photoUrl ?? ""
  }&name=${initData.user?.firstName}&lastName=${
    initData.user?.lastName ?? ""
  }&nickname=${initData.user?.username ?? ""}&ref=${
    config.referalId
  }&sign=${encodeURIComponent(btoa(decodeURIComponent(webAppData)))}`;

  return startupData;
}
