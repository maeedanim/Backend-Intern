import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateReplyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  replyDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  commentId: string;
}
