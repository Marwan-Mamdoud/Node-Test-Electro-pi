import { DataSource } from "typeorm";
import { seedUsers } from "./1719072000000-SeedUsers";
import { seedProjects } from "./1719072000001-SeedProjects";
import { seedTasks } from "./1719072000002-SeedTasks";

export const runSeeds = async (dataSource: DataSource): Promise<void> => {
  console.log("🌱 Running seeds...");
  await seedUsers(dataSource);
  await seedProjects(dataSource);
  await seedTasks(dataSource);
  console.log("🌱 Seeds completed");
};
