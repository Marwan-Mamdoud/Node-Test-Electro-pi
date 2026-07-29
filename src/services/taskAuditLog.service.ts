import { TaskAuditLogRepository } from "../repositories/taskAuditLog.repo";
import { TaskStatus } from "../models/Task";

export const logStatusChange = async (
  taskId: string,
  changedBy: string,
  oldStatus: TaskStatus,
  newStatus: TaskStatus,
) => {
  const log = TaskAuditLogRepository.create({
    taskId,
    changedBy,
    oldStatus,
    newStatus,
  });
  return TaskAuditLogRepository.save(log);
};

export const getTaskAuditLog = async (taskId: string) => {
  return TaskAuditLogRepository.findByTask(taskId);
};
