import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailer: MailerService) {}

  async sendUserCreatedEmail(email: string, name: string) {
    await this.mailer.sendMail({
      to: email,
      subject: 'Welcome to Dev Community..!',
      text: `Greetings ${name} !, Welcome to Dev Community, Your account has been created successfully.`,
    });
  }

  async sendTenDislikesEmail(email: string, type: string) {
    await this.mailer.sendMail({
      to: email,
      subject: `Your ${type} received 10 dislikes`,
      text: `Your ${type} has reached 10 dislikes. Please check your content.`,
    });
  }
}
