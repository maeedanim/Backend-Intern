import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  c_title!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  c_description!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  postId!: string;
}
