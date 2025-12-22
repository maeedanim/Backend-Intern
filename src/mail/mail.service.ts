import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('mail')
    private readonly mailQueue: Queue,
  ) {}

  async sendUserCreatedEmail(email: string, name: string): Promise<void> {
    await this.mailQueue.add(
      'user-created-email',
      { email, name },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
  }

  async sendCommentNotificationEmail(
    email: string,
    message: string,
  ): Promise<void> {
    await this.mailQueue.add(
      'comment-notification-email',
      { email, message },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
  }

  async sendTenDislikesEmail(email: string, type: string): Promise<void> {
    await this.mailQueue.add(
      'ten-dislikes-email',
      { email, type },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
  }
}
