import app from "../../app";
import { AppDataSource } from "../../config/database";

export const setupTestDB = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
};

export const teardownTestDB = async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
};
export const clearDB = async () => {
  const entities = AppDataSource.entityMetadatas;

  for (const entity of entities) {
    const tableName = entity.tableName;

    await AppDataSource.query(
      `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`,
    );
  }
};

export { app };
