import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { PostingWindowGuard } from './guards/postingWindow.guard';
import { PostingWindowCron } from './posting-window.cron';
import { PostingWindowService } from './posting-window.service';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      options: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
  ],
  providers: [PostingWindowService, PostingWindowCron, PostingWindowGuard],
  exports: [PostingWindowService, PostingWindowGuard],
})
export class PostingWindowModule {}
