/**
 * Example: Real-world application usage of lolog
 *
 * This example demonstrates:
 * 1. Using the @Logger decorator in services
 * 2. Child loggers for request tracking
 * 3. Proper error logging
 * 4. Contextual metadata
 */

import { Logger, ILolog } from '../index';
import logger from '../index';

// --- Domain Models ---
interface User {
  id: string;
  email: string;
  name: string;
}

// --- Service layer using Decorators ---
@Logger('UserService')
class UserService {
  // Injected by @Logger decorator
  private readonly logger!: ILolog;

  private users: User[] = [{ id: '1', email: 'john@example.com', name: 'John Doe' }];

  async getUserById(id: string): Promise<User> {
    this.logger.debug({ userId: id }, 'Fetching user from database');

    const user = this.users.find((u) => u.id === id);

    if (!user) {
      this.logger.warn({ userId: id }, 'User not found');
      throw new Error(`User ${id} not found`);
    }

    return user;
  }
}

// --- Controller / Request Handling ---
class UserController {
  private userService = new UserService();

  async handleGetRequest(req: any) {
    // 1. Create a child logger for this specific request context
    // This ensures all logs for this request share the same Trace ID
    const requestLogger = logger.child({
      traceId: req.headers['x-trace-id'] || 'internal-' + Math.random().toString(36).substring(7),
      method: 'GET',
      path: '/users/:id',
    });

    requestLogger.info({ userId: req.params.id }, 'Processing user request');

    try {
      const user = await this.userService.getUserById(req.params.id);

      requestLogger.info({ status: 200 }, 'Request completed successfully');
      return user;
    } catch (error: any) {
      // 2. Log errors with full context and stack trace
      requestLogger.error(
        {
          err: error,
          statusCode: error.message.includes('not found') ? 404 : 500,
        },
        'Failed to process user request'
      );
      throw error;
    }
  }
}

// --- Demonstration ---
async function runDemo() {
  const controller = new UserController();

  console.log('\n--- Scenario 1: Successful Request ---');
  await controller
    .handleGetRequest({
      params: { id: '1' },
      headers: { 'x-trace-id': 'req-999' },
    })
    .catch(() => {});

  console.log('\n--- Scenario 2: Failed Request (Not Found) ---');
  await controller
    .handleGetRequest({
      params: { id: 'unknown-404' },
      headers: { 'x-trace-id': 'req-1000' },
    })
    .catch(() => {});
}

runDemo();
