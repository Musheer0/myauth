import { PrismaClient, user } from '@prisma/client';
import { GetUserByEmail } from '../utils';
import { CredentialsSignInDto } from 'src/auth/dto/credentials-sign-in.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { verify } from 'argon2';
import { CreateVerificationToken, VerifyToken } from '../../tokens/verification-token';
import { getFutureDate } from 'src/shared/utils/data-funcs';

export const LoginCrendentialsUser = async (
  client: PrismaClient,
  data: CredentialsSignInDto,
) => {
  const user = await GetUserByEmail(client, data.email);
  if (!user) throw new BadRequestException('invalid credentials');
  if (!user.password) throw new BadRequestException('invalid credentials');
  const isCorrectPassword = await verify(user.password, data.password);
  if (user.is_banned) throw new BadRequestException('this email id banned');
  if (!isCorrectPassword) throw new BadRequestException('invalid credentials');
  if (user.email_mfa_enabled) {
    if(data.token_id && data.code){
      const verification_token= await VerifyToken(client,{id:data.token_id,code:data.code,scope:"EMAIL_MFA"});
      console.log(verification_token)
      return user
    }
    await client.verification_token.deleteMany({
      where:{
        user_id:user.id,
        expires_at:{lt:new Date()},
        scope:"EMAIL_MFA"
      }
    });
    const verification_token = await CreateVerificationToken(client,{user_id:user.id,scope:"EMAIL_MFA",expires_at:getFutureDate()});
    //TODO send email
    throw new UnauthorizedException({
    error: "mfa_required",
    verification_id: verification_token.verification_token.id,
    expires_at: verification_token.verification_token.expires_at,
    message: "Login blocked. Multi-factor authentication required.",
    });
  }
  return user;
};
