import { AppDataSource } from "../config/database";
import { User } from "../models/User";

const userRepo = () => AppDataSource.getRepository(User);

export interface UserListOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  search?: string;
}

export const UserRepository = {
  findByEmail: (email: string) => userRepo().findOne({ where: { email } }),

  findById: (id: string) => userRepo().findOne({ where: { id } }),

  create: (data: Partial<User>) => userRepo().create(data),

  save: (user: User) => userRepo().save(user),

  delete: (id: string) => userRepo().delete(id),

  update: (id: string, data: Partial<User>) => userRepo().update(id, data),

  find: (options?: any) => userRepo().find(options),

  findAllWithPagination: (options: UserListOptions) => {
    const qb = userRepo().createQueryBuilder("user");

    if (options.search) {
      qb.where("(user.name ILIKE :search OR user.email ILIKE :search)", {
        search: `%${options.search}%`,
      });
    }

    const sortColumn =
      options.sortBy === "name"
        ? "user.name"
        : options.sortBy === "email"
          ? "user.email"
          : options.sortBy === "role"
            ? "user.role"
            : "user.createdAt";
    qb.orderBy(sortColumn, options.sortOrder || "DESC");
    qb.skip((options.page - 1) * options.limit);
    qb.take(options.limit);

    return qb.getManyAndCount();
  },
};
