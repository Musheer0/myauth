import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient, verification_token } from '@prisma/client';
import { ClientMetada } from 'src/shared/types';
import { createSession } from '../../tokens/session-token';
import { redis } from 'src/shared/redis';
import { getUserEmailKey, getUserIdKey } from 'src/shared/utils';

export const VerifyEmail = async (
  client: PrismaClient,
  metadata: ClientMetada,
  token: verification_token,
) => {
  if (token.scope !== 'SIGNUP') {
    throw new BadRequestException('Invalid token');
  }
  try {
    const updated_user = await client.user.update({
      where: {
        id: token.user_id,
        is_email_verified: false,
      },
      data: {
        email_verified_at: new Date(),
        is_email_verified: true,
      },
    });
    try {
      await redis.set(getUserIdKey(updated_user.id), updated_user, {
        ex: 5 * 60 * 60,
      });
      await redis.set(getUserEmailKey(updated_user.email), updated_user, {
        ex: 5 * 60 * 60,
      });
    } catch {
      console.log('cache error');
    }
    const session = await createSession(client, metadata, updated_user.id);
    return session;
  } catch (error) {
    console.error(error);
    throw new InternalServerErrorException();
  }
};
