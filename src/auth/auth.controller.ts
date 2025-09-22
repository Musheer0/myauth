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
  Req,
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

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
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
  @Post('resend/verification/email')
  async ResendEmailVerification(@Body() body: EmailDto) {
    return this.authService.ResendSignUpVerificationToken(body);
  }

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
}
