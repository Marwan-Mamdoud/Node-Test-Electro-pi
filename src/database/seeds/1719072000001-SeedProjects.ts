import { DataSource } from "typeorm";
import { Project, ProjectStatus } from "../../models/Project";
import { User } from "../../models/User";

export const seedProjects = async (dataSource: DataSource): Promise<void> => {
  const projectRepo = dataSource.getRepository(Project);
  const userRepo = dataSource.getRepository(User);

  const existing = await projectRepo.findOne({
    where: { title: "Sample Project" },
  });
  if (existing) {
    console.log("Projects already seeded");
    return;
  }

  const admin = await userRepo.findOne({ where: { email: "admin@test.com" } });
  if (!admin) {
    console.log("No admin user found, skipping project seed");
    return;
  }

  const projects = [
    {
      title: "Sample Project",
      description: "A sample project for testing",
      status: "active" as ProjectStatus,
      ownerId: admin.id,
    },
    {
      title: "Archived Project",
      description: "An archived project example",
      status: "archived" as ProjectStatus,
      ownerId: admin.id,
    },
  ];

  await projectRepo.save(projects);
  console.log("✅ Projects seeded");
};
