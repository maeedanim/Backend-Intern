import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Reaction {
  @Prop({ required: true })
  replyId!: string;

  @Prop({ required: true })
  commentId!: string;

  @Prop({ required: true })
  postId!: string;

  @Prop({ required: true })
  userId!: string;
}
export const ReactionSchema = SchemaFactory.createForClass(Reaction);
