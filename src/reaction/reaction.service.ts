import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateReactionDto } from './Dtos/createReactionDto';
import { Reaction } from './Schemas/reaction.entity';
import { ReactionTarget, ReactionType } from './reaction-type.enum';

interface ReactionCountResult {
  _id: ReactionType;
  count: number;
}

@Injectable()
export class ReactionService {
  constructor(
    @InjectModel(Reaction.name)
    private readonly reactionModel: Model<Reaction>,
  ) {}

  async react(userId: string, dto: CreateReactionDto) {
    const userObjectId = new Types.ObjectId(userId);
    const targetObjectId = new Types.ObjectId(dto.target);
    const reactionType = dto.type as ReactionType;
    const reactionTarget = dto.onModel as ReactionTarget;

    const existingReaction = await this.reactionModel.findOne({
      user: userObjectId,
      target: targetObjectId,
      onModel: reactionTarget,
    });

    if (!existingReaction) {
      await this.reactionModel.create({
        user: userObjectId,
        target: targetObjectId,
        type: reactionType,
        onModel: reactionTarget,
      });

      return { message: 'Reaction added', action: 'added' };
    }

    if (existingReaction.type === reactionType) {
      await existingReaction.deleteOne();

      return { message: 'Reaction removed', action: 'removed' };
    }

    existingReaction.type = reactionType;
    await existingReaction.save();

    return { message: 'Reaction updated', action: 'updated' };
  }

  async getReactions(targetId: string, onModel: ReactionTarget) {
    return this.reactionModel
      .find({
        target: new Types.ObjectId(targetId),
        onModel,
      })
      .populate('user', 'username name');
  }

  async countReactions(targetId: string, onModel: ReactionTarget) {
    const result = await this.reactionModel.aggregate<ReactionCountResult>([
      {
        $match: {
          target: new Types.ObjectId(targetId),
          onModel,
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    let likes = 0;
    let dislikes = 0;

    for (const r of result) {
      if (r._id === ReactionType.LIKE) likes = r.count;
      if (r._id === ReactionType.DISLIKE) dislikes = r.count;
    }

    return { likes, dislikes };
  }
}
