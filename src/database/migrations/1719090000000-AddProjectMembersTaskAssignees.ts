import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProjectMembersTaskAssignees1719090000000
  implements MigrationInterface
{
  name = "AddProjectMembersTaskAssignees1719090000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create project_members table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS app.project_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "projectId" UUID NOT NULL REFERENCES app.projects(id) ON DELETE CASCADE,
        "userId" UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE ("projectId", "userId")
      );

      CREATE INDEX IF NOT EXISTS idx_project_members_project ON app.project_members("projectId");
      CREATE INDEX IF NOT EXISTS idx_project_members_user ON app.project_members("userId");
    `);

    // 2. Drop old task_status_enum and recreate with new values
    await queryRunner.query(`
      -- Drop default first, then column constraint, then type
      ALTER TABLE app.tasks ALTER COLUMN status DROP DEFAULT;

      ALTER TABLE app.tasks ALTER COLUMN status TYPE VARCHAR(20);

      DROP TYPE IF EXISTS app.task_status_enum;

      CREATE TYPE app.task_status_enum AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

      ALTER TABLE app.tasks ALTER COLUMN status TYPE app.task_status_enum USING
        CASE status
          WHEN 'pending' THEN 'TODO'::app.task_status_enum
          WHEN 'in_progress' THEN 'IN_PROGRESS'::app.task_status_enum
          WHEN 'done' THEN 'DONE'::app.task_status_enum
          ELSE 'TODO'::app.task_status_enum
        END;

      ALTER TABLE app.tasks ALTER COLUMN status SET DEFAULT 'TODO';
    `);

    // 3. Add creatorId column (NOT NULL) — backfill from project owner
    await queryRunner.query(`
      ALTER TABLE app.tasks ADD COLUMN "creatorId" UUID;

      UPDATE app.tasks t
         SET "creatorId" = p."ownerId"
        FROM app.projects p
       WHERE t."projectId" = p.id
         AND t."creatorId" IS NULL;

      ALTER TABLE app.tasks ALTER COLUMN "creatorId" SET NOT NULL;

      ALTER TABLE app.tasks
        ADD CONSTRAINT fk_tasks_creator
        FOREIGN KEY ("creatorId") REFERENCES app.users(id) ON DELETE CASCADE;

      CREATE INDEX IF NOT EXISTS idx_tasks_creator_id ON app.tasks("creatorId");
    `);

    // 4. Add assigneeId column (nullable)
    await queryRunner.query(`
      ALTER TABLE app.tasks ADD COLUMN "assigneeId" UUID;

      ALTER TABLE app.tasks
        ADD CONSTRAINT fk_tasks_assignee
        FOREIGN KEY ("assigneeId") REFERENCES app.users(id) ON DELETE SET NULL;

      CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON app.tasks("assigneeId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove assigneeId
    await queryRunner.query(`
      DROP INDEX IF EXISTS app.idx_tasks_assignee_id;
      ALTER TABLE app.tasks DROP CONSTRAINT IF EXISTS fk_tasks_assignee;
      ALTER TABLE app.tasks DROP COLUMN IF EXISTS "assigneeId";
    `);

    // Remove creatorId
    await queryRunner.query(`
      DROP INDEX IF EXISTS app.idx_tasks_creator_id;
      ALTER TABLE app.tasks DROP CONSTRAINT IF EXISTS fk_tasks_creator;
      ALTER TABLE app.tasks DROP COLUMN IF EXISTS "creatorId";
    `);

    // Restore old task status enum
    await queryRunner.query(`
      ALTER TABLE app.tasks ALTER COLUMN status DROP DEFAULT;
      ALTER TABLE app.tasks ALTER COLUMN status TYPE VARCHAR(20);
      DROP TYPE IF EXISTS app.task_status_enum;
      CREATE TYPE app.task_status_enum AS ENUM ('pending', 'in_progress', 'done');
      ALTER TABLE app.tasks ALTER COLUMN status TYPE app.task_status_enum USING
        CASE status
          WHEN 'TODO' THEN 'pending'::app.task_status_enum
          WHEN 'IN_PROGRESS' THEN 'in_progress'::app.task_status_enum
          WHEN 'DONE' THEN 'done'::app.task_status_enum
          ELSE 'pending'::app.task_status_enum
        END;
      ALTER TABLE app.tasks ALTER COLUMN status SET DEFAULT 'pending';
    `);

    // Drop project_members
    await queryRunner.query(`
      DROP TABLE IF EXISTS app.project_members;
    `);
  }
}
