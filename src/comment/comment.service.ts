import { InjectQueue } from '@nestjs/bullmq';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';

import { Post } from '../post/Schemas/post.entity';
import { User } from '../user/Schemas/user.entity';
import { CreateCommentDto } from './Dtos/createCommentDto';
import { UpdateCommentDto } from './Dtos/updateCommentDto';
import { Comment } from './schema/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<Comment>,

    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectQueue('mail')
    private readonly mailQueue: Queue,
  ) {}

  // CREATE COMMENT

  async createComment(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const { postId, commentTitle, commentDescription } = createCommentDto;

    const findUser = await this.userModel.findById(userId);
    const findPost = await this.postModel.findById(postId);

    if (!findUser && !findPost) {
      throw new NotFoundException('User and Post both are invalid');
    }
    if (!findUser) {
      throw new NotFoundException('User is invalid');
    }
    if (!findPost) {
      throw new NotFoundException('Post is invalid');
    }

    const savedComment = await this.commentModel.create({
      commentTitle,
      commentDescription,
      post: findPost._id,
      user: findUser._id,
    });

    const postOwnerId = findPost.user.toString();
    const commenterId = findUser._id.toString();
    const commentId = savedComment._id.toString();

    await this.mailQueue.add('comment-notification', {
      postOwnerId,
      commenterId,
      commentId,
    });

    return savedComment;
  }

  // GET ALL COMMENTS

  async getAllComment(): Promise<Comment[]> {
    const comments = await this.commentModel
      .find()
      .populate({
        path: 'reply',
        model: 'Reply',
        populate: {
          path: 'reaction',
          model: 'Reaction',
        },
      })
      .populate('user');

    if (!comments.length) {
      throw new NotFoundException('Comments are not created yet');
    }

    return comments;
  }

  // GET COMMENT BY ID

  async getCommentById(id: string): Promise<Comment> {
    const comment = await this.commentModel
      .findById(id)
      .populate({
        path: 'replies',
        model: 'Reply',
        populate: {
          path: 'reaction',
          model: 'Reaction',
        },
      })
      .populate('user');

    if (!comment) {
      throw new NotFoundException('Comment is invalid');
    }

    return comment;
  }

  // UPDATE COMMENT TITLE AND DESCRIPTION

  async updateCommentTitleDescription(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user.toString() !== userId) {
      throw new ForbiddenException(
        'You are not allowed to modify this comment',
      );
    }

    const updatedComment = await this.commentModel.findByIdAndUpdate(
      id,
      { $set: updateCommentDto },
      { new: true, runValidators: true },
    );

    return updatedComment!;
  }

  // DELETE COMMENT BY ID

  async deleteCommentById(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user.toString() !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete another user’s comment',
      );
    }

    await comment.deleteOne();
  }
}
