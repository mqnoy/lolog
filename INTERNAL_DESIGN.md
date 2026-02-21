# 🍭 Lolog: Internal Architecture & Design Notes

This document explains the architectural decisions behind `lolog` — why things are built the way they are, and the trade-offs we made along the way. It's meant for contributors or anyone who wants to understand what's happening under the hood.

For usage details, see [README.md](./README.md).

---

## Core Philosophy

`lolog` is designed around a single principle: **you shouldn't have to think about your logger.** It should be fast, safe, and contextual by default, without requiring a configuration file or 50 lines of boilerplate.

Under the hood, everything runs on [Pino](https://github.com/pinojs/pino) — arguably the fastest structured logger in Node.js. Our job is to make Pino's power accessible without exposing its rough edges.

---

## Key Design Decisions

### 1. Worker-Based Transport (and the Formatter Constraint)

Pino 9+ offloads transport work (writing to files, formatting via `pino-pretty`) to **worker threads**. This is great for performance — the main thread never blocks on I/O.

However, it comes with a strict constraint: **you cannot use custom `formatters.level` when using `transport.targets`**. Pino enforces this because formatters run in the main thread and can't be transferred to worker threads.

We ran into this directly. The old approach of setting `formatters.level` to uppercase the level string (`info` → `INFO`) caused a runtime error when any transport target was defined.

**Our solution: use `mixin` instead.**

```typescript
mixin(_mergeObject, level) {
  return { level_label: pino.levels.labels[level]?.toUpperCase() };
}
```

This adds a `level_label` field (e.g., `"INFO"`) to every log without touching the internal `level` field that Pino uses for transport filtering. The numeric `level` field remains intact, which is what Pino's worker threads need to route logs correctly.

### 2. Transport as a Separate Stream

Because of the constraint above, we don't pass transports in the options object. Instead, we create the transport stream separately and pass it as the **second argument** to `pino()`:

```typescript
const transport = targets.length > 0 ? pino.transport({ targets }) : undefined;
return pino(options, transport as any);
```

This is the officially supported path for using both custom `formatters.bindings` (which is still allowed) and worker-based transports at the same time.

### 3. Lightweight Child Loggers

Creating a child logger is a cheap O(1) operation. We reuse the existing Pino instance and just append new bindings — no transports or formatters are re-initialized:

```typescript
constructor(context?, config?, pinoInstance?) {
  if (pinoInstance) {
    // Reuses the existing transport and options — no overhead
    this.logger = context ? pinoInstance.child({ context }) : pinoInstance;
  } else {
    this.logger = this.initialize(config);
    if (context) {
      this.logger = this.logger.child({ context });
    }
  }
}
```

The `@Logger` decorator and `.child()` method both use this path, which means decorating 50 classes costs the same as decorating 1.

### 4. The `setup()` Method for the Global Instance

The library exports a singleton default logger (`defaultLogger`). The problem is that users often want to configure it (add a service name, set up file transports) but we don't know their config at module load time.

Rather than forcing users to create a new instance and pass it everywhere, we added a `setup()` method that **replaces the internal Pino instance in-place**:

```typescript
public setup(config: LoggerConfig): void {
  const context = (this.logger as any).bindings?.()['context'];
  this.logger = this.initialize(config);
  if (context) {
    this.logger = this.logger.child({ context });
  }
}
```

`private logger` (non-readonly) makes this possible. The trade-off is that this is technically mutable state on a singleton, so **`setup()` should be called once, at the very top of the application, before any decorated classes are initialized.**

### 5. Two-Stage Level Filtering

Pino's level filtering works in two passes when using `transport.targets`:

1. **Global gate** (`logLevel`): Logs below this level are dropped immediately in the main thread and never reach any worker.
2. **Per-target gate** (`level` on each transport target): Each worker independently checks its own level before writing.

This means the global `logLevel` must be set to the **lowest** level any transport needs. For example, if you want to write `debug` to the console, `logLevel` must be `debug`, even if your file transport only accepts `error`.

---

## Log Schema

Every log line produced by `lolog` has the following shape:

```json
{
  "level": 30,
  "level_label": "INFO",
  "time": "2026-02-21T01:14:42.937Z",
  "pid": 12345,
  "host": "my-server",
  "node_version": "v22.x.x",
  "service": "my-service",
  "env": "production",
  "msg": "User logged in"
}
```

| Field | Source | Notes |
| :--- | :--- | :--- |
| `level` | Pino internal | Numeric. Used by transports for level filtering. |
| `level_label` | `mixin` | String uppercase version. For human readability. |
| `time` | `pino.stdTimeFunctions.isoTime` | ISO 8601 format. |
| `pid` | `formatters.bindings` | Process ID. |
| `host` | `formatters.bindings` | Remapped from Pino's `hostname`. |
| `node_version` | `formatters.bindings` | Helps debug runtime version issues. |
| `service` | `formatters.bindings` | From `LoggerConfig.serviceName`. |
| `env` | `formatters.bindings` | From `LoggerConfig.env` or `NODE_ENV`. |
| `msg` | User-provided | The log message. |

---

## Security: Redaction at the Engine Level

Redaction is handled by Pino's native `redact` option. It runs **before serialization**, meaning sensitive values are never converted to a string — they're replaced with `***` at the object level. This is safer than post-serialization string replacement.

Default redacted paths:
- `password`, `token`, `accessToken`, `refreshToken`, `secret`
- `authorization`, `headers.authorization`, `req.headers.authorization`

Users can override this entirely via `LoggerConfig.redact`.

---

## Known Trade-offs

| Trade-off | Why |
| :--- | :--- |
| `setup()` mutates a singleton | Avoids forcing users to inject a configured instance everywhere. Call it once, early. |
| No custom `formatters.level` with transports | Pino 9+ constraint. We use `mixin` instead, which adds `level_label`. |
| Transports require a flush delay in scripts | Worker threads are async. Short-lived Node scripts must `setTimeout` before exiting. |
| Wrapper adds a thin overhead | One function call per log. Negligible in practice, but it's not zero. |
| Opinionated defaults | Works great for 95% of apps. For very custom Pino setups, use Pino directly. |
