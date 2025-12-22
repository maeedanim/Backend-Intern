import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_ACTION = 'rate_limit_action';

export const RateLimitAction = (action: 'post' | 'comment' | 'reply') =>
  SetMetadata(RATE_LIMIT_ACTION, action);
