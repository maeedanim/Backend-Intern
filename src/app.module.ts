import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import config from './config/config';
import { PostModule } from './post/post.module';
import { ReactionModule } from './reaction/reaction.module';
import { ReplyModule } from './reply/reply.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),

    MongooseModule.forRoot('mongodb://localhost/dev_comm'),
    PostModule,
    CommentModule,
    AuthModule,
    ReplyModule,
    ReactionModule,
    UserModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
