import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  commentTitle!: string;

  @Prop({ required: true })
  commentDescription!: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true })
  post!: Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }],
    default: [],
  })
  reply!: Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reaction' }],
    default: [],
  })
  reaction!: Types.ObjectId[];
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
