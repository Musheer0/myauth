/* eslint-disable  @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientMetada, jwt_token, sendEmailPayload } from 'src/shared/types';
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
import {
  createSession,
  deleteSession,
  deleteSessionAll,
  getAllSession,
  verifySession,
} from './data/tokens/session-token';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendEmailDto } from 'src/shared/dto/send-email.dto';
import { generateOTPEmail } from 'src/shared/templates/email/generate-otp-template';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
  ) {}
  private emitSendEmailEvent(data: SendEmailDto) {
    this.eventEmitter.emit('send:email', data);
  }
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
    this.emitSendEmailEvent({
      html: generateOTPEmail({
        otp: verification_token.opt,
        title: 'Verifiy your email',
        desc: 'verify your email to continue using the account',
        email: data.email,
      }),
      title: 'Verify your email',
      to: data.email,
    });

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
    this.emitSendEmailEvent({
      html: generateOTPEmail({
        otp: verification_token.opt,
        title: 'Verifiy your email',
        desc: 'verify your email to continue using the account',
        email: data.email,
      }),
      title: 'Verify your email',
      to: data.email,
    });
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
    const user = await LoginCrendentialsUser(
      this.prisma,
      data,
      this.emitSendEmailEvent.bind(this),
    );
    const session = await createSession(this.prisma, metadata, user.id);
    const token = this.jwtService.sign(session);
    return token;
  }

  async verify_session(jwt_token: jwt_token) {
    const session_info = await verifySession(this.prisma, jwt_token.token_id, {
      get_user: true,
    });
    if (session_info.user) {
      const { password, prev_password, is_banned, is_banned_at, ...safe_user } =
        session_info.user;
      return { session: session_info.session, user: safe_user };
    }
    return { session: session_info.session, user: null };
  }
  async Logout(jwt_token: jwt_token) {
    return deleteSession(this.prisma, jwt_token.token_id);
  }
  async LogoutAll(jwt_token: jwt_token) {
    return deleteSessionAll(this.prisma, jwt_token);
  }

  async GetAllSession(jwt_token: jwt_token) {
    return getAllSession(this.prisma, jwt_token);
  }
}
