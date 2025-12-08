import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from '../Common/dtos/createUserDto';
import { LoginUserDto } from '../Common/dtos/loginUserDto';
import { UpdateUserDto } from '../Common/dtos/updateUserDto';
import { RefreshToken } from '../Common/schema/refreshToken.entity';
import { User } from '../Common/schema/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private refresfTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async createUser(CreateUserDto: CreateUserDto) {
    const { name, username, email, password, skill, experience } =
      CreateUserDto;
    const emailInUser = await this.userModel.findOne({ email });
    if (emailInUser) {
      throw new BadRequestException('This Email Has Already Been Used.');
    }

    const hashpass = await bcrypt.hash(password, 10);

    const newUser = await this.userModel.create({
      name,
      username,
      email,
      password: hashpass,
      skill,
      experience,
    });
    return newUser;
  }

  // login - token generated
  async loginUser(LoginUserDto: LoginUserDto) {
    const { email, password } = LoginUserDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid User.');
    }

    const passMatch = await bcrypt.compare(password, user.password);

    if (!passMatch) {
      throw new UnauthorizedException('Invalid password.');
    }

    return this.generateUserTokens(user._id.toString());
  }

  // Generating Tokens
  async generateUserTokens(userId: string): Promise<object> {
    const accessToken = await this.jwtService.signAsync(
      { userId },
      { expiresIn: '1h' },
    );
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);
    return { accessToken, refreshToken };
  }

  //Storing Refresh tokens to refresh previous Access tokens

  async storeRefreshToken(token: string, userId: string) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.refresfTokenModel.create({ token, userId, expiryDate });
  }

  async refreshToken(refreshToken: string) {
    const token = await this.refresfTokenModel.findOneAndDelete({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });
    if (!token) {
      throw new UnauthorizedException('Refresh Token is invalid.');
    }
    return this.generateUserTokens(token.userId.toString());
  }

  async getAllUser(): Promise<User[]> {
    const found = await this.userModel
      .find()
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
      .populate('reaction');

    if (!found) {
      throw new NotFoundException('Users are not Created!');
    }
    return found;
  }

  async getUserByID(id: string): Promise<User> {
    const found = await this.userModel
      .findById(id)
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
      .populate('reaction');

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
