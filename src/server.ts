import app from "./app";
import { AppDataSource } from "./config/database";
import { runSeeds } from "./database/seeds";
import { Client } from "pg";
const PORT = parseInt(process.env.PORT || "3000", 10);

const ensureSchema = async (): Promise<void> => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  await client.connect();

  await client.query(`CREATE SCHEMA IF NOT EXISTS app`);
  await client.query(
    `GRANT ALL ON SCHEMA app TO "${process.env.DB_USERNAME}"`,
  );
  await client.query(
    `ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON TABLES TO "${process.env.DB_USERNAME}"`,
  );
  await client.query(
    `ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON SEQUENCES TO "${process.env.DB_USERNAME}"`,
  );
  await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

  await client.end();
};

const startServer = async () => {
  try {
    await ensureSchema();

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      await runSeeds(AppDataSource);
      console.log("✅ Database connected");
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

startServer();
