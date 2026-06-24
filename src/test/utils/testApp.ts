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
  const options = AppDataSource.options as { schema?: string };

  for (const entity of entities) {
    const schema = entity.schema ?? options.schema ?? "public";
    const tableName = entity.tableName;

    await AppDataSource.query(
      `TRUNCATE TABLE "${schema}"."${tableName}" RESTART IDENTITY CASCADE`,
    );
  }
};

export { app };
