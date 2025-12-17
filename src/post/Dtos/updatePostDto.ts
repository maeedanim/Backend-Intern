import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class UpdatePostDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  postTitle: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  postDescription: string;
}
