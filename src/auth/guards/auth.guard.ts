import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../../interfaces/jwt-payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('Guard Activated.');

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    try {
      const payload: JwtPayload =
        await this.jwtService.verifyAsync<JwtPayload>(token);

      request['user'] = payload;
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token expired');
        }
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    return request.headers.authorization?.split(' ')[1];
  }
}
