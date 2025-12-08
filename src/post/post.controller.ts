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
import { CreatePostDto } from '../Common/dtos/createPostDto';
import { UpdatePostDto } from '../Common/dtos/updatePostDto';
import { Post as postEntity } from '../Common/schema/post.entity';
import { AuthGuard } from '../guards/auth.guard';
import { PostService } from './post.service';

@UseGuards(AuthGuard)
@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Get()
  getAllPost(): Promise<postEntity[]> {
    return this.postService.getAllPost();
  }

  @Get('/:id')
  getPostId(@Param('id') id: string) {
    return this.postService.getPostById(id);
  }

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

  @Delete('/:id')
  async deletePostById(@Param('id') id: string): Promise<object> {
    await this.postService.deletePostById(id);
    return { message: `Post Has Been Removed.` };
  }

  @Patch('/:id')
  async updatePostById(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<postEntity> {
    return await this.postService.updatePostTitleDescription(id, updatePostDto);
  }
}
