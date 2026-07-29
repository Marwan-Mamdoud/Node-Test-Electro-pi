import {
  ProjectRepository,
  ProjectListOptions,
} from "../repositories/project.repo";
import { Project, ProjectStatus } from "../models/Project";
import { UserRole } from "../models/User";
import { ProjectMemberRepository } from "../repositories/projectMember.repo";
import redis from "../config/redis";
import { deleteByPattern } from "../config/redis.helper";

const CACHE_TTL = 300;

export const createProject = async (
  title: string,
  description: string,
  status: ProjectStatus,
  ownerId: string,
) => {
  const project = ProjectRepository.create({
    title,
    description,
    status,
    ownerId,
  });
  const saved = await ProjectRepository.save(project);

  await deleteByPattern(`projects:${ownerId}:*`);
  await deleteByPattern(`projects:admin:*`);

  return saved;
};

export const getUserProjects = async (
  userId: string,
  role: string,
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: "ASC" | "DESC",
  search?: string,
) => {
  const opts: ProjectListOptions = {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
  };

  const cacheKey = `projects:${userId}:${JSON.stringify(opts)}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // Redis unavailable — continue to DB
  }

  let projects: Project[];
  let total: number;

  if (role === UserRole.ADMIN) {
    [projects, total] =
      await ProjectRepository.findAllWithPaginationForAdmin(opts);
  } else {
    [projects, total] =
      await ProjectRepository.findAccessibleProjects(userId, opts);
  }

  const result = {
    data: projects,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };

  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
  } catch {
    // Redis unavailable — skip caching
  }

  return result;
};

export const getProjectById = async (id: string, userId: string, role: string) => {
  const cacheKey = `projects:${id}:${userId}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // Redis unavailable — continue to DB
  }

  let project: Project | null;

  if (role === UserRole.ADMIN) {
    project = await ProjectRepository.findByIdForAdmin(id);
    if (!project) throw { status: 404, message: "Project not found" };
  } else {
    project = await ProjectRepository.findByIdSimple(id);
    if (!project) throw { status: 404, message: "Project not found" };

    const isOwner = project.ownerId === userId;
    if (!isOwner) {
      const isMember = await ProjectMemberRepository.isMember(id, userId);
      if (!isMember) throw { status: 403, message: "You do not have access to this project" };
    }
  }

  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(project));
  } catch {
    // Redis unavailable — skip caching
  }

  return project;
};

export const updateProject = async (
  id: string,
  userId: string,
  role: string,
  updates: Partial<Project>,
) => {
  let project: Project | null;

  if (role === UserRole.ADMIN) {
    project = await ProjectRepository.findByIdForAdmin(id);
  } else {
    project = await ProjectRepository.findById(id, userId);
  }

  if (!project) throw { status: 404, message: "Project not found" };

  Object.assign(project, updates);
  const updated = await ProjectRepository.save(project);

  await deleteByPattern(`projects:${id}:*`);
  await deleteByPattern(`projects:${userId}:*`);
  await deleteByPattern(`projects:admin:*`);

  return updated;
};

export const deleteProject = async (id: string, userId: string, role: string) => {
  let project: Project | null;

  if (role === UserRole.ADMIN) {
    project = await ProjectRepository.findByIdForAdmin(id);
  } else {
    project = await ProjectRepository.findById(id, userId);
  }

  if (!project) throw { status: 404, message: "Project not found" };

  await ProjectRepository.remove(project);

  await deleteByPattern(`projects:${id}:*`);
  await deleteByPattern(`projects:${userId}:*`);
  await deleteByPattern(`projects:admin:*`);

  return { message: "Project deleted successfully" };
};

// Admin

export const getAllProjectsAdmin = async (
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: "ASC" | "DESC",
  search?: string,
) => {
  const opts: ProjectListOptions = { page, limit, sortBy, sortOrder, search };
  const cacheKey = `projects:admin:${JSON.stringify(opts)}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // Redis unavailable — continue to DB
  }

  const [projects, total] =
    await ProjectRepository.findAllWithPaginationForAdmin(opts);
  const result = {
    data: projects,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };

  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
  } catch {
    // Redis unavailable — skip caching
  }

  return result;
};

export const getProjectByIdAdmin = async (id: string) => {
  try {
    const cached = await redis.get(`projects:${id}:admin`);
    if (cached) return JSON.parse(cached);
  } catch {
    // Redis unavailable — continue to DB
  }

  const project = await ProjectRepository.findByIdForAdmin(id);
  if (!project) throw { status: 404, message: "Project not found" };

  try {
    await redis.setex(`projects:${id}:admin`, CACHE_TTL, JSON.stringify(project));
  } catch {
    // Redis unavailable — skip caching
  }

  return project;
};

export const updateProjectAdmin = async (
  id: string,
  updates: Partial<Project>,
) => {
  const project = await ProjectRepository.findByIdForAdmin(id);
  if (!project) throw { status: 404, message: "Project not found" };

  Object.assign(project, updates);
  const updated = await ProjectRepository.save(project);

  await deleteByPattern(`projects:${id}:*`);
  await deleteByPattern(`projects:admin:*`);

  return updated;
};

export const deleteProjectAdmin = async (id: string) => {
  const project = await ProjectRepository.findByIdForAdmin(id);
  if (!project) throw { status: 404, message: "Project not found" };

  await ProjectRepository.remove(project);

  await deleteByPattern(`projects:${id}:*`);
  await deleteByPattern(`projects:admin:*`);

  return { message: "Project deleted successfully" };
};
