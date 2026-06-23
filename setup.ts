import { Client } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const DB_HOST = process.env.DB_HOST ?? "localhost";
const DB_PORT = Number(process.env.DB_PORT ?? 5432);
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD ?? "";
const DB_NAME = process.env.DB_NAME;
const SU_USER = process.env.DB_SUPERUSER;
const SU_PASSWORD = process.env.DB_SUPERUSER_PASSWORD ?? "";

const validateEnv = (): void => {
  const missing: string[] = [];

  if (!DB_USERNAME) missing.push("DB_USERNAME");
  if (!DB_NAME) missing.push("DB_NAME");
  if (!SU_USER) missing.push("DB_SUPERUSER");

  if (missing.length > 0) {
    console.error(
      `❌ Missing required env vars: ${missing.join(", ")}\n` +
        `   Copy .env.example to .env and fill in the values.`,
    );
    process.exit(1);
  }
};

const ensureDatabase = async (): Promise<void> => {
  // Step 1: connect as superuser to default postgres DB
  const suClient = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: SU_USER,
    password: SU_PASSWORD,
    database: "postgres",
  });

  await suClient.connect();

  // Create role if it doesn't exist
  await suClient.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USERNAME}') THEN
        CREATE ROLE "${DB_USERNAME}" WITH LOGIN PASSWORD '${DB_PASSWORD}';
        RAISE NOTICE 'Role "${DB_USERNAME}" created';
      ELSE
        RAISE NOTICE 'Role "${DB_USERNAME}" already exists';
      END IF;
    END
    $$;
  `);

  // Create database if it doesn't exist
  const dbExists = await suClient.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [DB_NAME],
  );

  if (dbExists.rowCount === 0) {
    console.log(`📦 Creating database "${DB_NAME}"...`);
    await suClient.query(`CREATE DATABASE "${DB_NAME}" OWNER "${DB_USERNAME}"`);
    console.log(`✅ Database "${DB_NAME}" created`);
  } else {
    console.log(`✅ Database "${DB_NAME}" already exists`);
  }

  await suClient.end();

  // Step 2: connect as superuser to target DB and grant privileges
  const dbClient = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: SU_USER,
    password: SU_PASSWORD,
    database: DB_NAME,
  });

  await dbClient.connect();
  await dbClient.query(
    `GRANT ALL PRIVILEGES ON SCHEMA public TO "${DB_USERNAME}"`,
  );
  await dbClient.query(`ALTER SCHEMA public OWNER TO "${DB_USERNAME}"`);
  await dbClient.end();

  console.log(`✅ Privileges granted to "${DB_USERNAME}" on public schema`);
};

const runMigrationsAndSeed = async (): Promise<void> => {
  const { AppDataSource } = await import("./src/config/database");
  const { runSeeds } = await import("./src/database/seeds/index");

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  console.log("✅ Migrations ran successfully");

  await runSeeds(AppDataSource);

  await AppDataSource.destroy();
};

const main = async (): Promise<void> => {
  try {
    validateEnv();

    console.log("🔧 Setting up database...");
    await ensureDatabase();

    console.log("🔄 Running migrations and seeds...");
    await runMigrationsAndSeed();

    console.log("\n✅ Setup complete! Starting server...\n");
    await import("./src/server");
  } catch (error: any) {
    console.error("\n❌ Setup failed:", error?.message ?? error);

    if (error?.code === "28P01") {
      console.error(
        "👉 Wrong superuser password — check DB_SUPERUSER_PASSWORD in .env",
      );
    } else if (error?.code === "3D000") {
      console.error(
        '👉 Database "postgres" not found — is PostgreSQL running?',
      );
    } else if (error?.code === "ECONNREFUSED") {
      console.error(
        `👉 Could not connect to PostgreSQL at ${DB_HOST}:${DB_PORT} — is it running?`,
      );
    } else if (error?.code === "28000") {
      console.error(
        `👉 Superuser "${SU_USER}" does not exist or is not allowed to connect.\n` +
          `   Check DB_SUPERUSER in .env — run 'psql postgres -c "\\du"' to list superusers.`,
      );
    }

    process.exit(1);
  }
};

main();
