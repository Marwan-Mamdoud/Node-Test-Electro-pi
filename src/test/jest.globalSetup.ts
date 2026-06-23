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
  await client.query(`SET search_path TO public`);

  // Drop all tables, enums, and indexes but KEEP extensions
  await client.query(`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
      
      FOR r IN (
        SELECT t.typname 
        FROM pg_type t 
        JOIN pg_namespace n ON t.typnamespace = n.oid 
        WHERE n.nspname = 'public' AND t.typtype = 'e'
      ) LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
      END LOOP;
      
      FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequencename) || ' CASCADE';
      END LOOP;
    END $$;
  `);

  await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  await client.end();

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await AppDataSource.synchronize();
  await AppDataSource.destroy();
};
