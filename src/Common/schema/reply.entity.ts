import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
@Schema({ timestamps: true })
export class Reply {
  @Prop({ required: true })
  r_description!: string;

  @Prop({ required: true })
  commentId!: string;

  @Prop({ required: true })
  postId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reaction' }],
    default: [],
  })
  reaction!: Types.ObjectId[];
}
export const ReplySchema = SchemaFactory.createForClass(Reply);
