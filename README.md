# 🍭 lolog

Logging shouldn't be a bottleneck or a chore. `lolog` is a small, honest wrapper around [Pino](https://github.com/pinojs/pino) that handles the boring boilerplate so you don't have to — environment-specific output, secret redaction, and class-based context, all out of the box.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue)](https://www.typescriptlang.org/)

> [!CAUTION]
> **v1.0.0 contains breaking changes.** If you are upgrading from `v0.0.7`, please read the [Migration Guide](#migrating-from-v007-to-v100) at the bottom of this page.

---

## Why lolog?

Most teams end up writing the same setup code for Pino or Winston on every project: pretty-print in dev, JSON in prod, redact passwords, add a service name... It's always the same 50 lines. `lolog` does that for you:

- **Built for Speed** — Uses Pino internally, the fastest Node.js logger.
- **Context-Aware** — Decorators and child loggers tag your logs automatically.
- **Pretty in Dev, Clean in Prod** — Switches output automatically based on `NODE_ENV`.
- **Secure by Default** — `password`, `token`, `authorization`, and friends are redacted automatically.
- **Easy to Configure** — One `setup()` call at the top of your app is all it takes.

---

## Installation

```bash
pnpm add @mqnoy/lolog
# or
npm install @mqnoy/lolog
```

---

## Quick Start

The default export is a pre-configured logger instance. It just works.

```typescript
import logger from '@mqnoy/lolog';

logger.info('Server started');
logger.warn({ diskSpace: '2%' }, 'Storage running low');

try {
  connectToDatabase();
} catch (err) {
  // Always put the Error object first — it ensures the stack trace is captured
  logger.error(err, 'Failed to connect to the database');
}
```

---

## Global Configuration

Call `logger.setup()` once at the very top of your app entry point (e.g., `index.ts`). This configures the global logger instance that all decorated classes and child loggers inherit from.

```typescript
import logger from '@mqnoy/lolog';

logger.setup({
  env: 'production',      // 'development' | 'production' — defaults to NODE_ENV
  serviceName: 'order-api',
  logLevel: 'info',       // 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  transports: [
    { type: 'console', level: 'info' },
    {
      type: 'file',
      level: 'error',
      options: { destination: './logs/error.log' },
    },
  ],
});
```

### Transport Options

Each transport in the `transports` array accepts the following shape:

```typescript
{
  type: 'console' | 'file';
  level?: string;           // minimum level for this transport
  options?: {
    destination?: string;   // file path, for 'file' type only
    mkdir?: boolean;        // auto-create the directory, defaults to true
    colorize?: boolean;     // pino-pretty options, for 'console' type
    [key: string]: any;     // any other pino-pretty / pino/file option
  };
}
```

> **Note on `level`:** Pino applies level filtering in two stages. The global `logLevel` acts as the first gate — logs below it are dropped immediately. Each transport's `level` then acts as a second filter. Always set the global `logLevel` to the **lowest** level any transport needs.

---

## Usage with Decorators

The `@Logger` decorator automatically injects a contextual logger into your class. The `context` field in your logs will be set to the class name (or whatever string you pass in).

```typescript
import { Logger, ILolog } from '@mqnoy/lolog';

@Logger('UserService')
class UserService {
  private readonly logger!: ILolog;

  async findById(id: string) {
    this.logger.debug({ userId: id }, 'Fetching user from database');
    // → log will include { context: 'UserService', userId: '...' }
  }
}
```

> **Important**: Call `logger.setup()` **before** any classes using `@Logger` are initialized. Otherwise they'll use the default configuration.

---

## Child Loggers

Child loggers are perfect for request-scoped tracing. Every log from a child inherits its parent's configuration and appends its own fields.

```typescript
const requestLogger = logger.child({
  traceId: req.headers['x-trace-id'],
  method: req.method,
  path: req.path,
});

requestLogger.info('Request received');
requestLogger.debug({ userId: '42' }, 'Looking up user');
// Every log above will include the traceId, method, and path
```

---

## Multiple Transports

You can fan out logs to multiple destinations simultaneously. Each transport has its own level filter, so you can, for example, send everything to the console but only errors to a file.

```typescript
import { Lolog } from '@mqnoy/lolog';

const logger = new Lolog('MyApp', {
  env: 'development',
  logLevel: 'debug',
  transports: [
    { type: 'console', level: 'debug' },           // colorized dev output
    { type: 'file', level: 'error', options: { destination: './logs/error.log' } },
    { type: 'file', level: 'info',  options: { destination: './logs/combined.log' } },
  ],
});

logger.debug('This goes to console only');
logger.info('This goes to console and combined.log');
logger.error({ code: 'ERR_DB' }, 'This goes everywhere');
```

> **Note for short-lived scripts**: Pino transports run in worker threads. If your process exits immediately after logging, add a short delay (e.g., `setTimeout(() => {}, 1000)`) to let the workers flush to disk.

---

## Development vs Production

`lolog` switches its output format automatically based on `NODE_ENV`:

| Environment | Output | Details |
| :--- | :--- | :--- |
| **Development** | Pretty, colorized (`pino-pretty`) | PID, hostname, and service metadata are hidden to keep the terminal clean |
| **Production** | Raw NDJSON | Structured JSON on stdout, ready for Datadog, CloudWatch, ELK, or Promtail |

---

## Automatic Redaction

`lolog` redacts the following fields by default. They'll appear as `***` in your logs:

`password`, `token`, `accessToken`, `refreshToken`, `secret`, `authorization`, `headers.authorization`, `req.headers.authorization`

You can override this with a custom `redact` config:

```typescript
logger.setup({
  redact: {
    paths: ['user.ssn', 'payment.cvv'],
    censor: '[REDACTED]',
  },
});
```

---

## Migrating from v0.0.7 to v1.0.0

V1 is a ground-up rewrite. The class is still called `Lolog`, but almost everything under the hood changed. Here's what you need to update:

### What Changed

| Feature | v0.0.7 (old) | v1.0.0 (new) |
| :--- | :--- | :--- |
| **Engine** | Winston | **Pino** |
| **Error argument order** | `(message, error)` | **`(error, message)`** |
| **Child logger method** | `.setChild()` | **`.child()`** |
| **Configuration** | Constructor only | **`logger.setup()` + constructor** |
| **Level labels** | Numeric in JSON | **String `level_label` field** |

### 1. Fix Error Logging

Pino serializes Error objects correctly only when they're the **first** argument.

```typescript
// Before (v0.x)
logger.error('Database failed', err);

// After (v1.0)
logger.error(err, 'Database failed');
```

### 2. Fix Child Loggers

```typescript
// Before (v0.x)
const child = logger.setChild({ requestId: '123' });

// After (v1.0)
const child = logger.child({ requestId: '123' });
```

### 3. Add Global Setup (Optional but Recommended)

Rather than passing config to every `new Lolog()`, configure the global instance once:

```typescript
// index.ts — at the very top, before any other imports that use @Logger
import logger from '@mqnoy/lolog';

logger.setup({
  serviceName: 'my-service',
  logLevel: 'debug',
});
```

---

Built with care for the production Node.js ecosystem. Issues and contributions are welcome on [GitHub](https://github.com/mqnoy/lolog).
