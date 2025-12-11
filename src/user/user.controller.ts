import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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
  async deleteUserById(@Param('id') id: string): Promise<object> {
    await this.userService.deleteUserById(id);
    return { message: `User Has Been Removed.` };
  }

  @ApiOperation({ summary: 'Update Skills and Experience' })
  @UseGuards(AuthGuard)
  @Patch('/:id')
  async updateUserById(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.updateUserSkillExperience(id, updateUserDto);
  }
}
