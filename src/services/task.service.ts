import { TaskRepository } from "../repositories/task.repo";
import { Task } from "../models/Task";
import redis from "../config/redis";

const CACHE_TTL = 300; // 5 minutes

export const createTask = async (data: Partial<Task>) => {
  const task = TaskRepository.create(data);
  const saved = await TaskRepository.save(task);

  // Invalidate project tasks cache
  await redis.del(`tasks:${data.projectId}`);

  return saved;
};

export const getProjectTasks = async (
  projectId: string,
  filters: { status?: string; priority?: string },
  page: number = 1,
  limit: number = 10,
) => {
  const cacheKey = `tasks:${projectId}:status:${filters.status || "all"}:priority:${
    filters.priority || "all"
  }:page:${page}:limit:${limit}`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const [tasks, total] = await TaskRepository.findByProject(
    projectId,
    filters,
    page,
    limit,
  );

  const result = {
    tasks,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));

  return result;
};

export const getTaskById = async (id: string, projectId: string) => {
  const cacheKey = `task:${id}:${projectId}`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const task = await TaskRepository.findById(id, projectId);
  if (!task) throw { status: 404, message: "Task not found" };

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(task));

  return task;
};

export const updateTask = async (
  id: string,
  projectId: string,
  updates: Partial<Task>,
) => {
  const task = await getTaskById(id, projectId);
  Object.assign(task, updates);
  const updated = await TaskRepository.save(task);

  // Invalidate caches
  await redis.del(`task:${id}:${projectId}`);
  await redis.del(`tasks:${projectId}`);

  return updated;
};

export const deleteTask = async (id: string, projectId: string) => {
  const task = await getTaskById(id, projectId);
  await TaskRepository.remove(task);

  // Invalidate caches
  await redis.del(`task:${id}:${projectId}`);
  await redis.del(`tasks:${projectId}`);

  return { message: "Task deleted successfully" };
};

export const getAllTasksAdmin = async (
  filters: { status?: string; priority?: string },
  page: number = 1,
  limit: number = 10,
) => {
  return TaskRepository.findAllAdmin(filters, page, limit);
};

export const getTaskByIdAdmin = async (id: string) => {
  return TaskRepository.findByIdAdmin(id);
};

export const updateTaskAdmin = async (id: string, updates: Partial<Task>) => {
  return TaskRepository.updateAdmin(id, updates);
};

export const deleteTaskAdmin = async (id: string) => {
  return TaskRepository.deleteAdmin(id);
};
