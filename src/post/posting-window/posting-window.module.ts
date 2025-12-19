import { Module } from '@nestjs/common';
import { PostingWindowGuard } from './guards/postingWindow.guard';
import { PostingWindowCron } from './posting-window.cron';
import { PostingWindowService } from './posting-window.service';

@Module({
  providers: [PostingWindowService, PostingWindowCron, PostingWindowGuard],
  exports: [PostingWindowService, PostingWindowGuard],
})
export class PostingWindowModule {}
