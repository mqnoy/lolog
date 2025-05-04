import { Format, Lolog, Transports } from "src";

class HttpException extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.stack = new Error().stack;
  }
}

class App {
  private logger: Lolog;
  constructor() {
    this.logger = new Lolog({
      level: "debug",
      format: Format.ElasticFormat({
        serviceName: "AppChild",
      }),
      transports: [Transports.ConsoleTransport()],
    });
  }

  dummyFunc = () => {
    this.logger.setChild({ "request.id": "abc123" });
    this.logger.info("test info");
    this.logger.warn("test warn");

    try {
      throw new Error("Database connection failed");
    } catch (error: any) {
      this.logger.debug("ada error");
      this.logger.error(error);
    }

    try {
      throw new HttpException("duarrr", 500);
    } catch (error) {
      this.logger.debug("ada error", { data: [1, 2, 3], userId: "u456" });
      this.logger.error(error, { data: [1, 2, 3], userId: "u456" });
    }
  };
}

const app = new App();
app.dummyFunc();
