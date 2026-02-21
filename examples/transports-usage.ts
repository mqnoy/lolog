/**
 * Example: Using Console and File Transports
 *
 * This example shows how to configure lolog to output to both
 * the console (with pretty printing) and a local log file.
 */

import { Lolog } from '../index';

// Initialize logger with multiple transports
const logger = new Lolog('MultiTransportApp', {
  env: 'development',
  logLevel: 'debug',
  transports: [
    // 1. Console Transport
    // In development, this uses pino-pretty
    {
      type: 'console',
      level: 'debug',
    },

    // 2. File Transport
    // Logs error and above to a specific file
    {
      type: 'file',
      level: 'error',
      options: {
        destination: './logs/error.log', // Log file path
        mkdir: true, // Create directory if it doesn't exist
      },
    },

    // 3. General App Log
    {
      type: 'file',
      level: 'info',
      options: {
        destination: './logs/combined.log',
      },
    },
  ],
});

// Test logs
logger.debug('This goes to console only');
logger.info('This goes to console and combined.log');
logger.error({ errorCode: 'DB_CONN_FAIL' }, 'This goes to console, combined.log, and error.log');

console.log('Transport example initiated. Waiting for logs to flush...');

// Wait a bit for the worker threads to flush logs
setTimeout(() => {
  console.log('Check the ./logs directory for output.');
}, 1000);
