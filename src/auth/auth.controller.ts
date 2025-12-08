import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../Common/dtos/createUserDto';
import { LoginUserDto } from '../Common/dtos/loginUserDto';
import { RefreshTokenDto } from '../Common/dtos/refreshTokenDto';
import { UpdateUserDto } from '../Common/dtos/updateUserDto';
import { User } from '../Common/schema/user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Get()
  getAllUser(): Promise<User[]> {
    return this.authService.getAllUser();
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  getTaskById(@Param('id') id: string) {
    return this.authService.getUserByID(id);
  }

  @Post('signup')
  async createUser(@Body() CreateUserDto: CreateUserDto): Promise<User> {
    return await this.authService.createUser(CreateUserDto);
  }

  @Post('login')
  async loginUser(@Body() LoginUserDto: LoginUserDto) {
    return await this.authService.loginUser(LoginUserDto);
  }

  @UseGuards(AuthGuard)
  @Post('refresh')
  async refreshTokens(@Body() RefreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(RefreshTokenDto.refreshToken);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deleteUserById(@Param('id') id: string): Promise<object> {
    await this.authService.deleteUserById(id);
    return { message: `User Has Been Removed.` };
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  async updateUserById(
    @Param('id') id: string,
    @Body() UpdateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.authService.updateUserSkillExperience(id, UpdateUserDto);
  }
}
