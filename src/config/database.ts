import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { DataSource } from "typeorm";
import { User } from "../models/User";
import { Project } from "../models/Project";
import { Task } from "../models/Task";
import * as path from "path";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: process.env.NODE_ENV !== "production",
  schema: "app",
  entities: [User, Project, Task],
  migrations: [
    path.join(
      __dirname,
      `../database/migrations/*.${process.env.NODE_ENV === "production" ? "js" : "ts"}`,
    ),
  ],
  migrationsRun: true,
  migrationsTableName: "migrations",
  installExtensions: false,
  subscribers: [],
  extra: {
    max: Number(process.env.DB_POOL_MAX ?? 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
});
