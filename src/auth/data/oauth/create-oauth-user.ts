import { $Enums, PrismaClient } from '@prisma/client';
import { BadGatewayException } from '@nestjs/common';
import { GetUserByEmail } from '../user/utils';
import { OAuthSignUpDto } from 'src/auth/dto/oauth-sign-up.dto';
import { redis } from 'src/shared/redis';
import { getUserEmailKey, getUserIdKey } from 'src/shared/utils';

export const CreateOAuthUser = async (
  prisma: PrismaClient,
  data: OAuthSignUpDto,
  provider: $Enums.PROVIDER,
) => {
  const exisiting_user = await GetUserByEmail(prisma, data.email);
  if (exisiting_user) {
    if (exisiting_user.is_banned) {
      throw new BadGatewayException('email id is banned');
    }

    if (!exisiting_user.is_email_verified) {
      const img =
        exisiting_user.image_url ==
        'https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg'
          ? { image_url: data.picture }
          : {};
      await prisma.user.update({
        where: {
          id: exisiting_user.id,
        },
        data: {
          email_verified_at: new Date(),
          is_email_verified: true,
          ...img,
        },
      });
      await redis.set(
        getUserIdKey(exisiting_user.id),
        {
          ...exisiting_user,
          email_verified_at: new Date(),
          is_email_verified: true,
        },
        {
          ex: 5 * 60 * 60,
        },
      );
      await redis.set(
        getUserEmailKey(exisiting_user.email),
        {
          ...exisiting_user,
          email_verified_at: new Date(),
          is_email_verified: true,
        },
        {
          ex: 5 * 60 * 60,
        },
      );
    }
    return exisiting_user;
  }
  const new_user = await prisma.user.create({
    data: {
      email: data.email,
      image_url: data.picture,
      is_email_verified: true,
      email_verified_at: new Date(),
      intial_provider: provider,
    },
  });
  await redis.set(getUserIdKey(new_user.id), new_user, {
    ex: 5 * 60 * 60,
  });
  await redis.set(getUserEmailKey(new_user.email), new_user, {
    ex: 5 * 60 * 60,
  });
  return new_user;
};
