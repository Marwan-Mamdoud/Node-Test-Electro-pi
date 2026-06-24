import { TaskRepository } from "../repositories/task.repo";
import { Task } from "../models/Task";
import redis from "../config/redis";
import { deleteByPattern } from "../config/redis.helper";

const CACHE_TTL = 300; // 5 minutes

export const createTask = async (data: Partial<Task>) => {
  const task = TaskRepository.create(data);
  const saved = await TaskRepository.save(task);

  // Invalidate project tasks cache
  await deleteByPattern(`tasks:${data.projectId}:*`);
  await deleteByPattern(`tasks:admin:*`);

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
  const cacheKey = `tasks:${projectId}`;

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
  await deleteByPattern(`tasks:${projectId}:*`);
  await deleteByPattern(`tasks:admin:*`);

  return updated;
};

export const deleteTask = async (id: string, projectId: string) => {
  const task = await getTaskById(id, projectId);
  await TaskRepository.remove(task);

  // Invalidate caches
  await deleteByPattern(`tasks:${projectId}:*`);
  await deleteByPattern(`tasks:admin:*`);

  return { message: "Task deleted successfully" };
};

// Admin

export const getAllTasksAdmin = async (
  filters: { status?: string; priority?: string },
  page: number = 1,
  limit: number = 10,
) => {
  const cacheKey = `tasks:admin:page:${page}:limit:${limit}:status:${filters.status || "all"}:priority:${filters.priority || "all"}`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const [tasks, total] = await TaskRepository.findAllAdmin(
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

export const getTaskByIdAdmin = async (id: string) => {
  const cacheKey = `tasks:${id}`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const task = await TaskRepository.findByIdAdmin(id);
  if (!task) throw { status: 404, message: "Task not found" };

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(task));

  return task;
};

export const updateTaskAdmin = async (id: string, updates: Partial<Task>) => {
  const task = await getTaskByIdAdmin(id);
  Object.assign(task, updates);
  const updated = await TaskRepository.updateAdmin(id, updates);

  // Invalidate caches
  await deleteByPattern(`tasks:${task.projectId}:*`);
  await deleteByPattern(`tasks:admin:*`);

  return updated;
};

export const deleteTaskAdmin = async (id: string) => {
  const task = await getTaskByIdAdmin(id);
  await TaskRepository.deleteAdmin(id);

  // Invalidate caches
  await deleteByPattern(`tasks:${task.projectId}:*`);
  await deleteByPattern(`tasks:admin:*`);

  return { message: "Task deleted successfully" };
};
