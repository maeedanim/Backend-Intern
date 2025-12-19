import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ReactionTarget, ReactionType } from '../reaction-type.enum';

@Schema({ timestamps: true })
export class Reaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: ReactionType,
  })
  type: ReactionType; // Like or Dislike

  @Prop({
    type: Types.ObjectId,
    required: true,
    refPath: 'onModel',
  })
  target: Types.ObjectId; // Reference to Post, Comment, or Reply

  @Prop({
    type: String,
    required: true,
    enum: ReactionTarget,
  })
  onModel: ReactionTarget; // 'Post', 'Comment', or 'Reply'
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);
