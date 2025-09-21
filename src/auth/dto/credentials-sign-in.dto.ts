import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CredentialsSignInDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 64)
  password: string;
  @IsString()
  @IsOptional()
  code: string;
  @IsString()
  @IsOptional()
  token_id: string;
}
