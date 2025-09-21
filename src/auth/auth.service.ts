import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientMetada } from 'src/shared/types';
import { SignUpDto } from './dto/sign-up.dto';
import { CreateEmailUser } from './data/user/sign-up/create-email-user';
import {
  CreateVerificationToken,
  VerifyToken,
} from './data/tokens/verification-token';
import { getFutureDate } from 'src/shared/utils/data-funcs';
import { VerificationTokenDto } from './dto/verification-token.dto';
import { VerifyEmail } from './data/user/verification/email-verification';
import { JwtService } from '@nestjs/jwt';
import { $Enums } from '@prisma/client';
import { EmailDto } from './dto/email.dto';
import { ResendEmailVerificationToken } from './data/tokens/verification-token/resend-email-verification-token';
import { CredentialsSignInDto } from './dto/credentials-sign-in.dto';
import { LoginCrendentialsUser } from './data/user/sign-in/login-creadentials-user';
import { createSession } from './data/tokens/session-token';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  private async VerifyToken(data: VerificationTokenDto, scope: $Enums.SCOPE) {
    const verification_token = await VerifyToken(this.prisma, {
      id: data.token_id,
      code: data.code,
      scope,
    });
    return verification_token;
  }
  async ResendSignUpVerificationToken(data: EmailDto) {
    const verification_token = await ResendEmailVerificationToken(
      this.prisma,
      data.email,
    );
    return {
      verification_id: verification_token.verification_token.id,
      expires_at: verification_token.verification_token.expires_at,
    };
  }

  //route handlers

  async SignUpEmail(metadata: ClientMetada, data: SignUpDto) {
    const user = await CreateEmailUser(this.prisma, data);
    const verification_token = await CreateVerificationToken(this.prisma, {
      user_id: user.id,
      scope: 'SIGNUP',
      expires_at: getFutureDate(),
    });
    if (process.env.DEBUG) {
      console.log(verification_token);
    }
    return {
      verification_id: verification_token.verification_token.id,
      expires_at: verification_token.verification_token.expires_at,
    };
  }

  async verifiyEmailService(
    metadata: ClientMetada,
    data: VerificationTokenDto,
  ) {
    const verification_token = await this.VerifyToken(data, 'SIGNUP');
    const session = await VerifyEmail(
      this.prisma,
      metadata,
      verification_token,
    );
    const token = this.jwtService.sign(session);
    return token;
  }

  async CredentialsLogin(metadata: ClientMetada, data: CredentialsSignInDto) {
    if (data.token_id) {
      //TODO remove this block when mfa supported
      throw new BadRequestException('mfa not supported yet');
    }
    const user = await LoginCrendentialsUser(this.prisma, data);
    const session = await createSession(this.prisma, metadata, user.id);
    const token = this.jwtService.sign(session);
    return token;
  }
}
