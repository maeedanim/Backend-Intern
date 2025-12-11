import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { error } from 'console';
import type { Request } from 'express';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateUserDto } from './Dtos/updateUserDto';
import { User } from './Schemas/user.entity';
import { UserService } from './user.service';

@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @ApiOperation({ summary: 'Search all developers' })
  @UseGuards(AuthGuard)
  @Get()
  getAllUser(): Promise<User[]> {
    return this.userService.getAllUser();
  }

  @ApiOperation({ summary: 'Search a specific developers by ID' })
  @UseGuards(AuthGuard)
  @Get('/:id')
  getUserById(@Param('id') id: string) {
    return this.userService.getUserByID(id);
  }

  @ApiOperation({ summary: 'Delete Account using ID' })
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deleteUserById(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<object> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new error('Invalid User');
    }

    if (userId !== id) {
      throw new ForbiddenException(
        'You are not allowed to delete another user',
      );
    }
    await this.userService.deleteUserById(id);
    return { message: `User Has Been Removed.` };
  }

  @ApiOperation({ summary: 'Update Skills and Experience' })
  @UseGuards(AuthGuard)
  @Patch('/:id')
  async updateUserById(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new error('Invalid User');
    }

    if (userId !== id) {
      throw new ForbiddenException(
        'You are not allowed to delete another user',
      );
    }
    return await this.userService.updateUserSkillExperience(id, updateUserDto);
  }
}
