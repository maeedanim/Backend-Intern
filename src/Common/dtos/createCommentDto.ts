import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  c_title!: string;

  @IsNotEmpty()
  @IsString()
  c_description!: string;

  @IsNotEmpty()
  @IsMongoId()
  postId!: string;
}
