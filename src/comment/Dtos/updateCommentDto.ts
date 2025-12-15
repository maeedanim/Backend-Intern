import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class UpdateCommentDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  commentTitle!: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  commentDescription!: string;
}
