# 📘 **@asafarim/shared-logging — README.md**

A lightweight, environment-agnostic logging utility shared across all ASafariM applications.

This package provides a **unified logging API** that works in:

* Browser (React UI apps)
* Node.js scripts and services
* TestRunner
* Future workers/CLI tools

It standardizes logging across the entire monorepo but **does not depend on Node-specific libraries** (like Winston).
This ensures maximum compatibility and keeps the library small and portable.

---

## 🚀 Features

* Uniform log levels (`debug`, `info`, `warn`, `error`)
* Environment-aware output:

  * Browser → readable `console.log` output
  * Node → structured JSON logs
* Optional metadata object
* Extendable by backend apps (e.g., TestRunner wraps it with Winston)
* Zero external dependencies
* Fully TypeScript typed

---

## 📦 Installation (monorepo workspace)

```sh
pnpm add @asafarim/shared-logging
```

Or automatically linked when used via:

```json
"@asafarim/shared-logging": "workspace:*"
```

---

# 📚 Usage

---

## 1. React UI (Browser)

```ts
import { createLogger } from "@asafarim/shared-logging";

const logger = createLogger("projects-ui", "info");

logger.info("Project page loaded");
logger.debug("Fetching projects...", { search: "all" });
logger.error("Failed to fetch project", { status: 500 });
```

**Output example (browser):**

```
[2025-01-10T09:12:34.123Z] [INFO] Project page loaded
```

---

## 2. Node Services (TestRunner, workers)

Basic usage:

```ts
import { createLogger } from "@asafarim/shared-logging";

const logger = createLogger("testrunner", "debug");

logger.info("Starting test run", { runId });
logger.debug("Fixture loaded", { path: file });
logger.error("Test failed", { error });
```

**Output example (Node JSON):**

```json
{
  "timestamp": "2025-01-10T09:12:34.123Z",
  "level": "info",
  "message": "Starting test run",
  "context": {
    "app": "testrunner",
    "environment": "development"
  },
  "meta": {
    "runId": "abc123"
  }
}
```

---

## 3. Extending shared logging with Winston (Recommended for TestRunner)

In TestRunner you can enhance logging:

```ts
import { createLogger } from "@asafarim/shared-logging";
import * as winston from "winston";

const base = createLogger("testrunner");

const win = winston.createLogger({
  transports: [new winston.transports.Console()],
});

export const logger = {
  info(msg: string, meta?: any) {
    base.info(msg, meta);
    win.info(msg, meta);
  },
  error(msg: string, meta?: any) {
    base.error(msg, meta);
    win.error(msg, meta);
  },
  warn(msg: string, meta?: any) {
    base.warn(msg, meta);
    win.warn(msg, meta);
  },
  debug(msg: string, meta?: any) {
    base.debug(msg, meta);
    win.debug(msg, meta);
  }
};
```

This keeps:

* shared-logging → universal logging
* winston → advanced Node-only features

---

## 4. .NET APIs (Serilog integration)

The shared logger does **not** replace Serilog.
Instead, .NET APIs use a shared Serilog extension:

```csharp
builder.AddSharedSerilog("identity-api");
app.UseRequestLoggingWithCorrelation();
```

And inside controllers:

```csharp
SharedLogger.Info("User logged in", new { userId });
SharedLogger.Error("Login failed", ex);
```

---

# 🧱 API Reference

---

## `createLogger(appName: string, level?: LogLevel)`

Creates a logger with default context.

### **Parameters:**

* `appName` → Name of the consuming app (projects-ui, testrunner, auth-ui, etc.)
* `level` → Minimum log level (`debug`, `info`, `warn`, `error`)

### **Returns:**

```ts
logger.info(message, meta?)
logger.debug(message, meta?)
logger.warn(message, meta?)
logger.error(message, meta?)
```

---

## 📌 Log Level Priority

| Level   | Description                        |
| ------- | ---------------------------------- |
| `debug` | Developer details, verbose output  |
| `info`  | Normal operation logs              |
| `warn`  | Something unexpected but not fatal |
| `error` | Errors and exceptions              |

---

# 🎯 Design Philosophy

**Shared logging SHOULD NOT depend on:**

* Winston
* Pino
* Serilog
* Browser-specific APIs
* Node-only APIs

This keeps the library:

✔ portable
✔ dependency-free
✔ compatible with React, Node, .NET
✔ safe for future microservices

Any advanced logging backend (e.g. Winston) lives **inside the app**, not inside the shared library.

---

# 🛠 Roadmap

* [ ] Correlation ID support (browser + Node)
* [ ] Structured error normalization
* [ ] Optional remote log collector adapter (Grafana Loki / ELK)
* [ ] Shared log types for distributed tracing

---

# ❤️ Contributing

All monorepo apps should rely on this logger to guarantee:

* unified log formatting
* easy filtering in future log dashboards
* consistent debugging experience

To contribute:

```sh
cd libs/shared-logging
pnpm build
```
