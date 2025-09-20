import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
export function generateOtp() {
  const num = crypto.randomInt(0, 1_000_000);
  return num.toString().padStart(6, '0'); // "042371"
}
export const GetUserByEmail = (
  client: PrismaClient,
  email: string,
  options?: { strict: boolean },
) => {
  return options?.strict
    ? client.user.findFirst({
        where: {
          email,
          is_banned: false,
        },
      })
    : client.user.findFirst({
        where: {
          email,
        },
      });
};

export const GetUserById = (
  client: PrismaClient,
  id: string,
  options?: { strict: boolean },
) => {
  return options?.strict
    ? client.user.findFirst({
        where: {
          id,
          is_banned: false,
        },
      })
    : client.user.findFirst({
        where: {
          id,
        },
      });
};
