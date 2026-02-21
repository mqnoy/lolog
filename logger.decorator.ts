/* eslint-disable @typescript-eslint/no-explicit-any */
import logger from './logger';

/**
 * Class decorator that injects a child logger with the class name as context.
 */
export function Logger(context?: string) {
  return function (constructor: any, _context?: any) {
    const loggerContext = context || constructor.name;
    const childLogger = logger.child({ context: loggerContext });

    // Attach to the static property of the class
    Object.defineProperty(constructor, 'logger', {
      value: childLogger,
      writable: false,
      configurable: true,
    });

    // Attach to the instance prototype so it's available via this.logger
    Object.defineProperty(constructor.prototype, 'logger', {
      get() {
        return childLogger;
      },
      configurable: true,
    });
  };
}
