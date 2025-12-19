import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ReactionTarget, ReactionType } from '../reaction-type.enum';

@Schema({ timestamps: true })
export class Reaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({
    required: true,
    enum: ReactionType,
  })
  type: ReactionType;

  @Prop({
    type: Types.ObjectId,
    required: true,
    refPath: 'onModel',
  })
  target: Types.ObjectId;

  @Prop({
    required: true,
    enum: ReactionTarget,
  })
  onModel: ReactionTarget;
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);
