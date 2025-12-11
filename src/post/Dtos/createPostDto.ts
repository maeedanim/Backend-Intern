import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  p_title!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  p_description!: string;
}
