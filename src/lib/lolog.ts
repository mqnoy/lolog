import winston, { LogEntry } from "winston";
import { AppEnvironmentsType } from "./environment.js";
import { DefaultFormat } from "./format.js";
import { customLevels, LogLevel } from "./level.js";
import { ConsoleTransport } from "./transports.js";
import { serializeError } from "./error.js";

interface LoggerOptions extends winston.LoggerOptions {
  // TODO: currently not used
  environment?: AppEnvironmentsType;
}

interface LologContract {
  getInstanceLog(): winston.Logger;
  setChild(options: Object): LologContract;
  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void;
  error(message: string | Error, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

export class Lolog implements LologContract {
  private logger: winston.Logger;

  constructor(options?: LoggerOptions) {
    winston.addColors(customLevels.colors);

    this.logger = winston.createLogger({
      level: options?.level || "info",
      levels: customLevels.levels,
      format: options?.format && DefaultFormat(),
      transports: options?.transports ?? [ConsoleTransport()],
      ...options,
    });
  }

  getInstanceLog = () => this.logger;

  setChild = (options: Object): LologContract => {
    return new Lolog({
      defaultMeta: { ...options },
    });
  };

  log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
    this.logger.log({
      level,
      message,
      ...meta,
    } as LogEntry);
  };

  error(message: string | Error, meta?: Record<string, unknown>) {
    if (message instanceof Error) {
      this.log("error", message.message, {
        error: serializeError(message),
        ...meta,
      });
    } else {
      this.log("error", message, meta);
    }
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log("warn", message, meta);
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log("info", message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.log("debug", message, meta);
  }
}
