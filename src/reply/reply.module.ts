import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from '../Common/schema/comment.entity';
import { Post, PostSchema } from '../Common/schema/post.entity';
import { Reply, ReplySchema } from '../Common/schema/reply.entity';
import { User, UserSchema } from '../Common/schema/user.entity';
import { ReplyController } from './reply.controller';
import { ReplyService } from './reply.service';

@Module({
  imports: [
    MongooseModule.forFeature([
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
  providers: [ReplyService],
  controllers: [ReplyController],
})
export class ReplyModule {}
