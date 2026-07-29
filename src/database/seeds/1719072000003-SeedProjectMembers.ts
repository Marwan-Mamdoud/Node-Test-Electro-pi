import { DataSource } from "typeorm";
import { ProjectMember } from "../../models/ProjectMember";
import { Project } from "../../models/Project";
import { User } from "../../models/User";

export const seedProjectMembers = async (
  dataSource: DataSource,
): Promise<void> => {
  const pmRepo = dataSource.getRepository(ProjectMember);
  const projectRepo = dataSource.getRepository(Project);
  const userRepo = dataSource.getRepository(User);

  const existing = await pmRepo.findOne({ where: {} });
  if (existing) {
    console.log("Project members already seeded");
    return;
  }

  const project = await projectRepo.findOne({
    where: { title: "Sample Project" },
  });
  const member = await userRepo.findOne({
    where: { email: "member@test.com" },
  });

  if (!project || !member) {
    console.log("Missing project or member user, skipping project member seed");
    return;
  }

  const projectMember = pmRepo.create({
    projectId: project.id,
    userId: member.id,
  });
  await pmRepo.save(projectMember);
  console.log("✅ Project members seeded");
};
