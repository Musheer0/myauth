import { PrismaClient } from '@prisma/client';
import { jwt_token } from 'src/shared/types';
import { verifySession } from '../../tokens/session-token';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

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
  await client.user.update({
    where: {
      id: session.user?.id,
    },
    data: {
      mfa_enabled: true,
      mfa_enabled_at: new Date(),
    },
  });
  return { mfa_enabled: true };
};
