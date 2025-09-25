/* eslint-disable  @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, UnauthorizedException } from '@nestjs/common';
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
import { EnableEmailMFA } from './data/user/mfa/enable-mfa';
import { DisableEmailMFA } from './data/user/mfa/disable-mfa';
import {
  changePassword,
  generatePasswordChangeToken,
} from './data/user/change-password/change-password';
import { ChangePasswordDto } from './dto/change-password.dto';
import { getGoogleOauthUrl } from './data/oauth/google/generate-oauth2-url';
import { OAuthCallBackGoogleDto } from './dto/oauth-callback-google.dto';
import { handleCallbackGoogle } from './data/oauth/google/handle_callback';

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
  async EnableMFa(jwt_token: jwt_token) {
    return EnableEmailMFA(this.prisma, jwt_token);
  }
  async DisableMFa(jwt_token: jwt_token) {
    return DisableEmailMFA(this.prisma, jwt_token);
  }
  async getChangePassToken(data: EmailDto) {
    return generatePasswordChangeToken(
      this.prisma,
      data,
      this.emitSendEmailEvent.bind(this),
    );
  }
  async ChangePass(data: ChangePasswordDto) {
    return changePassword(
      this.prisma,
      data,
      this.emitSendEmailEvent.bind(this),
    );
  }
  redirectOauthGoogle(data: { redirect_uri: string; state?: string }) {
    const url = getGoogleOauthUrl(
      data.redirect_uri,
      data.state || data.redirect_uri,
    );
    return url;
  }
  async handleOAuthGoogleCallback(
    data: OAuthCallBackGoogleDto,
    metadata: ClientMetada,
  ) {
    const jwt_token = await handleCallbackGoogle(this.prisma, data, metadata);
    if ('mfa' in jwt_token && 'user' in jwt_token) {
      const verification_token = await CreateVerificationToken(this.prisma, {
        user_id: jwt_token.user.id,
        scope: 'EMAIL_MFA',
        expires_at: getFutureDate(),
      });
      this.emitSendEmailEvent({
        to: jwt_token.user.email,
        title: 'Your MFA code',
        html: generateOTPEmail({
          otp: verification_token.opt,
          title: 'MFA Code',
          slogan: 'use this code to login',
          desc: 'Your one-time login code is below. If you didn’t request this, someone shady might be trying to get in—ignore this email.',
          email: jwt_token.user.email,
        }),
      });
      throw new UnauthorizedException({
        error: 'mfa_required',
        verification_id: verification_token.verification_token.id,
        expires_at: verification_token.verification_token.expires_at,
        message: 'Login blocked. Multi-factor authentication required.',
      });
    }
    const token = this.jwtService.sign(jwt_token);
    return token;
  }

  async handleMFALogin(data: VerificationTokenDto, metadata: ClientMetada) {
    const verification_token = await VerifyToken(this.prisma, {
      id: data.token_id,
      code: data.code,
      scope: 'EMAIL_MFA',
    });
    const session = await createSession(
      this.prisma,
      metadata,
      verification_token.user_id,
    );
    const jwt_token = this.jwtService.sign(session);
    return jwt_token;
  }
}
