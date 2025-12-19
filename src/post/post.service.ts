import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { User } from '../user/Schemas/user.entity';
import { CreatePostDto } from './Dtos/createPostDto';
import { UpdatePostDto } from './Dtos/updatePostDto';
import { Post } from './Schemas/post.entity';

@Injectable()
export class PostService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createPost(CreatePostDto: CreatePostDto, userId: string) {
    const { postTitle, postDescription } = CreatePostDto;
    const findUser = await this.userModel.findById(userId);
    if (!findUser) {
      throw new NotFoundException('User Invalid');
    } else {
      const newpost = new this.postModel({
        user: findUser._id,
        postTitle,
        postDescription,
      });
      const savedpost = await newpost.save();
      return savedpost;
    }
  }

  async getRankedPosts(limit: number) {
    const cacheKey = `ranked_posts_${limit}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    const posts = await this.postModel
      .find()
      .sort({ 'reaction.count': -1 })
      .limit(limit)
      .lean();

    await this.cacheManager.set(cacheKey, posts, 30);

    return posts;
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
    userId: string,
  ): Promise<Post> {
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.user.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to modify this post');
    }
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

  async deletePostById(postid: string, userId: string): Promise<void> {
    const post = await this.postModel.findById(postid);

    if (!post) {
      throw new NotFoundException('Invalid Post.');
    }

    if (post.user.toString() !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete another user’s post.',
      );
    }
    // await this.userModel.updateOne(
    //   { _id: post.user },
    //   { $pull: { posts: post._id } },
    // );
    await post.deleteOne();
    console.log('Post Deleted.');
  }
}
