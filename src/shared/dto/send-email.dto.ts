import { IsEmail, IsString } from 'class-validator';

export class SendEmailDto {
  @IsString()
  html: string;

  @IsEmail()
  to: string;

  @IsString()
  title: string;
}
