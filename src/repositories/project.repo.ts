import { AppDataSource } from "../config/database";
import { Project } from "../models/Project";

const projectRepo = () => AppDataSource.getRepository(Project);

export const ProjectRepository = {
  create: (data: Partial<Project>) => projectRepo().create(data),

  save: (project: Project) => projectRepo().save(project),

  findById: (id: string, ownerId: string) =>
    projectRepo().findOne({
      where: { id, ownerId },
      relations: { tasks: true },
    }),

  findByOwner: (ownerId: string, page: number, limit: number) =>
    projectRepo().findAndCount({
      relations: { tasks: true },
      where: { ownerId },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    }),

  remove: (project: Project) => projectRepo().remove(project),

  findAllWithPaginationForAdmin: (page: number, limit: number) =>
    projectRepo().findAndCount({
      relations: { tasks: true, owner: true },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    }),

  findByIdForAdmin: (id: string) =>
    projectRepo().findOne({
      where: { id },
      relations: { tasks: true, owner: true },
    }),
};
