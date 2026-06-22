import { AppDataSource } from "../config/database";
import { User } from "../models/User";

const userRepo = () => AppDataSource.getRepository(User);

export const UserRepository = {
  findByEmail: (email: string) => userRepo().findOne({ where: { email } }),

  findById: (id: string) => userRepo().findOne({ where: { id } }),

  create: (data: Partial<User>) => userRepo().create(data),

  save: (user: User) => userRepo().save(user),
};
