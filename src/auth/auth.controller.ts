/* eslint-disable  @typescript-eslint/no-unsafe-member-access */
/* eslint-disable   @typescript-eslint/no-unsafe-argument*/
/* eslint-disable   @typescript-eslint/no-unsafe-assignment*/
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { ClientMetadata } from 'src/shared/decorators/client-metadata.decorator';
import { ClientMetada, jwt_token } from 'src/shared/types';
import { VerificationTokenDto } from './dto/verification-token.dto';
import { EmailDto } from './dto/email.dto';
import { CredentialsSignInDto } from './dto/credentials-sign-in.dto';
import { JwtGuard } from './guards/jwt.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EmailThrottlerGuard } from './guards/email-rate-limit.guard';
import { Response } from 'express';
import { OAuthCallBackGoogleDto } from './dto/oauth-callback-google.dto';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(EmailThrottlerGuard)
  @Post('sign-up')
  async SignUp(
    @Body() body: SignUpDto,
    @ClientMetadata() metadata: ClientMetada,
  ) {
    return this.authService.SignUpEmail(metadata, body);
  }
  @Post('verify-email')
  async verifyEmail(
    @Body() body: VerificationTokenDto,
    @ClientMetadata() metadata: ClientMetada,
  ) {
    const session = await this.authService.verifiyEmailService(metadata, body);
    if (typeof session !== 'string') {
      throw new BadRequestException('Invalid token');
    }
    return { token: session };
  }
  @UseGuards(EmailThrottlerGuard)
  @Post('resend/verification/email')
  async ResendEmailVerification(@Body() body: EmailDto) {
    return this.authService.ResendSignUpVerificationToken(body);
  }
  @UseGuards(EmailThrottlerGuard)
  @Post('sign-in/credentials')
  async LoginCredentialsUser(
    @Body() body: CredentialsSignInDto,
    @ClientMetadata() metadata: ClientMetada,
  ) {
    const session = await this.authService.CredentialsLogin(metadata, body);
    if (typeof session !== 'string') {
      throw new InternalServerErrorException();
    }
    return { token: session };
  }
  @UseGuards(JwtGuard)
  @Get('/me')
  async Me(@Req() req) {
    const jwt_token: null | jwt_token = req?.user;
    if (!jwt_token) throw new UnauthorizedException();
    return this.authService.verify_session(jwt_token);
  }
  @UseGuards(JwtGuard)
  @Get('/me/all')
  async MeAll(@Req() req) {
    const jwt_token: null | jwt_token = req?.user;
    if (!jwt_token) throw new UnauthorizedException();
    return this.authService.GetAllSession(jwt_token);
  }
  @UseGuards(JwtGuard)
  @Delete('logout')
  async LogoutMe(@Req() req) {
    return this.authService.Logout(req?.user);
  }

  @UseGuards(JwtGuard)
  @Delete('logout/all')
  async LogoutMeAll(@Req() req) {
    return this.authService.LogoutAll(req?.user);
  }
  @UseGuards(JwtGuard)
  @Patch('enable/mfa')
  async enableMfa(@Req() req) {
    return this.authService.EnableMFa(req?.user);
  }

  @UseGuards(JwtGuard)
  @Patch('disable/mfa')
  async disableMfa(@Req() req) {
    return this.authService.DisableMFa(req?.user);
  }
  @UseGuards(EmailThrottlerGuard)
  @Get('/reset/password')
  async genChangePassToken(@Body() body: EmailDto) {
    return this.authService.getChangePassToken(body);
  }
  @Patch('/reset/password')
  async ChangePass(@Body() body: ChangePasswordDto) {
    return this.authService.ChangePass(body);
  }
  @Get('/sign-in/google/web')
  GetOAuthUrl(
    @Query() params: { redirect_uri: string; state?: string },
    @Res() res: Response,
  ) {
    if (!params.redirect_uri)
      throw new BadRequestException('missing redirect_uri');
    const url = this.authService.redirectOauthGoogle(params);
    return res.redirect(url);
  }
  @Post('/sign-in/google/web/callback')
  async SignInWithGoogle(
    @Body() body: OAuthCallBackGoogleDto,
    @ClientMetadata() metadata: ClientMetada,
  ) {
    const token = await this.authService.handleOAuthGoogleCallback(
      body,
      metadata,
    );
    return {
      success: true,
      state: Buffer.from(body.state, 'base64url').toString('utf-8'),
      token,
    };
  }
  @Post('/sign-in/mfa')
  async VerifyAndLoginWithMfa(
    @Body() body: VerificationTokenDto,
    @ClientMetadata() metadata: ClientMetada,
  ) {
    const session = await this.authService.handleMFALogin(body, metadata);
    return { token: session };
  }
}
