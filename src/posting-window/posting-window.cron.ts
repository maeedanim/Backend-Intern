import { Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PostingWindowService } from './posting-window.service';

export class PostingWindowCron {
  private readonly logger = new Logger(PostingWindowCron.name);
  constructor(private readonly postingWindowService: PostingWindowService) {}
  @Cron('0 9 * * *')
  openPostingWindow() {
    this.postingWindowService.enable();
    this.logger.log('Posting window opened');
  }

  @Cron('0 10 * * *')
  closePostingWindow() {
    this.postingWindowService.disable();
    this.logger.log('Posting window closed');
  }
}
