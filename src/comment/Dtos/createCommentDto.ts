import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  commentTitle!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  commentDescription!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  postId!: string;
}
