import { DataSource } from "typeorm";
import { seedUsers } from "./1719072000000-SeedUsers";
import { seedProjects } from "./1719072000001-SeedProjects";
import { seedTasks } from "./1719072000002-SeedTasks";
import { seedProjectMembers } from "./1719072000003-SeedProjectMembers";

export const runSeeds = async (dataSource: DataSource): Promise<void> => {
  console.log("🌱 Running seeds...");
  await seedUsers(dataSource);
  await seedProjects(dataSource);
  await seedProjectMembers(dataSource);
  await seedTasks(dataSource);
  console.log("🌱 Seeds completed");
};
