import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateReplyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  r_description!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  commentId!: string;
}
