import redis from "../config/redis";
import { AppDataSource } from "../config/database";

export const checkHealth = async () => {
  const checks = {
    database: false,
    redis: false,
    timestamp: new Date().toISOString(),
  };

  try {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.query("SELECT 1");
    checks.database = true;
    await queryRunner.release();
  } catch (error) {
    console.error("Database health check failed:", error);
  }

  try {
    await redis.ping();
    checks.redis = true;
  } catch (error) {
    console.error("Redis health check failed:", error);
  }

  const isHealthy = checks.database && checks.redis;

  return {
    status: isHealthy ? "healthy" : "unhealthy",
    uptime: process.uptime(),
    checks,
  };
};
