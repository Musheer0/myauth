import { PrismaClient } from '@prisma/client';
import { jwt_token } from 'src/shared/types';
import { verifySession } from '../../tokens/session-token';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { getUserEmailKey, getUserIdKey } from 'src/shared/utils';
import { redis } from 'src/shared/redis';

export const EnableEmailMFA = async (
  client: PrismaClient,
  jwt_token: jwt_token,
) => {
  const session = await verifySession(client, jwt_token.token_id, {
    get_user: true,
  });
  if (!session.session || !session.user) {
    throw new UnauthorizedException();
  }
  if (session.user?.mfa_enabled) {
    throw new BadRequestException('mfa already enabled');
  }
  const updated_user = await client.user.update({
    where: {
      id: session.user?.id,
    },
    data: {
      mfa_enabled: true,
      mfa_enabled_at: new Date(),
    },
  });
  await redis.set(getUserIdKey(updated_user.id), updated_user, {
    ex: 5 * 60 * 60,
  });
  await redis.set(getUserEmailKey(updated_user.email), updated_user, {
    ex: 5 * 60 * 60,
  });
  return { mfa_enabled: true };
};
