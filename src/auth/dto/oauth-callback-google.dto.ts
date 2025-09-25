import { IsOptional, IsString } from 'class-validator';

export class OAuthCallBackGoogleDto {
  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  state: string;

  @IsString()
  redirect_uri: string;
}
