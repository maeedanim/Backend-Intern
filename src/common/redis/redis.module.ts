import { RedisModule } from '@nestjs-modules/ioredis';
import { Global, Module } from '@nestjs/common';

@Global()
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
  exports: [RedisModule],
})
export class AppRedisModule {}
