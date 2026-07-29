import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskAuditLog1719100000000 implements MigrationInterface {
  name = "CreateTaskAuditLog1719100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS app.task_audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "taskId" UUID NOT NULL REFERENCES app.tasks(id) ON DELETE CASCADE,
        "changedBy" UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
        "oldStatus" app.task_status_enum NOT NULL,
        "newStatus" app.task_status_enum NOT NULL,
        "changedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_task_audit_logs_task_id ON app.task_audit_logs("taskId");
      CREATE INDEX IF NOT EXISTS idx_task_audit_logs_changed_at ON app.task_audit_logs("changedAt");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS app.idx_task_audit_logs_changed_at;
      DROP INDEX IF EXISTS app.idx_task_audit_logs_task_id;
      DROP TABLE IF EXISTS app.task_audit_logs;
    `);
  }
}
