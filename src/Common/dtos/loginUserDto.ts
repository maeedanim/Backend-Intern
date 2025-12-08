import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginUserDto {
  @IsOptional()
  @IsString()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
