import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTasksTable1719080000002 implements MigrationInterface {
  name = "CreateTasksTable1719080000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE app.task_status_enum AS ENUM ('pending', 'in_progress', 'done');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE TYPE app.task_priority_enum AS ENUM ('low', 'medium', 'high');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;

      CREATE TABLE IF NOT EXISTS app.tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL CHECK (length(trim(title)) > 0),
        description TEXT,
        status app.task_status_enum NOT NULL DEFAULT 'pending',
        priority app.task_priority_enum NOT NULL DEFAULT 'medium',
        "dueDate" DATE,
        "projectId" UUID NOT NULL REFERENCES app.projects(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON app.tasks("projectId");
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON app.tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON app.tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON app.tasks("dueDate");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS app.idx_tasks_project_id;
      DROP INDEX IF EXISTS app.idx_tasks_status;
      DROP INDEX IF EXISTS app.idx_tasks_priority;
      DROP INDEX IF EXISTS app.idx_tasks_due_date;
      DROP TABLE IF EXISTS app.tasks;
      DROP TYPE IF EXISTS app.task_status_enum;
      DROP TYPE IF EXISTS app.task_priority_enum;
    `);
  }
}
