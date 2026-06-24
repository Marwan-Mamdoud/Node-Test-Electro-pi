import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1719080000000 implements MigrationInterface {
  name = "CreateUsersTable1719080000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE app.user_role_enum AS ENUM ('admin', 'member');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;

      CREATE TABLE IF NOT EXISTS app.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL CHECK (length(trim(name)) > 0),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role app.user_role_enum NOT NULL DEFAULT 'member',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON app.users(email);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS app.idx_users_email;
      DROP TABLE IF EXISTS app.users;
      DROP TYPE IF EXISTS app.user_role_enum;
    `);
  }
}
