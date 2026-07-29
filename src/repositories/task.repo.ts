import { AppDataSource } from "../config/database";
import { Task } from "../models/Task";

const taskRepo = () => AppDataSource.getRepository(Task);

export interface TaskListFilters {
  status?: string;
  priority?: string;
  assignee?: string;
  search?: string;
}

export interface TaskListOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export const TaskRepository = {
  create: (data: Partial<Task>) => taskRepo().create(data),

  save: (task: Task) => taskRepo().save(task),

  findById: (id: string, projectId: string) =>
    taskRepo().findOne({
      where: { id, projectId },
      relations: { creator: true, assignee: true },
    }),

  findByIdWithRelations: (id: string) =>
    taskRepo().findOne({
      where: { id },
      relations: { creator: true, assignee: true, project: true },
    }),

  findByProject: (
    projectId: string,
    filters: TaskListFilters,
    options: TaskListOptions,
  ) => {
    const qb = taskRepo()
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.creator", "creator")
      .leftJoinAndSelect("task.assignee", "assignee")
      .where("task.\"projectId\" = :projectId", { projectId });

    if (filters.status) {
      qb.andWhere("task.status = :status", { status: filters.status });
    }
    if (filters.priority) {
      qb.andWhere("task.priority = :priority", { priority: filters.priority });
    }
    if (filters.assignee) {
      qb.andWhere("task.\"assigneeId\" = :assigneeId", {
        assigneeId: filters.assignee,
      });
    }
    if (filters.search) {
      qb.andWhere(
        "(task.title ILIKE :search OR task.description ILIKE :search)",
        { search: `%${filters.search}%` },
      );
    }

    const sortColumn =
      options.sortBy === "title"
        ? "task.title"
        : options.sortBy === "priority"
          ? "task.priority"
          : options.sortBy === "status"
            ? "task.status"
            : "task.createdAt";
    qb.orderBy(sortColumn, options.sortOrder || "DESC");
    qb.skip((options.page - 1) * options.limit);
    qb.take(options.limit);

    return qb.getManyAndCount();
  },

  remove: (task: Task) => taskRepo().remove(task),

  findAllAdmin: (
    filters: TaskListFilters,
    options: TaskListOptions,
  ) => {
    const qb = taskRepo()
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.creator", "creator")
      .leftJoinAndSelect("task.assignee", "assignee");

    if (filters.status) {
      qb.andWhere("task.status = :status", { status: filters.status });
    }
    if (filters.priority) {
      qb.andWhere("task.priority = :priority", { priority: filters.priority });
    }
    if (filters.assignee) {
      qb.andWhere("task.\"assigneeId\" = :assigneeId", {
        assigneeId: filters.assignee,
      });
    }
    if (filters.search) {
      qb.andWhere(
        "(task.title ILIKE :search OR task.description ILIKE :search)",
        { search: `%${filters.search}%` },
      );
    }

    const sortColumn =
      options.sortBy === "title"
        ? "task.title"
        : options.sortBy === "priority"
          ? "task.priority"
          : options.sortBy === "status"
            ? "task.status"
            : "task.createdAt";
    qb.orderBy(sortColumn, options.sortOrder || "DESC");
    qb.skip((options.page - 1) * options.limit);
    qb.take(options.limit);

    return qb.getManyAndCount();
  },

  findByIdAdmin: (id: string) =>
    taskRepo().findOne({
      where: { id },
      relations: { creator: true, assignee: true },
    }),

  updateAdmin: (id: string, updates: Partial<Task>) =>
    taskRepo().update(id, updates),

  deleteAdmin: (id: string) => taskRepo().delete(id),
};
