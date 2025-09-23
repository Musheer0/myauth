import { PrismaClient } from '@prisma/client';
import { EmailDto } from 'src/auth/dto/email.dto';
import { GetUserByEmail } from '../utils';
import { BadRequestException } from '@nestjs/common';
import {
  CreateVerificationToken,
  VerifyToken,
} from '../../tokens/verification-token';
import { getFutureDate } from 'src/shared/utils/data-funcs';
import { sendEmailPayload } from 'src/shared/types';
import { generateOTPEmail } from 'src/shared/templates/email/generate-otp-template';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { hash } from 'argon2';
import { redis } from 'src/shared/redis';
import { getUserEmailKey, getUserIdKey } from 'src/shared/utils';
import { deleteSessionAllByEmail } from '../../tokens/session-token';
import { generatePasswordChangeEmail } from 'src/shared/templates/email/generate-pass-change-template';

export const generatePasswordChangeToken = async (
  client: PrismaClient,
  data: EmailDto,
  sendEmail: (data: sendEmailPayload) => void,
) => {
  const user = await GetUserByEmail(client, data.email, { strict: true });
  if (!user) throw new BadRequestException('invalid email id');
  if (!user.is_email_verified)
    throw new BadRequestException('email not verified');
  const v_token = await CreateVerificationToken(client, {
    user_id: user.id,
    scope: 'PASSWORD_EDIT',
    expires_at: getFutureDate(),
  });
  sendEmail({
    title: 'Reset your password',
    html: generateOTPEmail({
      otp: v_token.opt,
      title: 'Reset your password',
      desc: 'use this code to reset your password',
      email: user.email,
    }),
    to: user.email,
  });
  return {
    verification_id: v_token.verification_token.id,
    expires_at: v_token.verification_token.expires_at,
  };
};
export const changePassword = async (
  client: PrismaClient,
  data: ChangePasswordDto,
  sendEmail: (data: sendEmailPayload) => void,
) => {
  const verification_token = await VerifyToken(client, {
    id: data.token_id,
    code: data.code,
    scope: 'PASSWORD_EDIT',
  });
  const hashed_pass = await hash(data.password);
  const updated_user = await client.user.update({
    where: {
      id: verification_token.user_id,
      is_email_verified: true,
    },
    data: {
      password: hashed_pass,
    },
  });
  sendEmail({
    title: 'Reset your password',
    html: generatePasswordChangeEmail({
      email: updated_user.email,
    }),
    to: updated_user.email,
  });
  await deleteSessionAllByEmail(client, updated_user.email);

  await redis.set(getUserIdKey(updated_user.id), updated_user, {
    ex: 5 * 60 * 60,
  });
  await redis.set(getUserEmailKey(updated_user.email), updated_user, {
    ex: 5 * 60 * 60,
  });
  return { success: true };
};
