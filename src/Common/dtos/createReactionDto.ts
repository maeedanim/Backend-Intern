import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateReactionDto {
  @IsNotEmpty()
  @IsMongoId()
  replyId!: string;

  @IsNotEmpty()
  @IsMongoId()
  commentId!: string;

  @IsNotEmpty()
  @IsMongoId()
  postId!: string;
}
