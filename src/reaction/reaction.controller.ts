import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { error } from 'console';
import type { Request } from 'express';
import { AuthGuard } from '../guards/auth.guard';
import { CreateReactionDto } from './Dtos/createReactionDto';
import { ReactionService } from './reaction.service';
import { Reaction } from './Schemas/reaction.entity';

@ApiBearerAuth()
@Controller('reactions')
export class ReactionController {
  constructor(private reactionService: ReactionService) {}

  @ApiOperation({ summary: 'Post a Reaction on POST, COMMENT or REPLY' })
  @UseGuards(AuthGuard)
  @Post()
  async react(
    @Req() req: Request,
    @Body() createReactionDto: CreateReactionDto,
  ): Promise<Reaction | { removed: boolean }> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new error('Invalid User');
    }
    return this.reactionService.react(userId, createReactionDto);
  }

  @ApiOperation({ summary: 'Search all Reactions on POST, COMMENT or REPLY' })
  @Get(':targetId')
  async getReactions(
    @Param('targetId') targetId: string,
    @Query('onModel') onModel: 'Post' | 'Comment' | 'Reply',
  ) {
    return this.reactionService.getReactions(targetId, onModel);
  }

  @ApiOperation({
    summary: 'Count Reactions - LIKES OR DISLIKES on POST, COMMENT or REPLY',
  })
  @Get(':targetId/count')
  async countReactions(
    @Param('targetId') targetId: string,
    @Query('onModel') onModel: 'Post' | 'Comment' | 'Reply',
  ) {
    return this.reactionService.count(targetId, onModel);
  }
}
