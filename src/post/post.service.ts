import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Cache } from 'cache-manager';
import { Model, Types } from 'mongoose';
import { User } from '../user/Schemas/user.entity';
import { CreatePostDto } from './Dtos/createPostDto';
import { UpdatePostDto } from './Dtos/updatePostDto';
import { Post } from './Schemas/post.entity';
import { AggregatedPost } from './post-aggregate.interface';

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

  async getRankedPosts(limit: number): Promise<AggregatedPost[]> {
    const cacheKey = `ranked_posts_${limit}`;

    const cached = await this.cacheManager.get<AggregatedPost[]>(cacheKey);
    if (cached) return cached;

    const posts = await this.postModel.aggregate<AggregatedPost>([
      // Post Reactions (UNCHANGED)
      {
        $lookup: {
          from: 'reactions',
          let: { postId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$target', '$$postId'] },
                    { $eq: ['$onModel', 'Post'] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
              },
            },
          ],
          as: 'postReactions',
        },
      },

      // total reactions
      {
        $addFields: {
          totalReactions: {
            $sum: '$postReactions.count',
          },
        },
      },

      // Comment Count
      {
        $lookup: {
          from: 'comments',
          let: { postId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$post', '$$postId'] },
              },
            },
            { $count: 'count' },
          ],
          as: 'commentCount',
        },
      },

      {
        $addFields: {
          totalComments: {
            $ifNull: [{ $arrayElemAt: ['$commentCount.count', 0] }, 0],
          },
        },
      },

      // Combined Ranking Score
      {
        $addFields: {
          rankingScore: {
            $add: ['$totalReactions', '$totalComments'],
          },
        },
      },

      // User
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },

      // Sort & Limit
      { $sort: { rankingScore: -1 } },
      { $limit: limit },

      // Cleanup
      {
        $project: {
          rankingScore: 0,
          postReactions: 0,
          commentCount: 0,
        },
      },
    ]);

    await this.cacheManager.set(cacheKey, posts, 30);
    return posts;
  }

  async getPostById(postId: string): Promise<AggregatedPost> {
    const postObjectId = new Types.ObjectId(postId);

    const result = await this.postModel.aggregate<AggregatedPost>([
      // Match the Post
      { $match: { _id: postObjectId } },

      // Populate Post Author
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

      // Populate Post Reactions
      {
        $lookup: {
          from: 'reactions',
          let: { postId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$target', '$$postId'] },
                    { $eq: ['$onModel', 'Post'] },
                  ],
                },
              },
            },
            { $group: { _id: '$type', count: { $sum: 1 } } },
          ],
          as: 'postReactions',
        },
      },
      // Map reactions to likes/dislikes
      {
        $addFields: {
          reactions: {
            $let: {
              vars: {
                mapped: {
                  $arrayToObject: {
                    $map: {
                      input: '$postReactions',
                      as: 'r',
                      in: { k: { $toLower: '$$r._id' }, v: '$$r.count' },
                    },
                  },
                },
              },
              in: {
                likes: { $ifNull: ['$$mapped.like', 0] },
                dislikes: { $ifNull: ['$$mapped.dislike', 0] },
              },
            },
          },
        },
      },

      // Populate Comments
      {
        $lookup: {
          from: 'comments',
          let: { postId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$post', '$$postId'] } } },

            // Comment Author
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

            // Comment Reactions
            {
              $lookup: {
                from: 'reactions',
                let: { commentId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$target', '$$commentId'] },
                          { $eq: ['$onModel', 'Comment'] },
                        ],
                      },
                    },
                  },
                  { $group: { _id: '$type', count: { $sum: 1 } } },
                ],
                as: 'commentReactions',
              },
            },
            {
              $addFields: {
                reactions: {
                  $let: {
                    vars: {
                      mapped: {
                        $arrayToObject: {
                          $map: {
                            input: '$commentReactions',
                            as: 'r',
                            in: { k: { $toLower: '$$r._id' }, v: '$$r.count' },
                          },
                        },
                      },
                    },
                    in: {
                      likes: { $ifNull: ['$$mapped.like', 0] },
                      dislikes: { $ifNull: ['$$mapped.dislike', 0] },
                    },
                  },
                },
              },
            },

            // Replies
            {
              $lookup: {
                from: 'replies',
                let: { commentId: '$_id' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$comment', '$$commentId'] } } },

                  // Reply Author
                  {
                    $lookup: {
                      from: 'users',
                      localField: 'user',
                      foreignField: '_id',
                      as: 'user',
                    },
                  },
                  {
                    $unwind: {
                      path: '$user',
                      preserveNullAndEmptyArrays: true,
                    },
                  },

                  // Reply Reactions
                  {
                    $lookup: {
                      from: 'reactions',
                      let: { replyId: '$_id' },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ['$target', '$$replyId'] },
                                { $eq: ['$onModel', 'Reply'] },
                              ],
                            },
                          },
                        },
                        { $group: { _id: '$type', count: { $sum: 1 } } },
                      ],
                      as: 'replyReactions',
                    },
                  },
                  {
                    $addFields: {
                      reactions: {
                        $let: {
                          vars: {
                            mapped: {
                              $arrayToObject: {
                                $map: {
                                  input: '$replyReactions',
                                  as: 'r',
                                  in: {
                                    k: { $toLower: '$$r._id' },
                                    v: '$$r.count',
                                  },
                                },
                              },
                            },
                          },
                          in: {
                            likes: { $ifNull: ['$$mapped.like', 0] },
                            dislikes: { $ifNull: ['$$mapped.dislike', 0] },
                          },
                        },
                      },
                    },
                  },
                ],
                as: 'replies',
              },
            },
          ],
          as: 'comments',
        },
      },

      // Cleanup intermediate arrays
      {
        $project: {
          postReactions: 0,
          'comments.commentReactions': 0,
          'comments.replies.replyReactions': 0,
        },
      },
    ]);

    if (!result.length) {
      throw new NotFoundException('Post not found');
    }

    return result[0];
  }

  async getAllPost() {
    const result = await this.postModel.aggregate<AggregatedPost>([
      // Post Author
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },

      // Post Reactions
      {
        $lookup: {
          from: 'reactions',
          let: { postId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$target', '$$postId'] },
                    { $eq: ['$onModel', 'Post'] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
              },
            },
          ],
          as: 'postReactions',
        },
      },
      {
        $addFields: {
          reactions: {
            likes: {
              $ifNull: [
                {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$postReactions',
                        as: 'r',
                        cond: { $eq: ['$$r._id', 'LIKE'] },
                      },
                    },
                    0,
                  ],
                },
                { count: 0 },
              ],
            },
            dislikes: {
              $ifNull: [
                {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$postReactions',
                        as: 'r',
                        cond: { $eq: ['$$r._id', 'DISLIKE'] },
                      },
                    },
                    0,
                  ],
                },
                { count: 0 },
              ],
            },
          },
        },
      },

      // Comments
      {
        $lookup: {
          from: 'comments',
          let: { postId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$post', '$$postId'] },
              },
            },

            // Comment Author
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },

            //Comment Reactions
            {
              $lookup: {
                from: 'reactions',
                let: { commentId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$target', '$$commentId'] },
                          { $eq: ['$onModel', 'Comment'] },
                        ],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: '$type',
                      count: { $sum: 1 },
                    },
                  },
                ],
                as: 'commentReactions',
              },
            },
            {
              $addFields: {
                reactions: {
                  likes: {
                    $size: {
                      $filter: {
                        input: '$commentReactions',
                        as: 'r',
                        cond: { $eq: ['$$r._id', 'LIKE'] },
                      },
                    },
                  },
                  dislikes: {
                    $size: {
                      $filter: {
                        input: '$commentReactions',
                        as: 'r',
                        cond: { $eq: ['$$r._id', 'DISLIKE'] },
                      },
                    },
                  },
                },
              },
            },

            // Replies
            {
              $lookup: {
                from: 'replies',
                let: { commentId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$comment', '$$commentId'] },
                    },
                  },

                  // Reply Author
                  {
                    $lookup: {
                      from: 'users',
                      localField: 'user',
                      foreignField: '_id',
                      as: 'user',
                    },
                  },
                  { $unwind: '$user' },

                  // Reply Reactions
                  {
                    $lookup: {
                      from: 'reactions',
                      let: { replyId: '$_id' },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ['$target', '$$replyId'] },
                                { $eq: ['$onModel', 'Reply'] },
                              ],
                            },
                          },
                        },
                        {
                          $group: {
                            _id: '$type',
                            count: { $sum: 1 },
                          },
                        },
                      ],
                      as: 'replyReactions',
                    },
                  },
                  {
                    $addFields: {
                      reactions: {
                        likes: {
                          $size: {
                            $filter: {
                              input: '$replyReactions',
                              as: 'r',
                              cond: { $eq: ['$$r._id', 'LIKE'] },
                            },
                          },
                        },
                        dislikes: {
                          $size: {
                            $filter: {
                              input: '$replyReactions',
                              as: 'r',
                              cond: { $eq: ['$$r._id', 'DISLIKE'] },
                            },
                          },
                        },
                      },
                    },
                  },
                ],
                as: 'replies',
              },
            },
          ],
          as: 'comments',
        },
      },

      // Cleanup
      {
        $project: {
          postReactions: 0,
          'comments.commentReactions': 0,
          'comments.replies.replyReactions': 0,
        },
      },
    ]);

    return result;
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

    await post.deleteOne();
    console.log('Post Deleted.');
  }
}
