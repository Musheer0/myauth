import { IsString, IsUUID, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsUUID()
  token_id: string;

  @IsString()
  code: string;

  @IsString()
  @Length(6, 64)
  password: string;
}
