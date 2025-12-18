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
import { AuthGuard } from '../auth/guards/auth.guard';
import { PostingWindowGuard } from '../posting-window/Guard/postingWindow.guard';
import { CreatePostDto } from './Dtos/createPostDto';
import { UpdatePostDto } from './Dtos/updatePostDto';
import { PostService } from './post.service';
import { Post as postEntity } from './Schemas/post.entity';
@ApiBearerAuth()
@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Search all Posts' })
  @Get()
  getAllPost(): Promise<postEntity[]> {
    return this.postService.getAllPost();
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Search a specific Posts using ID' })
  @Get('/:id')
  getPostById(@Param('id') id: string) {
    return this.postService.getPostById(id);
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
