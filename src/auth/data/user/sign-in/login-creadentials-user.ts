import { PrismaClient } from '@prisma/client';
import { GetUserByEmail } from '../utils';
import { CredentialsSignInDto } from 'src/auth/dto/credentials-sign-in.dto';
import { BadRequestException } from '@nestjs/common';
import { verify } from 'argon2';

export const LoginCrendentialsUser = async (
  client: PrismaClient,
  data: CredentialsSignInDto,
) => {
  const user = await GetUserByEmail(client, data.email);
  if (!user) throw new BadRequestException('invalid credentials');
  if (!user.password) throw new BadRequestException('invalid credentials');
  const isCorrectPassword = await verify(user.password, data.password);
  if (!isCorrectPassword) throw new BadRequestException('invalid credentials');
  if (user.email_mfa_enabled) {
    //TODO handle mfa
    throw new BadRequestException('mfa not supported yet');
  }
  if (user.is_banned) throw new BadRequestException('this email id banned');
  return user;
};
