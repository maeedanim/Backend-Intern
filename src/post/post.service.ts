import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostDto } from '../Common/dtos/createPostDto';
import { UpdatePostDto } from '../Common/dtos/updatePostDto';
import { Post } from '../Common/schema/post.entity';
import { User } from '../Common/schema/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createPost(CreatePostDto: CreatePostDto, userId: string) {
    const { p_title, p_description } = CreatePostDto;
    const findUser = await this.userModel.findById(userId);
    if (!findUser) {
      throw new NotFoundException('User Invalid');
    } else {
      const newpost = new this.postModel({
        user: findUser._id,
        p_title,
        p_description,
      });
      const savedpost = await newpost.save();
      return savedpost;
    }
  }

  async getPostById(id: string): Promise<Post> {
    const found = await this.postModel
      .findById(id)
      .populate('user')
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: [
          {
            path: 'replies',
            model: 'Reply',
            populate: [
              {
                path: 'reaction',
                model: 'Reaction',
              },
            ],
          },
        ],
      })
      .populate('reply')
      .populate('reaction');
    if (!found) {
      throw new NotFoundException('Post Is Invalid.');
    } else {
      return found;
    }
  }

  async getAllPost(): Promise<Post[]> {
    const found = await this.postModel
      .find()
      .populate('user')
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: [
          {
            path: 'replies',
            model: 'Reply',
            populate: [
              {
                path: 'reactions',
                model: 'Reaction',
              },
            ],
          },
        ],
      });
    if (!found) {
      throw new NotFoundException('Posts are not Created!');
    } else {
      return found;
    }
  }

  async updatePostTitleDescription(
    id: string,
    UpdatePostDto: UpdatePostDto,
  ): Promise<Post> {
    const change = await this.postModel.findByIdAndUpdate(
      id,
      {
        $set: UpdatePostDto,
      },
      { new: true, runValidators: true },
    );
    if (!change) {
      throw new NotFoundException('Post is Invalid!');
    } else {
      console.log('Post Updated.');
      return change;
    }
  }

  async deletePostById(id: string): Promise<void> {
    const found = await this.postModel.findById(id);
    if (!found) {
      throw new NotFoundException('Invalid Post.');
    } else {
      await this.userModel.updateOne(
        { _id: found.user },
        { $pull: { posts: found._id } },
      );
      await found.deleteOne();
      console.log('Post Deleted.');
    }
  }
}
