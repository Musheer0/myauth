import { $Enums, PrismaClient } from '@prisma/client';
import { hash, verify } from 'argon2';
import { BadRequestException } from '@nestjs/common';
import { generateOtp } from '../../user/utils';
export const GetVerificationTokenById = (client: PrismaClient, id: string) => {
  return client.verification_token.findFirst({
    where: {
      id,
      expires_at: { gt: new Date() },
    },
  });
};

export const GetVerificationTokenByIdScope = (
  client: PrismaClient,
  id: string,
  scope: $Enums.SCOPE,
) => {
  return client.verification_token.findFirst({
    where: {
      id,
      expires_at: { gt: new Date() },
      scope,
    },
  });
};
export const CreateVerificationToken = async (
  client: PrismaClient,
  options: { user_id: string; scope: $Enums.SCOPE; expires_at?: Date },
) => {
  const opt = generateOtp();
  const hashed_otp = await hash(opt);
  const v_token = await client.verification_token.create({
    data: {
      user_id: options.user_id,
      scope: options.scope,
      code: hashed_otp,
      expires_at: options.expires_at || new Date(),
    },
  });
  return {
    opt,
    verification_token: { ...v_token },
  };
};

export const VerifyToken = async (
  client: PrismaClient,
  options: { id: string; code: string; scope: $Enums.SCOPE },
) => {
  const token = await client.verification_token.findUnique({
    where: { id: options.id },
  });

  if (!token) {
    throw new BadRequestException('Token not found');
  }
  if (token.expires_at && token.expires_at < new Date()) {
    throw new BadRequestException('Token expired');
  }
  if (token.scope !== options.scope) {
    throw new BadRequestException('Invalid Token');
  }
  const valid = await verify(token.code, options.code);
  if (!valid) {
    throw new BadRequestException('Invalid code');
  }
  await client.verification_token.delete({
    where: {
      id: token.id,
    },
  });
  return token;
};
