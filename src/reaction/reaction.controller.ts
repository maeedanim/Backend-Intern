import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateReactionDto } from './Dtos/createReactionDto';
import { ReactionTarget } from './reaction-type.enum';
import { ReactionService } from './reaction.service';

@ApiBearerAuth()
@Controller('reactions')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @ApiOperation({ summary: 'Post a reaction on Post, Comment, or Reply' })
  @UseGuards(AuthGuard)
  @Post()
  async react(
    @Req() req: Request,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('Invalid user');
    }

    return this.reactionService.react(userId, createReactionDto);
  }

  @ApiOperation({ summary: 'Get all reactions for a target' })
  @Get(':targetId')
  async getReactions(
    @Param('targetId') targetId: string,
    @Query('onModel') onModel: ReactionTarget,
  ) {
    return this.reactionService.getReactions(targetId, onModel);
  }

  @ApiOperation({
    summary: 'Count likes and dislikes for a target',
  })
  @Get(':targetId/count')
  async countReactions(
    @Param('targetId') targetId: string,
    @Query('onModel') onModel: ReactionTarget,
  ) {
    return this.reactionService.countReactions(targetId, onModel);
  }
}
