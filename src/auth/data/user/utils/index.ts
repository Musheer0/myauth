import { PrismaClient, user } from '@prisma/client';
import { redis } from 'src/shared/redis';
import { getUserEmailKey, getUserIdKey } from 'src/shared/utils';
export function generateOtp() {
  return '042371';
}
export const GetUserByEmail = async (
  client: PrismaClient,
  email: string,
  options?: { strict: boolean },
) => {
  const key = getUserEmailKey(email);
  const cache = await redis.get<user>(key);
  if (cache) {
    if (options?.strict) {
      if (cache.is_banned) {
        return null;
      }
    }
    return cache;
  }
  const user = options?.strict
    ? await client.user.findFirst({
        where: {
          email,
          is_banned: false,
        },
      })
    :await client.user.findFirst({
        where: {
          email,
        },
      });
  await redis.set(key, user, { ex: 5 * 60 * 60 });
  return user;
};

export const GetUserById = async (
  client: PrismaClient,
  id: string,
  options?: { strict: boolean },
) => {
  const key = getUserIdKey(id);
  const cache = await redis.get<user>(key);
  if (cache) {
    if (options?.strict) {
      if (cache.is_banned) {
        return null;
      }
    }
    return cache;
  }
  const user = options?.strict
    ?await client.user.findFirst({
        where: {
          id,
          is_banned: false,
        },
      })
    : await client.user.findFirst({
        where: {
          id,
        },
      });
  await redis.set(key, user, { ex: 5 * 60 * 60 });
  return user;
};
