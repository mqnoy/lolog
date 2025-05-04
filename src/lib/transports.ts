import winston from "winston";

export const ConsoleTransport = () => new winston.transports.Console();
export const FileTransport = (
  options?: winston.transports.FileTransportOptions
) =>
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
    ...options,
  });
