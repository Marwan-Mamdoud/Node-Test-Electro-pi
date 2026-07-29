import { AppDataSource } from "../config/database";
import { Project } from "../models/Project";

const projectRepo = () => AppDataSource.getRepository(Project);

export interface ProjectListOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  search?: string;
}

export const ProjectRepository = {
  create: (data: Partial<Project>) => projectRepo().create(data),

  save: (project: Project) => projectRepo().save(project),

  findById: (id: string, ownerId: string) =>
    projectRepo().findOne({
      where: { id, ownerId },
      relations: { tasks: true },
    }),

  findByIdSimple: (id: string) =>
    projectRepo().findOne({
      where: { id },
      relations: { tasks: true, owner: true },
    }),

  findByIdForAdmin: (id: string) =>
    projectRepo().findOne({
      where: { id },
      relations: { tasks: true, owner: true },
    }),

  findByOwner: (ownerId: string, options: ProjectListOptions) =>
    projectRepo().findAndCount({
      relations: { tasks: true },
      where: { ownerId },
      order: { [options.sortBy || "createdAt"]: options.sortOrder || "DESC" },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    }),

  findAccessibleProjects: (userId: string, options: ProjectListOptions) => {
    const qb = projectRepo()
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.owner", "owner")
      .leftJoinAndSelect("project.tasks", "tasks")
      .leftJoin(
        "project_members",
        "pm",
        'pm."projectId" = project.id AND pm."userId" = :userId',
        { userId },
      )
      .where("project.\"ownerId\" = :userId OR pm.id IS NOT NULL", { userId });

    if (options.search) {
      qb.andWhere(
        "(project.title ILIKE :search OR project.description ILIKE :search)",
        { search: `%${options.search}%` },
      );
    }

    const sortColumn =
      options.sortBy === "title" ? "project.title" : "project.createdAt";
    qb.orderBy(sortColumn, options.sortOrder || "DESC");
    qb.skip((options.page - 1) * options.limit);
    qb.take(options.limit);

    return qb.getManyAndCount();
  },

  findAllWithPaginationForAdmin: (options: ProjectListOptions) => {
    const qb = projectRepo()
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.owner", "owner")
      .leftJoinAndSelect("project.tasks", "tasks");

    if (options.search) {
      qb.where(
        "(project.title ILIKE :search OR project.description ILIKE :search)",
        { search: `%${options.search}%` },
      );
    }

    const sortColumn =
      options.sortBy === "title" ? "project.title" : "project.createdAt";
    qb.orderBy(sortColumn, options.sortOrder || "DESC");
    qb.skip((options.page - 1) * options.limit);
    qb.take(options.limit);

    return qb.getManyAndCount();
  },

  remove: (project: Project) => projectRepo().remove(project),
};
