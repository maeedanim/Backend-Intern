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
import { CreatePostDto } from './Dtos/createPostDto';
import { UpdatePostDto } from './Dtos/updatePostDto';
import { PostService } from './post.service';
import { Post as postEntity } from './Schemas/post.entity';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @ApiOperation({ summary: 'Search all Posts' })
  @Get()
  getAllPost(): Promise<postEntity[]> {
    return this.postService.getAllPost();
  }

  @ApiOperation({ summary: 'Search a specific Posts using ID' })
  @Get('/:id')
  getPostId(@Param('id') id: string) {
    return this.postService.getPostById(id);
  }

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

  @ApiOperation({ summary: 'Delete a Post using ID' })
  @Delete('/:id')
  async deletePostById(@Param('id') id: string): Promise<object> {
    await this.postService.deletePostById(id);
    return { message: `Post Has Been Removed.` };
  }

  @ApiOperation({ summary: 'Update the details of the Post' })
  @Patch('/:id')
  async updatePostById(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<postEntity> {
    return await this.postService.updatePostTitleDescription(id, updatePostDto);
  }
}
