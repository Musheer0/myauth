import { PrismaClient } from '@prisma/client';
export function generateOtp() {
  return '042371';
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
