import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from '../comment/schema/comment.entity';
import { User } from '../user/Schemas/user.entity';
import { CreateReplyDto } from './Dtos/createReplyDto';
import { Reply } from './Schemas/reply.entity';

@Injectable()
export class ReplyService {
  constructor(
    @InjectModel(Reply.name) private replyModel: Model<Reply>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createReply(createReplyDto: CreateReplyDto, userId: string) {
    const { commentId, replyDescription } = createReplyDto;

    const findUser = await this.userModel.findById(userId);

    const findComment = await this.commentModel.findById(commentId);

    if (!findUser || !findComment) {
      if (!findUser && !findComment) {
        throw new NotFoundException('User and Comments are Invalid');
      }
      if (!findUser) {
        throw new NotFoundException('User not found');
      }
      throw new NotFoundException('Comment not found');
    }

    const newReply = new this.replyModel({
      replyDescription,
      comment: commentId,
      user: userId,
    });
    const savedReply = await newReply.save();

    return savedReply;
  }

  async getAllReply(): Promise<Reply[]> {
    const found = await this.replyModel.find().populate('reaction');
    if (!found) {
      throw new NotFoundException('Reply has not been created yet');
    } else {
      return found;
    }
  }
  async getReplyById(id: string): Promise<Reply> {
    const found = await this.replyModel.findById(id).populate('reaction');
    if (!found) {
      throw new NotFoundException('Reply Is Invalid.');
    } else {
      return found;
    }
  }

  async deleteReplyById(replyId: string, userId: string): Promise<void> {
    const found = await this.replyModel.findById(replyId);
    if (!found) {
      throw new NotFoundException('Reply Not Found.');
    }
    if (found.user.toString() !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete another user’s post.',
      );
    }
    // await this.userModel.updateOne(
    //   { _id: found.user },
    //   { $pull: { posts: found._id } },
    // );
    await found.deleteOne();
    console.log('Reply Deleted.');
  }
}
