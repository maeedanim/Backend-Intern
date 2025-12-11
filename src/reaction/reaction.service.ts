import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateReactionDto } from './Dtos/createReactionDto';
import { Reaction } from './Schemas/reaction.entity';

@Injectable()
export class ReactionService {
  constructor(
    @InjectModel(Reaction.name)
    private reactionModel: Model<Reaction>,
  ) {}

  // -------------------------------------------------
  // CREATE OR TOGGLE REACTION
  // -------------------------------------------------
  async react(userId: string, dto: CreateReactionDto) {
    const { target, type, onModel } = dto;

    // Check if user already reacted on this target
    const existing = await this.reactionModel.findOne({
      user: userId,
      target,
      onModel,
    });

    // Case 1: No previous reaction → create new reaction
    if (!existing) {
      return this.reactionModel.create({
        user: new Types.ObjectId(userId),
        target,
        type,
        onModel,
      });
    }

    // Case 2: Same reaction exists → remove reaction (toggle off)
    if (existing.type === type) {
      await existing.deleteOne();
      return { removed: true };
    }

    // Case 3: User switches reaction (like -> dislike OR dislike -> like)
    existing.type = type;
    await existing.save();

    return existing;
  }

  // -------------------------------------------------
  // Get reactions for a target (post/comment/reply)
  // -------------------------------------------------
  async getReactions(targetId: string, onModel: string) {
    return this.reactionModel
      .find({ target: targetId, onModel })
      .populate('user', 'username name');
  }

  // -------------------------------------------------
  // Count reactions
  // -------------------------------------------------
  async count(targetId: string, onModel: string) {
    const likes = await this.reactionModel.countDocuments({
      target: targetId,
      onModel,
      type: 'like',
    });

    const dislikes = await this.reactionModel.countDocuments({
      target: targetId,
      onModel,
      type: 'dislike',
    });

    return { likes, dislikes };
  }
}
