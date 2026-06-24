import { AppDataSource } from "../config/database";

export default async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
};
