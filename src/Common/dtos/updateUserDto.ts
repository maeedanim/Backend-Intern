import { IsOptional, IsString } from 'class-validator';
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  skill!: string;

  @IsOptional()
  @IsString()
  experience!: string;
}
