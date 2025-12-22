import { InjectRedis } from '@nestjs-modules/ioredis';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
import { RATE_LIMIT_ACTION } from '../../../common/decorators/rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { id: string };
    }>();

    if (!request.user?.id) {
      throw new UnauthorizedException();
    }

    const action = this.reflector.get<string>(
      RATE_LIMIT_ACTION,
      context.getHandler(),
    );

    if (!action) return true;

    const key = `rate:${action}:${request.user.id}`;

    const count = await this.redis.incr(key);

    if (count === 1) {
      await this.redis.expire(key, 3600);
    }

    if (count > 5) {
      throw new HttpException(
        'You have exceeded the hourly limit',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
