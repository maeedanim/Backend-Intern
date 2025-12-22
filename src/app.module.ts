import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { AppRedisModule } from './common/redis/redis.module';
import config from './config/config';
import { PostModule } from './post/post.module';
import { PostingWindowModule } from './post/posting-window/posting-window.module';
import { ReactionModule } from './reaction/reaction.module';
import { ReplyModule } from './reply/reply.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AppRedisModule,
    // Bull Module for Redis Queues
    BullModule.forRoot({
      connection: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
    // Redis Cache Module
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        app: configService.get<string>('app'),
        ttl: 0,
      }),
      isGlobal: true,
      inject: [ConfigService],
    }),

    // Schedule Module for CRON Jobs
    ScheduleModule.forRoot(),
    PostingWindowModule,

    // Configuration Module for Environment Variables
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),

    // JWT Module for Authentication
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),

    // Mongoose Module for MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    PostModule,
    CommentModule,
    AuthModule,
    ReplyModule,
    ReactionModule,
    UserModule,
    PostingWindowModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
