import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from '../Common/schema/comment.entity';
import { Post, PostSchema } from '../Common/schema/post.entity';
import { Reaction, ReactionSchema } from '../Common/schema/reaction.entity';
import { Reply, ReplySchema } from '../Common/schema/reply.entity';
import { User, UserSchema } from '../Common/schema/user.entity';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';

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
