import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateReplyDto {
  @IsNotEmpty()
  @IsString()
  r_description!: string;

  @IsNotEmpty()
  @IsMongoId()
  commentId!: string;
}
