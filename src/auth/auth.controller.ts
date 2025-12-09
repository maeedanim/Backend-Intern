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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from '../Common/dtos/createUserDto';
import { LoginUserDto } from '../Common/dtos/loginUserDto';
import { RefreshTokenDto } from '../Common/dtos/refreshTokenDto';
import { UpdateUserDto } from '../Common/dtos/updateUserDto';
import { User } from '../Common/schema/user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from './auth.service';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Search all developers' })
  @UseGuards(AuthGuard)
  @Get()
  getAllUser(): Promise<User[]> {
    return this.authService.getAllUser();
  }

  @ApiOperation({ summary: 'Search a specific developers by ID' })
  @UseGuards(AuthGuard)
  @Get('/:id')
  getUserById(@Param('id') id: string) {
    return this.authService.getUserByID(id);
  }

  @ApiOperation({ summary: 'Create a Developer' })
  @ApiCreatedResponse({
    description: 'Developer has been created Successfully',
  })
  @Post('signup')
  async createUser(@Body() CreateUserDto: CreateUserDto): Promise<User> {
    return await this.authService.createUser(CreateUserDto);
  }

  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    status: 201,
    description: 'Login Successful',
  })
  @Post('login')
  async loginUser(@Body() LoginUserDto: LoginUserDto) {
    return await this.authService.loginUser(LoginUserDto);
  }

  @ApiOperation({ summary: 'Refresh Token using old refresh token' })
  @UseGuards(AuthGuard)
  @Post('refresh')
  async refreshTokens(@Body() RefreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(RefreshTokenDto.refreshToken);
  }

  @ApiOperation({ summary: 'Delete Account using ID' })
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deleteUserById(@Param('id') id: string): Promise<object> {
    await this.authService.deleteUserById(id);
    return { message: `User Has Been Removed.` };
  }

  @ApiOperation({ summary: 'Update Skills and Experience' })
  @UseGuards(AuthGuard)
  @Patch('/:id')
  async updateUserById(
    @Param('id') id: string,
    @Body() UpdateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.authService.updateUserSkillExperience(id, UpdateUserDto);
  }
}
