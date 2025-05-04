import { Format, Lolog, Transports } from "src";

const env: string = "local";

class App {
  private logger: Lolog;
  constructor() {
    const format =
      env === "local"
        ? Format.DefaultFormat()
        : Format.ElasticFormat({
            serviceName: "AppChild",
          });

    this.logger = new Lolog({
      level: "debug",
      defaultMeta: { service: "APP" },
      format,
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
      this.logger.debug("ada error di dummyFunc");
      this.logger.error(error);
      this.logger.error(error, { requestId: "abc123", userId: "u456" });
    }
  };
}

const app = new App();
app.dummyFunc();
