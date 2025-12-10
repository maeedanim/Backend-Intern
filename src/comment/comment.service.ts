import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from '../Common/dtos/createCommentDto';
import { UpdateCommentDto } from '../Common/dtos/updateCommentDto';
import { Comment } from '../Common/schema/comment.entity';
import { Post } from '../Common/schema/post.entity';
import { User } from '../Common/schema/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createComment(CreateCommentDto: CreateCommentDto, userId: string) {
    const { postId, c_title, c_description } = CreateCommentDto;

    const findUser = await this.userModel.findById(userId);

    const findPost = await this.postModel.findById(postId);

    if (!findUser || !findPost) {
      if (!findUser && !findPost) {
        throw new NotFoundException('User and Post both are invalid');
      }
      if (!findUser) {
        throw new NotFoundException('User is invalid');
      }
      throw new NotFoundException('Post is invalid');
    } else {
      const newComment = new this.commentModel({
        c_title,
        c_description,
        post: findPost._id,
        user: findUser._id,
      });
      const savedComment = await newComment.save();

      return savedComment;
    }
  }

  async getAllComment(): Promise<Comment[]> {
    const found = await this.commentModel
      .find()
      .populate({
        path: 'reply',
        model: 'Reply',
        populate: [
          {
            path: 'reaction',
            model: 'Reaction',
          },
        ],
      })
      .populate('user');
    if (!found) {
      throw new NotFoundException('Comments are not Created!');
    } else {
      return found;
    }
  }

  async getCommentById(id: string): Promise<Comment> {
    const found = await this.commentModel
      .findById(id)
      .populate({
        path: 'replies',
        model: 'Reply',
        populate: [
          {
            path: 'reaction',
            model: 'Reaction',
          },
        ],
      })
      .populate('user');
    if (!found) {
      throw new NotFoundException('Comment Is Invalid.');
    } else {
      return found;
    }
  }

  async updateCommentTitleDescription(
    id: string,
    UpdateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const change = await this.commentModel.findByIdAndUpdate(
      id,
      { $set: UpdateCommentDto },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!change) {
      throw new NotFoundException('Comment is Invalid!');
    } else {
      console.log('Commment Updated.');
      return change;
    }
  }

  async deleteCommentById(id: string): Promise<void> {
    const found = await this.commentModel.findById(id);
    if (!found) {
      throw new NotFoundException('Comment Not Found.');
    } else {
      await found.deleteOne();
      console.log('Comment Deleted.');
    }
  }
}
