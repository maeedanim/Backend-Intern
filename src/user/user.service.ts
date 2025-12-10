import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserDto } from '../Common/dtos/updateUserDto';
import { User } from '../Common/schema/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getAllUser(): Promise<User[]> {
    const found = await this.userModel
      .find()
      .select('-password')
      .populate({
        path: 'posts',
        populate: [
          {
            path: 'comments',
            model: 'Comment',
            populate: [
              {
                path: 'reply',
                model: 'Reply',
                populate: [
                  {
                    path: 'reaction',
                    model: 'Reaction',
                  },
                ],
              },
            ],
          },
        ],
      })
      .populate('comments')
      .populate('reply')
      .populate('reaction')
      .exec();

    if (!found) {
      throw new NotFoundException('Users are not Created!');
    }
    return found;
  }

  async getUserByID(id: string): Promise<User> {
    const found = await this.userModel
      .findById(id)
      .select('-password')
      .populate({
        path: 'posts',
        populate: [
          {
            path: 'comments',
            model: 'Comment',
            populate: [
              {
                path: 'reply',
                model: 'Reply',
                populate: [
                  {
                    path: 'reaction',
                    model: 'Reaction',
                  },
                ],
              },
            ],
          },
        ],
      })
      .populate('comments')
      .populate('reply')
      .populate('reaction')
      .exec();

    if (!found) {
      throw new NotFoundException('User Is Invalid.');
    } else {
      return found;
    }
  }

  async updateUserSkillExperience(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const change = await this.userModel.findByIdAndUpdate(
      id,
      {
        $set: updateUserDto,
      },
      { new: true, runValidators: true },
    );
    if (!change) {
      throw new NotFoundException('User is Invalid!');
    } else {
      console.log('User Updated.');
      return change;
    }
  }

  async deleteUserById(id: string): Promise<void> {
    const found = await this.userModel.findById(id);
    if (!found) {
      throw new NotFoundException('User Not Found.');
    } else {
      await found.deleteOne();
      console.log('User Deleted.');
    }
  }
}
