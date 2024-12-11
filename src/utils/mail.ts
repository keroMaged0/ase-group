import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { logger } from '../config/winston';

export interface Imail {
  from: string;
  to: string;
  subject: string;
  html: string;
}
class MailTransporter {
  transporter: Transporter<SMTPTransport.SentMessageInfo>;
  constructor() {
    this.transporter = createTransport({
      service: process.env.MAIL_SERVICE,
      host: process.env.MAIL_HOST,
      port: +process.env.MAIL_PORT!,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
      secure: process.env.NODE_ENV === 'production',
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  verifyTransporter() {
    this.transporter.verify(function (error, success) {
      if (error) {
        logger.error(error);
      } else {
        logger.info('email transporter verified', success);
      }
    });
  }

  async sendMail(options: Imail) {
    await this.transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}

export const mailTransporter = new MailTransporter();
