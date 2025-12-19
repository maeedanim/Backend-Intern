import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PostingWindowService } from '../posting-window.service';

@Injectable()
export class PostingWindowGuard implements CanActivate {
  constructor(private readonly postingWindowService: PostingWindowService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(context: ExecutionContext): boolean {
    console.log('Posting-Window Guard Activated.');
    if (!this.postingWindowService.isEnabled()) {
      throw new ForbiddenException(
        'Posting is allowed only between 9:00 AM and 10:00 PM',
      );
    }
    return true;
  }
}
