import { Lolog } from '../logger';
import pino from 'pino';

jest.mock('pino', () => {
  const mPino = jest.fn((options, stream) => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn(),
    child: jest.fn().mockReturnThis(),
    level: 'debug',
  }));
  (mPino as any).stdTimeFunctions = { isoTime: jest.fn() };
  (mPino as any).stdSerializers = { err: jest.fn(), req: jest.fn(), res: jest.fn() };
  (mPino as any).transport = jest.fn().mockReturnValue({ pipe: jest.fn(), on: jest.fn() });
  (mPino as any).levels = {
    labels: {
      10: 'trace',
      20: 'debug',
      30: 'info',
      40: 'warn',
      50: 'error',
      60: 'fatal',
    },
    values: {
      trace: 10,
      debug: 20,
      info: 30,
      warn: 40,
      error: 50,
      fatal: 60,
    },
  };
  return mPino;
});

describe('Lolog', () => {
  let lolog: Lolog;
  let mockPinoInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPinoInstance = pino();
    lolog = new Lolog('test-context', { env: 'test' }, mockPinoInstance);
  });

  describe('info', () => {
    it('should call pino.info with the correct arguments', () => {
      // Arrange
      const message = 'test message';
      const data = { foo: 'bar' };

      // Act
      lolog.info(data, message);

      // Assert
      expect(mockPinoInstance.info).toHaveBeenCalledWith(data, message);
    });
  });

  describe('error', () => {
    it('should call pino.error with the correct arguments', () => {
      // Arrange
      const message = 'error message';
      const error = new Error('test error');

      // Act
      lolog.error(error, message);

      // Assert
      expect(mockPinoInstance.error).toHaveBeenCalledWith(error, message);
    });
  });

  describe('child', () => {
    it('should create a child logger with bindings', () => {
      // Arrange
      const bindings = { requestId: '123' };

      // Act
      const childLogger = lolog.child(bindings);

      // Assert
      expect(mockPinoInstance.child).toHaveBeenCalledWith(bindings);
      expect(childLogger).toBeInstanceOf(Lolog);
    });
  });

  describe('configuration', () => {
    it('should respect custom redaction configuration', () => {
      // Arrange
      const customRedact = { paths: ['mySecret'], censor: 'REDACTED' };

      // Act
      new Lolog('test', { redact: customRedact });

      // Assert
      expect(pino).toHaveBeenCalledWith(
        expect.objectContaining({
          redact: customRedact,
        }),
        expect.anything()
      );
    });

    it('should configure console and file transports', () => {
      // Arrange
      const transports: any[] = [
        { type: 'console', level: 'info' },
        { type: 'file', level: 'error', options: { destination: 'error.log' } },
      ];

      // Act
      new Lolog('test', { env: 'development', transports });

      // Assert
      expect(pino.transport).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: expect.arrayContaining([
            expect.objectContaining({ target: 'pino-pretty', level: 'info' }),
            expect.objectContaining({ target: 'pino/file', level: 'error' }),
          ]),
        })
      );
      expect(pino).toHaveBeenCalledWith(expect.any(Object), expect.anything());
    });
  });
});
