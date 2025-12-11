import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateReactionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  target!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(['Post', 'Comment', 'Reply'])
  onModel!: 'Post' | 'Comment' | 'Reply';

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(['like', 'dislike'])
  type!: 'like' | 'dislike';
}
