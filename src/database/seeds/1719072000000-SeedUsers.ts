import { DataSource } from "typeorm";
import bcrypt from "bcryptjs";
import { User, UserRole } from "../../models/User";

export const seedUsers = async (dataSource: DataSource): Promise<void> => {
  const userRepo = dataSource.getRepository(User);

  const existing = await userRepo.findOne({
    where: { email: "admin@test.com" },
  });
  if (existing) {
    console.log("Users already seeded");
    return;
  }

  const users = [
    {
      name: "Admin User",
      email: "admin@test.com",
      password: await bcrypt.hash("admin123", 10),
      role: "admin" as UserRole,
    },
    {
      name: "Member User",
      email: "member@test.com",
      password: await bcrypt.hash("member123", 10),
      role: "member" as UserRole,
    },
  ];

  await userRepo.save(users);
  console.log("✅ Users seeded");
};
