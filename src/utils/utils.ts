import { TcpTransport } from "@mtcute/bun";

import { HttpProxyTcpTransport } from "@mtcute/http-proxy";

import config from "../config";

export const isObject = (obj: unknown): obj is object =>
  obj != null && obj.constructor.name === "Object";

export const isDataObj = <T>(data: unknown, keys: string[]): data is T => {
  if (!isObject(data)) {
    return false;
  }

  return keys.every((key) => key in data);
};

export const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min) + min);

export const randDelay = (min: number, max: number) =>
  Math.floor((Math.random() * (max - min) + min) * 1000);

export const getRandomProxy = (): string =>
  config.proxy[Math.floor(Math.random() * config.proxy.length)];

export const getTransportByConfig = (proxy?: string) => {
  // if (!config.proxy.length || !proxy) {
  if (!proxy) {
    return new TcpTransport();
  }

  // const proxyUrl = new URL(getRandomProxy());
  const proxyUrl = new URL(proxy);
  const { hostname: host, username: user, password, port } = proxyUrl;

  return new HttpProxyTcpTransport({
    host,
    port: +port,
    user,
    password,
  });
};

class Utils {
  randClaimDelay = () =>
    randDelay(config.claimDelay.min, config.claimDelay.max);

  randRunDelay = () => randDelay(config.runDelay.min, config.runDelay.max);

  randLongRunDelay = () =>
    randDelay(config.runDelay.min * 10, config.runDelay.max * 1000);

  randRequestDelay = () =>
    randDelay(config.requestsDelay.min, config.requestsDelay.max);

  randomRoll(multiply?: number): boolean {
    return Math.random() < config.random * (multiply ?? 1);
  }

  generatePoints(ppc: number, ptc: number): number {
    // Определяем максимальное количество шагов, которые кратны ppc и меньше ptc
    let maxSteps = Math.floor(ptc / ppc); // Максимально возможное количество шагов

    maxSteps = Math.min(maxSteps, 200);

    // Генерируем случайное количество шагов от 1 до maxSteps
    const randomSteps = randInt(1, maxSteps);

    // Возвращаем итоговое количество поинтов
    return randomSteps * ppc;
  }

  randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export const utils = new Utils();
