const mockChildLogger = {
  info: jest.fn(),
};

// Mock the main logger
jest.mock('../logger', () => ({
  __esModule: true,
  default: {
    child: jest.fn(() => mockChildLogger),
  },
}));

import { Logger } from '../logger.decorator';
import logger from '../logger';

describe('Logger Decorator', () => {
  it('should inject a child logger into a class', () => {
    // Arrange
    @Logger('TestClass')
    class TestClass {}

    // Act
    const instance = new TestClass();
    const anyInstance = instance as any;
    const anyClass = TestClass as any;

    // Assert
    expect(logger.child).toHaveBeenCalledWith({ context: 'TestClass' });
    expect(anyInstance.logger).toBeDefined();
    expect(anyClass.logger).toBeDefined();
  });

  it('should use class name as default context if none provided', () => {
    // Arrange
    @Logger()
    class DefaultClass {}

    // Act
    const instance = new DefaultClass();
    const anyInstance = instance as any;

    // Assert
    expect(logger.child).toHaveBeenCalledWith({ context: 'DefaultClass' });
    expect(anyInstance.logger).toBeDefined();
  });
});
