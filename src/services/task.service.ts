import {
  TaskRepository,
  TaskListFilters,
  TaskListOptions,
} from "../repositories/task.repo";
import { Task, TaskStatus } from "../models/Task";
import { UserRole } from "../models/User";
import { ProjectMemberRepository } from "../repositories/projectMember.repo";
import { logStatusChange } from "./taskAuditLog.service";
import redis from "../config/redis";
import { deleteByPattern } from "../config/redis.helper";

const CACHE_TTL = 300;

export const createTask = async (data: Partial<Task>, creatorId: string) => {
  // Validate assignee is a project member if provided
  if (data.assigneeId) {
    const isMember = await ProjectMemberRepository.isMember(
      data.projectId!,
      data.assigneeId,
    );
    if (!isMember) {
      throw {
        status: 400,
        message: "assignee must be a member of this project",
      };
    }
  }

  // Always set creatorId from the authenticated user — never trust client input
  const task = TaskRepository.create({
    ...data,
    creatorId,
  });
  const saved = await TaskRepository.save(task);

  await deleteByPattern(`tasks:${data.projectId}:*`);
  await deleteByPattern(`tasks:admin:*`);

  return TaskRepository.findByIdAdmin(saved.id);
};

export const getProjectTasks = async (
  projectId: string,
  filters: TaskListFilters,
  options: TaskListOptions,
) => {
  const cacheKey = `tasks:${projectId}:${JSON.stringify(filters)}:${JSON.stringify(options)}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // Redis unavailable — continue to DB
  }

  const [tasks, total] = await TaskRepository.findByProject(
    projectId,
    filters,
    options,
  );

  const result = {
    data: tasks,
    meta: {
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    },
  };

  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
  } catch {
    // Redis unavailable — skip caching
  }

  return result;
};

export const getTaskById = async (id: string, projectId: string) => {
  const cacheKey = `task:${projectId}:${id}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // Redis unavailable — continue to DB
  }

  const task = await TaskRepository.findById(id, projectId);
  if (!task) throw { status: 404, message: "Task not found" };

  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(task));
  } catch {
    // Redis unavailable — skip caching
  }

  return task;
};

export const updateTask = async (
  id: string,
  projectId: string,
  updates: Partial<Task>,
  userId: string,
  role: string,
) => {
  const task = await TaskRepository.findById(id, projectId);
  if (!task) throw { status: 404, message: "Task not found" };
  console.log(`[Updates]`, updates);

  // Validate assignee is a project member if being updated
  if (updates.assigneeId) {
    console.log(`[Assignee ID]`, updates.assigneeId);

    const isMember = await ProjectMemberRepository.isMember(
      projectId,
      updates.assigneeId,
    );
    if (!isMember) {
      throw {
        status: 400,
        message: "assignee must be a member of this project",
      };
    }
  }

  // Never allow overriding creatorId via update
  delete updates.creatorId;
  delete task.assignee;

  // Track status change for audit log
  const oldStatus = task.status;
  const newStatus = updates.status as TaskStatus | undefined;

  Object.assign(task, updates);
  console.log(`[Task Updates]`, task);

  const updated = await TaskRepository.save(task);

  // Auto-insert audit log if status changed
  if (newStatus && oldStatus !== newStatus) {
    await logStatusChange(id, userId, oldStatus, newStatus);
  }

  await deleteByPattern(`tasks:${projectId}:*`);
  await deleteByPattern(`tasks:admin:*`);

  return TaskRepository.findByIdAdmin(updated.id);
};

export const deleteTask = async (
  id: string,
  projectId: string,
  userId: string,
  role: string,
) => {
  const task = await TaskRepository.findById(id, projectId);
  if (!task) throw { status: 404, message: "Task not found" };

  // Only admin or task creator can delete
  if (role !== UserRole.ADMIN && task.creatorId !== userId) {
    throw {
      status: 403,
      message: "Only the task creator or an admin can delete this task",
    };
  }

  await TaskRepository.remove(task);

  await deleteByPattern(`tasks:${projectId}:*`);
  await deleteByPattern(`tasks:admin:*`);

  return { message: "Task deleted successfully" };
};

// Admin

export const getAllTasksAdmin = async (
  filters: TaskListFilters,
  options: TaskListOptions,
) => {
  const cacheKey = `tasks:admin:${JSON.stringify(filters)}:${JSON.stringify(options)}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // Redis unavailable — continue to DB
  }

  const [tasks, total] = await TaskRepository.findAllAdmin(filters, options);
  const result = {
    data: tasks,
    meta: {
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    },
  };

  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
  } catch {
    // Redis unavailable — skip caching
  }

  return result;
};

export const getTaskByIdAdmin = async (id: string) => {
  const cacheKey = `task:${id}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // Redis unavailable — continue to DB
  }

  const task = await TaskRepository.findByIdAdmin(id);
  if (!task) throw { status: 404, message: "Task not found" };

  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(task));
  } catch {
    // Redis unavailable — skip caching
  }

  return task;
};

export const updateTaskAdmin = async (id: string, updates: Partial<Task>) => {
  const task = await TaskRepository.findByIdAdmin(id);
  if (!task) throw { status: 404, message: "Task not found" };

  // Validate assignee if being updated
  if (updates.assigneeId) {
    const isMember = await ProjectMemberRepository.isMember(
      task.projectId,
      updates.assigneeId,
    );
    if (!isMember) {
      throw {
        status: 400,
        message: "assignee must be a member of this project",
      };
    }
  }

  delete updates.creatorId;

  // Track status change for audit log
  const oldStatus = task.status;
  const newStatus = updates.status as TaskStatus | undefined;

  Object.assign(task, updates);
  const updated = await TaskRepository.save(task);

  // Auto-insert audit log if status changed
  if (newStatus && oldStatus !== newStatus) {
    await logStatusChange(id, task.creatorId, oldStatus, newStatus);
  }

  await deleteByPattern(`tasks:${task.projectId}:*`);
  await deleteByPattern(`tasks:admin:*`);

  return TaskRepository.findByIdAdmin(updated.id);
};

export const deleteTaskAdmin = async (id: string) => {
  const task = await TaskRepository.findByIdAdmin(id);
  if (!task) throw { status: 404, message: "Task not found" };

  await TaskRepository.deleteAdmin(id);

  await deleteByPattern(`tasks:${task.projectId}:*`);
  await deleteByPattern(`tasks:admin:*`);

  return { message: "Task deleted successfully" };
};
