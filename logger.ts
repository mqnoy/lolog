/* eslint-disable @typescript-eslint/no-explicit-any */
import pino, { LoggerOptions, Logger as PinoLogger } from 'pino';

export interface TransportConfig {
  type: 'console' | 'file';
  level?: string;
  options?: Record<string, any>;
}

export interface LoggerConfig {
  env?: string;
  logLevel?: string;
  serviceName?: string;
  redact?: string[] | { paths: string[]; censor?: string; remove?: boolean };
  transports?: TransportConfig[];
}

export interface ILolog {
  level: string;
  info(msg: string, ...args: any[]): void;
  info(obj: object, msg?: string, ...args: any[]): void;
  warn(msg: string, ...args: any[]): void;
  warn(obj: object, msg?: string, ...args: any[]): void;
  error(msg: string, ...args: any[]): void;
  error(obj: object, msg?: string, ...args: any[]): void;
  debug(msg: string, ...args: any[]): void;
  debug(obj: object, msg?: string, ...args: any[]): void;
  trace(msg: string, ...args: any[]): void;
  trace(obj: object, msg?: string, ...args: any[]): void;
  fatal(msg: string, ...args: any[]): void;
  fatal(obj: object, msg?: string, ...args: any[]): void;
  setChild(bindings: Record<string, any>): ILolog;
  child(bindings: Record<string, unknown>): ILolog;
}

export class Lolog implements ILolog {
  private logger: PinoLogger;

  constructor(context?: string, config?: LoggerConfig, pinoInstance?: PinoLogger) {
    if (pinoInstance) {
      this.logger = context ? pinoInstance.child({ context }) : pinoInstance;
    } else {
      this.logger = this.initialize(config);
      if (context) {
        this.logger = this.logger.child({ context });
      }
    }
  }

  /**
   * Reconfigures the logger instance with new settings.
   * Useful for the default exported logger.
   */
  public setup(config: LoggerConfig): void {
    const context = (this.logger as any).bindings?.()['context'];
    this.logger = this.initialize(config);

    if (context) {
      this.logger = this.logger.child({ context });
    }
  }

  private initialize(config?: LoggerConfig): PinoLogger {
    const env = config?.env || process.env['NODE_ENV'] || 'development';
    const logLevel = config?.logLevel || process.env['LOG_LEVEL'] || 'debug';
    const isProduction = env === 'production';

    const options = this.assemblePinoOptions(config, env, logLevel);
    const targets = this.resolveTransportTargets(config, isProduction, logLevel);

    const transport = targets.length > 0 ? pino.transport({ targets }) : undefined;

    return pino(options, transport as any);
  }

  private assemblePinoOptions(config: LoggerConfig | undefined, env: string, logLevel: string): LoggerOptions {
    const options: LoggerOptions = {
      level: logLevel,
      redact: config?.redact || {
        paths: this.getDefaultRedactPaths(),
        censor: '***',
      },
      formatters: {
        bindings: (bindings) => ({
          pid: bindings['pid'],
          host: bindings['hostname'],
          node_version: process.version,
          service: config?.serviceName || 'typescript-boilerplate',
          env: env,
        }),
      },
      mixin(_mergeObject, level) {
        return { level_label: pino.levels.labels[level]?.toUpperCase() };
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      serializers: {
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
      },
    };

    return options;
  }

  private resolveTransportTargets(config: LoggerConfig | undefined, isProduction: boolean, logLevel: string): any[] {
    const transports = config?.transports || [];

    // If no transports are defined, we provide a reasonable default for non-production environments
    if (transports.length === 0 && !isProduction) {
      return [this.getConsoleTransport(false, logLevel)];
    }

    return transports.map((t) => {
      if (t.type === 'file') {
        return this.getFileTransport(t, logLevel);
      }
      return this.getConsoleTransport(isProduction, t.level || logLevel, t.options);
    });
  }

  private getConsoleTransport(isProduction: boolean, level: string, customOptions?: any): any {
    if (isProduction) {
      return {
        target: 'pino/file',
        level,
        options: customOptions || {},
      };
    }

    return {
      target: 'pino-pretty',
      level,
      options: customOptions || {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname,service,env,node_version',
      },
    };
  }

  private getFileTransport(t: TransportConfig, defaultLevel: string): any {
    return {
      target: 'pino/file',
      level: t.level || defaultLevel,
      options: {
        destination: t.options?.['destination'] || 'app.log',
        mkdir: true,
        ...t.options,
      },
    };
  }

  private getDefaultRedactPaths(): string[] {
    return [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'authorization',
      'headers.authorization',
      'req.headers.authorization',
    ];
  }

  get level(): string {
    return this.logger.level;
  }

  info(arg1: any, arg2?: any, ...args: any[]): void {
    this.logger.info(arg1, arg2, ...args);
  }

  warn(arg1: any, arg2?: any, ...args: any[]): void {
    this.logger.warn(arg1, arg2, ...args);
  }

  error(arg1: any, arg2?: any, ...args: any[]): void {
    this.logger.error(arg1, arg2, ...args);
  }

  debug(arg1: any, arg2?: any, ...args: any[]): void {
    this.logger.debug(arg1, arg2, ...args);
  }

  trace(arg1: any, arg2?: any, ...args: any[]): void {
    this.logger.trace(arg1, arg2, ...args);
  }

  fatal(arg1: any, arg2?: any, ...args: any[]): void {
    this.logger.fatal(arg1, arg2, ...args);
  }

  setChild(bindings: Record<string, any>): ILolog {
    return new Lolog(undefined, undefined, this.logger.child(bindings));
  }

  child(bindings: Record<string, unknown>): ILolog {
    return this.setChild(bindings);
  }
}

const defaultLogger = new Lolog();

export { defaultLogger as logger };
export default defaultLogger;
