import { ConnectionOptions } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config();
let config: ConnectionOptions = {
  database: "",
  driver: undefined,
  location: "",
  region: "",
  resourceArn: "",
  secretArn: "",
  type: undefined,
};
console.log(process.env.DB_NAME);

config = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + "/**/*.entity{.ts,.js}"],
  synchronize: false,
  migrationsRun: true,
  migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
  cli: {
    migrationsDir: "src/migrations",
  },
};

export default config;
