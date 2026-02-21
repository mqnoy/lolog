import logger, { Logger, ILolog } from '../index';

// 1. Configure the global logger FIRST
logger.setup({
  env: 'development',
  logLevel: 'debug',
  transports: [
    { type: 'console', level: 'debug' },
    {
      type: 'file',
      level: 'info',
      options: { destination: './logs/decorator-custom.log', mkdir: true },
    },
  ],
});

// 2. Define classes with decorators
@Logger('MyService')
class MyService {
  private readonly logger!: ILolog;

  doWork() {
    this.logger.info('Work started with custom config!');
  }
}

const service = new MyService();
service.doWork();

console.log('Decorator example with setup() initiated. Waiting for logs to flush...');
setTimeout(() => {
  console.log('Check ./logs/decorator-custom.log for output.');
}, 1000);
