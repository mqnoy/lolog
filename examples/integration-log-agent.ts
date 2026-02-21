/**
 * Example: Integrating lolog with Grafana Loki
 *
 * In production, lolog outputs NDJSON which can be easily collected by
 * agents like Promtail or FluentBit. However, you can also send logs
 * directly from your application using Pino transports.
 */

import { Lolog } from '../logger';

// 1. Standard Production Setup (Recommended)
// Set NODE_ENV=production
// Logs will be NDJSON on stdout, which is perfect for most log agents.
const prodLogger = new Lolog('App', {
  env: 'production',
  serviceName: 'user-service',
});

prodLogger.info({ userId: '123' }, 'User logged in');
// Output: {"level":"INFO","time":"2023-10-27T10:00:00.000Z","pid":1234,"hostname":"os","service":"user-service","env":"production","userId":"123","msg":"User logged in"}

// 2. Direct Integration with Loki (Using pino-loki)
/*
First, install the transport:
npm install pino-loki
*/

/*
import pino from 'pino';

const lokiLogger = new Lolog('LokiApp', { env: 'production' }, pino({
  transport: {
    target: 'pino-loki',
    options: {
      batching: true,
      interval: 5,
      host: 'http://localhost:3100', // Your Loki host
      labels: { job: 'my-service' }
    }
  }
}));

lokiLogger.info('This log goes straight to Loki!');
*/

// 3. Integration with Datadog
/*
Datadog prefers logs in JSON format via Agent collection (tailing files or container logs).
lolog's default production format is compatible with Datadog's standard attributes.
*/

console.log('Examples loaded. Check the code for integration patterns.');
