import { ecsFormat } from "@elastic/ecs-winston-format";
import winston from "winston";
import { isEcsError } from "./error.js";

interface ElasticFormatConfig {
  convertErr?: boolean;
  convertReqRes?: boolean;

  apmIntegration?: boolean;

  serviceName?: string;
  serviceVersion?: string;
  serviceEnvironment?: string;
  serviceNodeName?: string;
  eventDataset?: string;
}

export const ElasticFormat = (
  opts?: ElasticFormatConfig
): winston.Logform.Format => {
  return winston.format.combine(
    winston.format.errors({ stack: true }),
    ecsFormat(opts)
  );
};

export const PrintfFormat = (): winston.Logform.Format => {
  return winston.format.printf(
    ({ timestamp, level, message, error, ...meta }) => {
      const stack = isEcsError(error)
        ? error.stack_trace || error.stack
        : undefined;

      const metaStr =
        Object.keys(meta).length && `\nmeta: ${JSON.stringify(meta, null, 2)}`;

      return `[${timestamp}] [${level.toUpperCase()}]: ${message}${
        stack ? `\n${stack}` : ""
      }${metaStr}`;
    }
  );
};

interface DefaultFormatOptions {
  format?: winston.Logform.Format[];
}

export const DefaultFormat = (opts?: DefaultFormatOptions) => {
  let formats: winston.Logform.Format[] = [
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    PrintfFormat(),
  ];

  if (opts?.format) {
    formats = opts.format;
  }

  return winston.format.combine(...formats);
};
