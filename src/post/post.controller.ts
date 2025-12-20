import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { error } from 'console';
import type { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreatePostDto } from './Dtos/createPostDto';
import { UpdatePostDto } from './Dtos/updatePostDto';
import { AggregatedPost } from './post-aggregate.interface';
import { PostService } from './post.service';
import { PostingWindowGuard } from './posting-window/guards/postingWindow.guard';
import { Post as postEntity } from './Schemas/post.entity';
@ApiBearerAuth()
@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get Ranked posts based on Reactions and Comments' })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
  })
  @Get('/ranked')
  async getRankedPosts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number,
  ): Promise<AggregatedPost[]> {
    return await this.postService.getRankedPosts(limit);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Search all Posts with comments and Replies' })
  @Get()
  getAllPost(): Promise<AggregatedPost[]> {
    return this.postService.getAllPost();
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Search a specific Post with comments and replies using ID',
  })
  @Get('/:id')
  getPostByID(@Param('id') id: string): Promise<AggregatedPost> {
    return this.postService.getPostByID(id);
  }

  @UseGuards(AuthGuard, PostingWindowGuard)
  @ApiOperation({ summary: 'Create a Post' })
  @Post()
  async createPost(
    @Req() req: Request,
    @Body() CreatePostDto: CreatePostDto,
  ): Promise<postEntity> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new error('Invalid User');
    }
    return await this.postService.createPost(CreatePostDto, userId);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a Post using ID' })
  @Delete('/:id')
  async deletePostById(
    @Req() req: Request,
    @Param('id') postid: string,
  ): Promise<object> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new error('Invalid User');
    }
    await this.postService.deletePostById(postid, userId);
    return { message: `Post Has Been Removed.` };
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update the details of the Post' })
  @Patch('/:id')
  async updatePostById(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<postEntity> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new error('Invalid User');
    }
    return await this.postService.updatePostTitleDescription(
      id,
      updatePostDto,
      userId,
    );
  }
}
