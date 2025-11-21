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

/** True when running in staging environment. */
export function isStagingEnv(): boolean {
  return getNodeEnv() === "staging";
}

/** True when running in local environment. */
export function isLocalEnv(): boolean {
  return getNodeEnv() === "local";
}

/** True when running in unknown environment. */
export function isUnknownEnv(): boolean {
  return getNodeEnv() === "unknown";
}

// User login password credentials
export function getUserLoginPasswordCredentials(): {
  username: string;
  password: string;
} {
  if (typeof process === "undefined" || !process.env) {
    return { username: "", password: "" };
  }

  return {
    username: process.env.USERNAME ?? "",
    password: process.env.PASSWORD ?? "",
  };
}