import { ProjectRepository } from "../repositories/project.repo";
import { Project, ProjectStatus } from "../models/Project";
import redis from "../config/redis";
import { deleteByPattern } from "../config/redis.helper";

const CACHE_TTL = 300; // 5 minutes

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

  // Invalidate cache
  await deleteByPattern(`projects:${ownerId}:*`);
  await deleteByPattern(`projects:admin:*`);

  return saved;
};

export const getUserProjects = async (
  ownerId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const cacheKey = `projects:${ownerId}:page:${page}:limit:${limit}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const [projects, total] = await ProjectRepository.findByOwner(
    ownerId,
    page,
    limit,
  );
  const result = {
    projects,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };

  // Set cache
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));

  return result;
};

export const getProjectById = async (id: string, ownerId: string) => {
  const cacheKey = `projects:${id}`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const project = await ProjectRepository.findById(id, ownerId);
  if (!project) throw { status: 404, message: "Project not found" };

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(project));

  return project;
};

export const updateProject = async (
  id: string,
  ownerId: string,
  updates: Partial<Project>,
) => {
  const project = await getProjectById(id, ownerId);
  Object.assign(project, updates);
  const updated = await ProjectRepository.save(project);

  // Invalidate caches
  await redis.del(`projects:${id}`);
  await deleteByPattern(`projects:${ownerId}:*`);
  await deleteByPattern(`projects:admin:*`);

  return updated;
};

export const deleteProject = async (id: string, ownerId: string) => {
  const project = await getProjectById(id, ownerId);
  await ProjectRepository.remove(project);

  // Invalidate caches
  await redis.del(`projects:${id}`);
  await deleteByPattern(`projects:${ownerId}:*`);
  await deleteByPattern(`projects:admin:*`);

  return { message: "Project deleted successfully" };
};

// Admin

export const getAllProjectsAdmin = async (
  page: number = 1,
  limit: number = 10,
) => {
  const cacheKey = `projects:admin:page:${page}:limit:${limit}`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const [projects, total] =
    await ProjectRepository.findAllWithPaginationForAdmin(page, limit);
  const result = {
    projects,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));

  return result;
};

export const getProjectByIdAdmin = async (id: string) => {
  const cached = await redis.get(`projects:${id}`);
  if (cached) return JSON.parse(cached);

  const project = await ProjectRepository.findByIdForAdmin(id);
  if (!project) throw { status: 404, message: "Project not found" };

  await redis.setex(`projects:${id}`, CACHE_TTL, JSON.stringify(project));

  return project;
};

export const updateProjectAdmin = async (
  id: string,
  ownerId: string,
  updates: Partial<Project>,
) => {
  // Don't use getProjectById because we don't have ownerId check
  const project = await ProjectRepository.findByIdForAdmin(id);
  if (!project) throw { status: 404, message: "Project not found" };

  Object.assign(project, updates);
  const updated = await ProjectRepository.save(project);

  // Invalidate caches
  await redis.del(`projects:${id}`);
  await deleteByPattern(`projects:${ownerId}:*`);
  await deleteByPattern(`projects:admin:*`);

  return updated;
};

export const deleteProjectAdmin = async (id: string) => {
  const project = await ProjectRepository.findByIdForAdmin(id);
  if (!project) throw { status: 404, message: "Project not found" };

  await ProjectRepository.remove(project);

  // Invalidate caches
  await redis.del(`projects:${id}`);
  await deleteByPattern(`projects:${project.ownerId}:*`);
  await deleteByPattern(`projects:admin:*`);

  return { message: "Project deleted successfully" };
};
