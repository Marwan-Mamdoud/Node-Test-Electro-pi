import { AppDataSource } from "../config/database";
import { ProjectMember } from "../models/ProjectMember";

const projectMemberRepo = () => AppDataSource.getRepository(ProjectMember);

export const ProjectMemberRepository = {
  create: (data: Partial<ProjectMember>) =>
    projectMemberRepo().create(data),

  save: (member: ProjectMember) => projectMemberRepo().save(member),

  remove: (member: ProjectMember) => projectMemberRepo().remove(member),

  findByProjectAndUser: (projectId: string, userId: string) =>
    projectMemberRepo().findOne({ where: { projectId, userId } }),

  findByProject: (projectId: string) =>
    projectMemberRepo().find({
      where: { projectId },
      relations: { user: true },
      order: { createdAt: "ASC" },
    }),

  findUserProjectIds: (userId: string) =>
    projectMemberRepo()
      .createQueryBuilder("pm")
      .select('pm."projectId"')
      .where("pm.\"userId\" = :userId", { userId })
      .getRawMany()
      .then((rows) => rows.map((r: { projectId: string }) => r.projectId)),

  deleteByProjectAndUser: (projectId: string, userId: string) =>
    projectMemberRepo().delete({ projectId, userId }),

  isMember: async (projectId: string, userId: string): Promise<boolean> => {
    const count = await projectMemberRepo().count({
      where: { projectId, userId },
    });
    return count > 0;
  },
};
