// Environment helpers

/** Get the current NODE_ENV value (falls back to 'development' when unknown). */
export function getNodeEnv(): string {
  if (typeof process !== "undefined" && process.env && process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  }
  return "development";
}

/** True when running in production environment. */
export function isProductionEnv(): boolean {
  return getNodeEnv() === "production";
}

/** True when running in development environment. */
export function isDevelopmentEnv(): boolean {
  return getNodeEnv() === "development";
}

/** True when running in test environment. */
export function isTestEnv(): boolean {
  return getNodeEnv() === "test";
}
