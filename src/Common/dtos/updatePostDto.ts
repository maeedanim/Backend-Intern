import { IsOptional, IsString } from 'class-validator';
export class UpdatePostDto {
  @IsOptional()
  @IsString()
  p_title!: string;

  @IsOptional()
  @IsString()
  p_description!: string;
}
