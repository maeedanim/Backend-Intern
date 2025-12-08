import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  p_title!: string;

  @IsNotEmpty()
  @IsString()
  p_description!: string;
}
