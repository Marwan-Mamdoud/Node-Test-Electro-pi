import { AppDataSource } from "../config/database";
import { TaskAuditLog } from "../models/TaskAuditLog";

const auditLogRepo = () => AppDataSource.getRepository(TaskAuditLog);

export const TaskAuditLogRepository = {
  create: (data: Partial<TaskAuditLog>) => auditLogRepo().create(data),

  save: (log: TaskAuditLog) => auditLogRepo().save(log),

  findByTask: (taskId: string) =>
    auditLogRepo()
      .createQueryBuilder("log")
      .leftJoinAndSelect("log.user", "user")
      .where("log.\"taskId\" = :taskId", { taskId })
      .orderBy("log.\"changedAt\"", "DESC")
      .getMany(),
};
