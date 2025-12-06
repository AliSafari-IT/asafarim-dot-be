// src/utils/logger.ts
import { createLogger } from "@asafarim/shared-logging";

export const logger = createLogger("notes-ui", "debug");

// Example usage
logger.info("Page loaded", { path: window.location.pathname });

logger.error(
  "Failed to fetch notes",
  { endpoint: "/api/notes" },
  { userId: "123" },
  new Error("Network error")
);
