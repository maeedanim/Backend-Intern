import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { error } from 'console';
import type { Request } from 'express';
import { AuthGuard } from '../guards/auth.guard';
import { CreateReplyDto } from './Dtos/createReplyDto';
import { ReplyService } from './reply.service';
import { Reply } from './Schemas/reply.entity';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('reply')
export class ReplyController {
  constructor(private replyService: ReplyService) {}

  @ApiOperation({ summary: 'Search all Replies' })
  @Get()
  getAllreply(): Promise<Reply[]> {
    return this.replyService.getAllReply();
  }

  @ApiOperation({ summary: 'Create a Reply' })
  @Post()
  createReply(
    @Req() req: Request,
    @Body() createReplyDto: CreateReplyDto,
  ): Promise<Reply> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new error('Invalid User');
    }
    return this.replyService.createReply(createReplyDto, userId);
  }

  @ApiOperation({ summary: 'Search a Specific Reply using ID' })
  @Get('/:id')
  getReplyById(@Param('id') id: string) {
    return this.replyService.getReplyById(id);
  }

  @ApiOperation({ summary: 'Delete a Reply using ID' })
  @Delete('/:id')
  async deleteReplyById(
    @Req() req: Request,
    @Param('id') replyId: string,
  ): Promise<object> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new error('Invalid User');
    }
    await this.replyService.deleteReplyById(replyId, userId);
    return { message: `Reply Has Been Removed.` };
  }
}
