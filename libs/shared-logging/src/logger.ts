import { LogContext, LogEvent, LogLevel, LogError } from "./types";

const isBrowser =
  typeof window !== "undefined" && typeof window.document !== "undefined";

export interface LoggerOptions {
  /** Static context applied to every log (e.g. app name) */
  defaultContext?: LogContext;
  /** Minimum level to output (debug/info/warn/error) */
  level?: LogLevel;
}

/**
 * Simple level ordering for filtering.
 */
const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export class Logger {
  private defaultContext: LogContext;
  private minLevel: LogLevel;

  constructor(options?: LoggerOptions) {
    this.defaultContext = options?.defaultContext ?? {};
    this.minLevel = options?.level ?? "debug";
  }

  /**
   * Returns a new logger with extra default context merged in.
   */
  withContext(context: LogContext): Logger {
    return new Logger({
      defaultContext: {
        ...this.defaultContext,
        ...context,
      },
      level: this.minLevel,
    });
  }

  debug(message: string, meta?: unknown, context?: LogContext, error?: unknown) {
    this.logInternal("debug", message, meta, context, error);
  }

  info(message: string, meta?: unknown, context?: LogContext, error?: unknown) {
    this.logInternal("info", message, meta, context, error);
  }

  warn(message: string, meta?: unknown, context?: LogContext, error?: unknown) {
    this.logInternal("warn", message, meta, context, error);
  }

  error(message: string, meta?: unknown, context?: LogContext, error?: unknown) {
    this.logInternal("error", message, meta, context, error);
  }

  private logInternal(
    level: LogLevel,
    message: string,
    meta?: unknown,
    context?: LogContext,
    error?: unknown
  ) {
    if (!this.shouldLog(level)) return;

    const mergedContext: LogContext = {
      ...this.defaultContext,
      ...context,
    };

    const evt: LogEvent = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: Object.keys(mergedContext).length ? mergedContext : undefined,
      meta,
      error: this.normalizeError(error),
    };

    if (isBrowser) {
      this.logBrowser(evt);
    } else {
      this.logNode(evt);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return levelOrder[level] >= levelOrder[this.minLevel];
  }

  private normalizeError(err: unknown): LogError | undefined {
    if (!err) return undefined;
    if (err instanceof Error) {
      return {
        name: err.name,
        message: err.message,
        stack: err.stack,
      };
    }

    if (typeof err === "string") {
      return {
        name: "Error",
        message: err,
      };
    }

    return {
      name: "Error",
      message: "Unknown error",
    };
  }

  private logBrowser(evt: LogEvent) {
    const { level } = evt;
    const logFn =
      level === "error"
        ? console.error
        : level === "warn"
        ? console.warn
        : level === "debug"
        ? console.debug
        : console.log;

    // Nice readable format in devtools
    logFn(
      `[${evt.timestamp}] [${evt.level.toUpperCase()}] ${evt.message}`,
      {
        context: evt.context,
        meta: evt.meta,
        error: evt.error,
      }
    );
  }

  private logNode(evt: LogEvent) {
    // Structured JSON logging for backends / node services
    // Works well with Docker, systemd, ELK, etc.
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(evt));
  }
}

/**
 * Factory for a logger with minimal config
 */
export function createLogger(appName: string, level: LogLevel = "info") {
  return new Logger({
    defaultContext: {
      app: appName,
      environment: process.env.NODE_ENV ?? "development",
    },
    level,
  });
}
