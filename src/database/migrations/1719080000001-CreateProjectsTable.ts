import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectsTable1719080000001 implements MigrationInterface {
  name = "CreateProjectsTable1719080000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE project_status_enum AS ENUM (
          'active', 'archived', 'completed'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;

      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL CHECK (length(trim(title)) > 0),
        description TEXT,
        status project_status_enum NOT NULL DEFAULT 'active',
        "ownerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects("ownerId");
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_projects_owner_id;
      DROP INDEX IF EXISTS idx_projects_status;
      DROP TABLE IF EXISTS projects;
      DROP TYPE IF EXISTS project_status_enum;
    `);
  }
}
