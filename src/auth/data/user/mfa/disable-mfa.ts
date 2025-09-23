import { PrismaClient } from '@prisma/client';
import { jwt_token } from 'src/shared/types';
import { verifySession } from '../../tokens/session-token';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { redis } from 'src/shared/redis';
import { getUserEmailKey, getUserIdKey } from 'src/shared/utils';

export const DisableEmailMFA = async (
  client: PrismaClient,
  jwt_token: jwt_token,
) => {
  const session = await verifySession(client, jwt_token.token_id, {
    get_user: true,
  });
  if (!session.session || !session.user) {
    throw new UnauthorizedException();
  }
  if (!session.user?.mfa_enabled) {
    throw new BadRequestException('mfa not enabled');
  }
  const updated_user = await client.user.update({
    where: {
      id: session.user?.id,
    },
    data: {
      mfa_enabled: false,
      mfa_enabled_at: null,
    },
  });
  await redis.set(getUserIdKey(updated_user.id), updated_user, {
    ex: 5 * 60 * 60,
  });
  await redis.set(getUserEmailKey(updated_user.email), updated_user, {
    ex: 5 * 60 * 60,
  });
  return { mfa_enabled: false };
};
