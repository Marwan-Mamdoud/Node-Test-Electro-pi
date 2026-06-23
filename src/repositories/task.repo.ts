import { AppDataSource } from "../config/database";
import { Task } from "../models/Task";

const taskRepo = () => AppDataSource.getRepository(Task);

export const TaskRepository = {
  create: (data: Partial<Task>) => taskRepo().create(data),

  save: (task: Task) => taskRepo().save(task),

  findById: (id: string, projectId: string) =>
    taskRepo().findOne({ where: { id, projectId } }),

  findByProject: (
    projectId: string,
    filters: { status?: string; priority?: string },
    page: number,
    limit: number,
  ) => {
    const query = taskRepo()
      .createQueryBuilder("task")
      .where("task.projectId = :projectId", { projectId });

    if (filters.status)
      query.andWhere("task.status = :status", { status: filters.status });
    if (filters.priority)
      query.andWhere("task.priority = :priority", {
        priority: filters.priority,
      });

    return query
      .orderBy("task.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  },

  remove: (task: Task) => taskRepo().remove(task),

  findAllAdmin: (
    filters: { status?: string; priority?: string },
    page: number,
    limit: number,
  ) => {
    const query = taskRepo().createQueryBuilder("task");

    if (filters.status)
      query.andWhere("task.status = :status", { status: filters.status });
    if (filters.priority)
      query.andWhere("task.priority = :priority", {
        priority: filters.priority,
      });

    return query
      .orderBy("task.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  },

  findByIdAdmin: (id: string) => taskRepo().findOne({ where: { id } }),

  updateAdmin: (id: string, updates: Partial<Task>) =>
    taskRepo().update(id, updates),

  deleteAdmin: (id: string) => taskRepo().delete(id),
};
