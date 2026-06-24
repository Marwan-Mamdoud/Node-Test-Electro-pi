import * as dotenv from "dotenv";
dotenv.config();

import { Client } from "pg";
import { AppDataSource } from "../config/database";

export default async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_SUPERUSER,
    password: process.env.DB_SUPERUSER_PASSWORD ?? "",
    database: process.env.DB_NAME,
  });

  await client.connect();

  // Ensure extensions exist (requires superuser)
  await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
  await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  // Wipe and recreate the app schema clean
  await client.query(`DROP SCHEMA IF EXISTS app CASCADE`);
  await client.query(
    `CREATE SCHEMA app AUTHORIZATION "${process.env.DB_USERNAME}"`,
  );
  await client.query(
    `GRANT ALL PRIVILEGES ON SCHEMA app TO "${process.env.DB_USERNAME}"`,
  );
  await client.query(
    `ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON TABLES TO "${process.env.DB_USERNAME}"`,
  );
  await client.query(
    `ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON SEQUENCES TO "${process.env.DB_USERNAME}"`,
  );

  await client.end();

  // Run migrations — never synchronize()
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await AppDataSource.runMigrations();
  await AppDataSource.destroy();
};
