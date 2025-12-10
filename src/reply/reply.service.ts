import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReplyDto } from '../Common/dtos/createReplyDto';
import { Comment } from '../Common/schema/comment.entity';
import { Reply } from '../Common/schema/reply.entity';
import { User } from '../Common/schema/user.entity';

@Injectable()
export class ReplyService {
  constructor(
    @InjectModel(Reply.name) private replyModel: Model<Reply>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createReply(createReplyDto: CreateReplyDto, userId: string) {
    const { commentId, r_description } = createReplyDto;

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
      r_description,
      commentId,
      userId,
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

  async deleteReplyById(id: string): Promise<void> {
    const found = await this.replyModel.findById(id);
    if (!found) {
      throw new NotFoundException('Reply Not Found.');
    } else {
      await found.deleteOne();
      console.log('Reply Deleted.');
    }
  }
}
