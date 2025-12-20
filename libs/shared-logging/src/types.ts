export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  app?: string;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  environment?: string;
  [key: string]: unknown;
}

export interface LogError {
  name: string;
  message: string;
  stack?: string;
}

export interface LogEvent {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  meta?: unknown;
  error?: LogError;
}
