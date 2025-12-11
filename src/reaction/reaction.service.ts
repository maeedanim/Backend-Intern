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

  async react(userId: string, dto: CreateReactionDto) {
    const { target, type, onModel } = dto;

    // Checks if user already reacted on this target
    const existing = await this.reactionModel.findOne({
      user: userId,
      target,
      onModel,
    });

    // If no previous reaction then create new reaction
    if (!existing) {
      return this.reactionModel.create({
        user: new Types.ObjectId(userId),
        target,
        type,
        onModel,
      });
    }

    // Same reaction exists then remove reaction
    if (existing.type === type) {
      await existing.deleteOne();
      return { removed: true };
    }

    // User switches reaction (like to dislike OR dislike to like)
    existing.type = type;
    await existing.save();
    return existing;
  }

  async getReactions(targetId: string, onModel: string) {
    return this.reactionModel
      .find({ target: targetId, onModel })
      .populate('user', 'username name');
  }

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
