import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateReactionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  replyId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  commentId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  postId!: string;
}
