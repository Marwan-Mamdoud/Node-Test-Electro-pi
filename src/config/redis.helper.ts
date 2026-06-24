import redis from "./redis";

export const deleteByPattern = async (pattern: string) => {
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100,
    );

    cursor = nextCursor;

    if (keys.length) {
      await redis.del(...keys);
    }
  } while (cursor !== "0");
};
