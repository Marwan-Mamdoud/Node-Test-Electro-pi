import Redis from "ioredis";

let redisConnected = false;

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  enableOfflineQueue: true,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("connect", () => {
  if (!redisConnected) {
    console.log("✅ Redis connected");
    redisConnected = true;
  }
});

redis.on("error", (err) => {
  if (redisConnected) {
    console.error("❌ Redis connection lost:", err.message);
    redisConnected = false;
  }
});

redis.on("close", () => {
  redisConnected = false;
});

export const isRedisConnected = () => redisConnected;

export default redis;
