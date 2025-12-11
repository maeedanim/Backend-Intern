import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class UpdateCommentDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  c_title!: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  c_description!: string;
}
