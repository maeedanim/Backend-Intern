import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class UpdatePostDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  p_title!: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  p_description!: string;
}
