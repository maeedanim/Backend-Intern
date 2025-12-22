import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailer: MailerService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'user-created-email':
        await this.handleUserCreated(
          job as Job<{ email: string; name: string }>,
        );
        break;

      case 'ten-dislikes-email':
        await this.handleTenDislikes(
          job as Job<{ email: string; type: string }>,
        );
        break;

      case 'comment-notification-email':
        await this.handleCommentNotification(
          job as Job<{ email: string; message: string }>,
        );
        break;

      default:
        throw new Error(`Unhandled job type: ${job.name}`);
    }
  }

  private async handleUserCreated(
    job: Job<{ email: string; name: string }>,
  ): Promise<void> {
    const { email, name } = job.data;

    await this.mailer.sendMail({
      to: email,
      subject: 'Welcome to Dev Community!',
      text: `Greetings ${name}! Welcome to Dev Community.`,
    });
  }

  private async handleTenDislikes(
    job: Job<{ email: string; type: string }>,
  ): Promise<void> {
    const { email, type } = job.data;

    await this.mailer.sendMail({
      to: email,
      subject: `Your ${type} received 10 dislikes`,
      text: `Your ${type} has reached 10 dislikes.`,
    });
  }

  private async handleCommentNotification(
    job: Job<{ email: string; message: string }>,
  ): Promise<void> {
    const { email, message } = job.data;

    await this.mailer.sendMail({
      to: email,
      subject: 'New comment notification',
      text: message,
    });
  }
}
