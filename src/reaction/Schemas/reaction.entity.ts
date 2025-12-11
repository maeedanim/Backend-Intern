import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
@Schema({ timestamps: true })
export class Reaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId;

  @Prop({ required: true })
  type!: string; // 'like or Dislike'

  @Prop({ type: Types.ObjectId, required: true, refPath: 'onModel' })
  target!: Types.ObjectId; // can point to Post, Comment, or Reply

  @Prop({ required: true, enum: ['Post', 'Comment', 'Reply'] })
  onModel!: string;
}
export const ReactionSchema = SchemaFactory.createForClass(Reaction);
