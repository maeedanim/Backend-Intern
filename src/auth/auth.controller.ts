import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { User } from '../user/Schemas/user.entity';
import { AuthService } from './auth.service';
import { CreateUserDto } from './Dtos/createUserDto';
import { LoginUserDto } from './Dtos/loginUserDto';
import { RefreshTokenDto } from './Dtos/refreshTokenDto';
import { AuthGuard } from './guards/auth.guard';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Create a Developer' })
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
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
}
