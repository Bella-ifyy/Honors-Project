require("module-alias/register");

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";
dotenv.config();

const bodyParser = require("body-parser");

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("workout/api/v1");
  app.enableCors({
    origin: "*",
  });
  app.use(bodyParser.json({ limit: "150mb" }));
  app.use(bodyParser.urlencoded({ limit: "150mb", extended: true }));

  app.use((req, res, next) => {
    const startTime = Date.now();
    const { method, url, headers, body } = req;

    const clientInfo = {
      ip: req.ip,
      userAgent: headers["user-agent"],
    };

    console.log("Incoming Request:", {
      method,
      url,
      body,
      clientInfo,
    });

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      console.log("Outgoing Response:", {
        method,
        url,
        statusCode: res.statusCode,
        duration,
      });
    });

    next();
  });

  await app.listen(process.env.PORT || 3014);
}

bootstrap();
