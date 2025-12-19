import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PostingWindowService } from './posting-window.service';

@Injectable()
export class PostingWindowCron {
  private readonly logger = new Logger(PostingWindowCron.name);
  constructor(private readonly postingWindowService: PostingWindowService) {}
  @Cron('0 11 * * *', {
    timeZone: 'Asia/Dhaka',
  })
  openPostingWindow() {
    this.postingWindowService.enable();
    this.logger.log('Posting window opened');
  }

  @Cron('0 12 * * *', {
    timeZone: 'Asia/Dhaka',
  })
  closePostingWindow() {
    this.postingWindowService.disable();
    this.logger.log('Posting window closed');
  }
}
