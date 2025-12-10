import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateUserDto } from '../Common/dtos/createUserDto';
import { LoginUserDto } from '../Common/dtos/loginUserDto';
import { RefreshTokenDto } from '../Common/dtos/refreshTokenDto';
import { User } from '../Common/schema/user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from './auth.service';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Create a Developer' })
  @ApiCreatedResponse({
    description: 'Developer has been created Successfully',
  })
  @Post('signup')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.authService.createUser(createUserDto);
  }

  @ApiOperation({ summary: 'Login' })
  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.loginUser(loginUserDto);
  }

  @ApiOperation({ summary: 'Refresh Token using old refresh token' })
  @UseGuards(AuthGuard)
  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
}
