import { PrismaClient } from '@prisma/client';
import { GetUserByEmail } from '../../user/utils';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateVerificationToken } from '.';
import { getFutureDate } from 'src/shared/utils/data-funcs';

export const ResendEmailVerificationToken = async (
  client: PrismaClient,
  email: string,
) => {
  const existing_user = await GetUserByEmail(client, email);
  if (existing_user?.is_email_verified)
    throw new BadRequestException('Email already verified');
  if (!existing_user) throw new BadRequestException('invalid email');
  try {
    const verification_token = await CreateVerificationToken(client, {
      user_id: existing_user.id,
      scope: 'SIGNUP',
      expires_at: getFutureDate(),
    });

    if (process.env.DEV) {
      console.log(verification_token);
    }
    return verification_token;
  } catch (error) {
    console.error(error);
    throw new InternalServerErrorException();
  }
};
