import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  c_title!: string;

  @Prop({ required: true })
  c_description!: string;

  @Prop({ required: true })
  postId!: string;

  @Prop({ required: true })
  userId!: string;

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
