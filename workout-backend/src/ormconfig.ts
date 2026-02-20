import { ConnectionOptions } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config();

console.log(process.env.DB_NAME);

const config: ConnectionOptions = {
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
  // Use mysql2 for better authentication support (caching_sha2_password)
  driver: require("mysql2"),
};

export default config;
