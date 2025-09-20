import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { GetUserByEmail } from '../utils';
import { PrismaClient } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { hash } from 'argon2';

export const CreateEmailUser = async (
  prisma: PrismaClient,
  data: SignUpDto,
) => {
  const exisiting_user = await GetUserByEmail(prisma, data.email);
  if (exisiting_user) {
    throw new BadRequestException('email in use');
  }
  const hash_passowrd = await hash(data.password);
  const new_user = await prisma.user.create({
    data: {
      email: data.email,
      password: hash_passowrd,
    },
  });
  return new_user;
};
