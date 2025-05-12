import { Format, Lolog, Transports } from "src";

class App {
  private logger: Lolog;
  constructor() {
    this.logger = new Lolog({
      level: "debug",
      defaultMeta: { service: "APP" },
      format: Format.DefaultFormat(),
      transports: [Transports.ConsoleTransport()],
    });
  }

  dummyFunc = () => {
    const logger = this.logger
      .getInstanceLog()
      .child({ "request.id": "abc123" });
    logger.info("test info");
    logger.warn("test warn");

    try {
      throw new Error("Database connection failed");
    } catch (error) {
      logger.debug("ada error di dummyFunc");
      this.logger.error(error);
      this.logger.error(error, { userId: "u456" });
    } finally {
      this.dummyFunc2();
    }
  };

  dummyFunc2 = () => {
    this.logger.debug("dummyFunc2");
  };
}

const app = new App();
app.dummyFunc();
