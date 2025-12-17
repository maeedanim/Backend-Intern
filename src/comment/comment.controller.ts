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
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { error } from 'console';
import type { Request } from 'express';

import { AuthGuard } from '../guards/auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './Dtos/createCommentDto';
import { UpdateCommentDto } from './Dtos/updateCommentDto';
import { Comment } from './schema/comment.entity';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @ApiOperation({ summary: 'Search all Comments' })
  @Get()
  getAllComment(): Promise<Comment[]> {
    return this.commentService.getAllComment();
  }

  @ApiOperation({ summary: 'Search a specific comments using ID' })
  @Get('/:id')
  getCommentById(@Param('id') id: string) {
    return this.commentService.getCommentById(id);
  }

  @ApiOperation({ summary: 'Create a Comment' })
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

  @ApiOperation({ summary: 'Delete a Comment using ID' })
  @Delete('/:id')
  async deleteCommentById(
    @Req() req: Request,
    @Param('id') commentId: string,
  ): Promise<object> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new error('Invalid User');
    }
    await this.commentService.deleteCommentById(commentId, userId);
    return { message: `Comment Has Been Removed.` };
  }

  @ApiOperation({ summary: 'Update the description of the comment' })
  @Patch('/:id')
  async updateCommentById(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() UpdateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new error('Invalid User');
    }
    return await this.commentService.updateCommentTitleDescription(
      id,
      UpdateCommentDto,
      userId,
    );
  }
}
