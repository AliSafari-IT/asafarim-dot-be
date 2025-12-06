import { createLogger } from "@asafarim/shared-logging";
import * as winston from "winston";

// 1️⃣ Base shared logger (browser/node safe)
const baseLogger = createLogger("test-runner", "info");

// 2️⃣ Winston instance for Node.js formatting + transports
const winstonLogger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}] ${message}`;
        })
    ),
    transports: [new winston.transports.Console()]
});

// 3️⃣ Final logger that merges shared-logging + Winston backend
export const logger = {
    info(message: string, meta?: any) {
        baseLogger.info(message, meta);
        winstonLogger.info(message, meta);
    },
    error(message: string, meta?: any) {
        baseLogger.error(message, meta);
        winstonLogger.error(message, meta);
    },
    warn(message: string, meta?: any) {
        baseLogger.warn(message, meta);
        winstonLogger.warn(message, meta);
    },
    debug(message: string, meta?: any) {
        baseLogger.debug(message, meta);
        winstonLogger.debug(message, meta);
    },
};
