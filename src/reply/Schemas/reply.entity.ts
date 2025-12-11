import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
@Schema({ timestamps: true })
export class Reply {
  @Prop({ required: true })
  r_description!: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: true,
  })
  comment!: Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reaction' }],
    default: [],
  })
  reaction!: Types.ObjectId[];
}
export const ReplySchema = SchemaFactory.createForClass(Reply);
