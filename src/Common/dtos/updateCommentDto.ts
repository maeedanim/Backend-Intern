import { IsOptional, IsString } from 'class-validator';
export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  c_title!: string;

  @IsOptional()
  @IsString()
  c_description!: string;
}
