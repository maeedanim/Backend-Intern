import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from '../comment/schema/comment.entity';
import { Post, PostSchema } from '../post/Schemas/post.entity';
import { Reply, ReplySchema } from '../reply/Schemas/reply.entity';
import { User, UserSchema } from '../user/Schemas/user.entity';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';
import { Reaction, ReactionSchema } from './Schemas/reaction.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Reaction.name,
        schema: ReactionSchema,
      },
      {
        name: Reply.name,
        schema: ReplySchema,
      },
      {
        name: Comment.name,
        schema: CommentSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ReactionService],
  controllers: [ReactionController],
})
export class ReactionModule {}
