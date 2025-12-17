import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  skill: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  experience: string;
}
