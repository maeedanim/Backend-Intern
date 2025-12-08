import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { error } from 'console';
import type { Request } from 'express';
import { CreateCommentDto } from '../Common/dtos/createCommentDto';
import { UpdateCommentDto } from '../Common/dtos/updateCommentDto';
import { Comment } from '../Common/schema/comment.entity';
import { AuthGuard } from '../guards/auth.guard';
import { CommentService } from './comment.service';

@UseGuards(AuthGuard)
@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get()
  getAllcomment(): Promise<Comment[]> {
    return this.commentService.getAllComment();
  }

  @Get('/:id')
  getCommentById(@Param('id') id: string) {
    return this.commentService.getCommentById(id);
  }

  @Post()
  createComment(
    @Req() req: Request,
    @Body() CreateCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new error('Invalid User');
    }
    return this.commentService.createComment(CreateCommentDto, userId);
  }

  @Delete('/:id')
  async deleteCommentById(@Param('id') id: string): Promise<object> {
    await this.commentService.deleteCommentById(id);
    return { message: `Comment Has Been Removed.` };
  }

  @Patch('/:id')
  async updateCommentById(
    @Param('id') id: string,
    @Body() UpdateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    return await this.commentService.updateCommentTitleDescription(
      id,
      UpdateCommentDto,
    );
  }
}
