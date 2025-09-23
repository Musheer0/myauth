import { Redis } from '@upstash/redis';
export const redis = Redis.fromEnv();
export const updateCache = async <T>(
  key: string,
  data: Partial<T>,
  options?: { throwError?: boolean },
): Promise<T | { error: string }> => {
  const old = await redis.get<T>(key);

  if (!old) {
    if (options?.throwError) {
      throw new Error('cache not found');
    }
    return { error: 'cache not found' };
  }

  const new_data = { ...old, ...data };
  await redis.set(key, new_data);
  return new_data;
};
