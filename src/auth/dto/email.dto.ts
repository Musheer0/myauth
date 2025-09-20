import { IsEmail, IsString } from 'class-validator';

export class EmailDto {
  @IsString()
  @IsEmail()
  email: string;
}
