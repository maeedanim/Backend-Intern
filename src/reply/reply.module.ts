import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from '../comment/schema/comment.entity';
import { Post, PostSchema } from '../post/Schemas/post.entity';
import { User, UserSchema } from '../user/Schemas/user.entity';
import { ReplyController } from './reply.controller';
import { ReplyService } from './reply.service';
import { Reply, ReplySchema } from './Schemas/reply.entity';

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
