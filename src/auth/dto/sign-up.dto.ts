import { IsEmail, IsString, Length } from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  password: string;
}
