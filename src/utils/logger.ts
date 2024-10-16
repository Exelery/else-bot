import winston from "winston";
import { format } from "winston";

const { combine, timestamp, printf, errors, json } = format;

// const readableFormat = printf(
//   ({ level, message, timestamp, userId, ...metadata }) => {
//     let metaStr = Object.keys(metadata).length ? JSON.stringify(metadata) : "";
//     return `${timestamp} [${level}] [User: ${userId}]: ${message} ${metaStr}`;
//   }
// );

const timeFormat = "YYYY-MM-DD HH:mm:ss";
const readableFormat = printf(
  ({ level, message, timestamp, userId, ...metadata }) => {
    if (message.includes("Account status update")) {
      const { balance, lvl, ppc, ptc_rps, pph, ptc, ptc_total } = metadata;
      return `${timestamp} [${level}] Account #${userId} | Balance: ${balance} | Level: ${lvl} | Points per Click: ${ppc} | Energy per second: ${ptc_rps} | Points per Hour: ${pph} | Available energy: ${ptc}/${ptc_total}`;
    } else if (message.includes("Sleeping before sending")) {
      const { points, waitTime } = metadata;
      return `${timestamp} [${level}] Account #${userId} | Sending ${points} points after ${waitTime} seconds...`;
    } else if (message.includes("Sleeping for")) {
      const { minutes, seconds } = metadata;
      return `${timestamp} [${level}] Account #${userId} | 💤 Sleeping for ${minutes}m ${seconds}s...`;
    }
    let metaStr = Object.keys(metadata).length ? JSON.stringify(metadata) : "";
    return `${timestamp} [${level}] Account #${userId} | ${message} ${metaStr}`;
  }
);
export const createLogger = (userId: string) => {
  return winston.createLogger({
    level: "info", //"info",
    format: combine(
      errors({ stack: true }),
      timestamp({ format: timeFormat }),
      json()
    ),
    defaultMeta: { userId },
    transports: [
      new winston.transports.Console({
        format: combine(
          winston.format.colorize(),
          timestamp({ format: timeFormat }),
          readableFormat
        ),
      }),
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
        format: combine(timestamp({ format: timeFormat }), json()),
      }),
      new winston.transports.File({
        filename: "logs/combined.log",
        format: combine(timestamp({ format: timeFormat }), json()),
      }),
    ],
  });
};
