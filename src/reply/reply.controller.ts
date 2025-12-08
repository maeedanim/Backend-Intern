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
import { error } from 'console';
import type { Request } from 'express';
import { CreateReplyDto } from '../Common/dtos/createReplyDto';
import { Reply } from '../Common/schema/reply.entity';
import { AuthGuard } from '../guards/auth.guard';
import { ReplyService } from './reply.service';

@UseGuards(AuthGuard)
@Controller('reply')
export class ReplyController {
  constructor(private replyService: ReplyService) {}

  @Get()
  getAllreply(): Promise<Reply[]> {
    return this.replyService.getAllReply();
  }

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

  @Get('/:id')
  getReplyById(@Param('id') id: string) {
    return this.replyService.getReplyById(id);
  }

  @Delete('/:id')
  async deleteReplyById(@Param('id') id: string): Promise<object> {
    await this.replyService.deleteReplyById(id);
    return { message: `Reply Has Been Removed.` };
  }
}
