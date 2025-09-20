import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { ClientMetadata } from 'src/shared/decorators/client-metadata.decorator';
import { ClientMetada } from 'src/shared/types';
import { VerificationTokenDto } from './dto/verification-token.dto';
import { EmailDto } from './dto/email.dto';

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
    return session;
  }
  @Post('resend/verification/email')
  async ResendEmailVerification(@Body() body: EmailDto) {
    return this.authService.ResendSignUpVerificationToken(body);
  }
}
