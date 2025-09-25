import { IsEmail, IsOptional, IsString } from 'class-validator';

export class OAuthSignUpDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  picture: string;

  @IsString()
  @IsOptional()
  access_token: string;

  @IsString()
  @IsOptional()
  refresh_token: string;

  @IsString()
  scopes: string;
}
