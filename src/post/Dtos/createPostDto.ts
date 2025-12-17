import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  postTitle: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  postDescription: string;
}
