import { IsString, IsUUID } from 'class-validator';

export class VerificationTokenDto {
  @IsString()
  @IsUUID()
  token_id: string;

  @IsString()
  code: string;
}
