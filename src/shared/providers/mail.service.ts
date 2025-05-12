import { Injectable } from '@nestjs/common/decorators';
import { createTransport } from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { appEnv } from '../helpers/EnvHelper';

@Injectable()
export class MailService {
  public transporter = createTransport({
    host: appEnv('SMTP_HOST', 'smtp-relay.brevo.com'),
    port: +appEnv('SMTP_PORT', '587'),
    secure: appEnv('SMTP_SECURE', 'false'),
    auth: {
      user: appEnv('SMTP_USER'),
      pass: appEnv('SMTP_PASS'),
    }
  });



  private async readHTMLTemplate(templateName: string) {
    const html = await this.readFile(
      path.join(
        __dirname,
        '../../../',
        'src',
        'shared',
        'email-templates',
        templateName,
      ),
    );
    return html;
  }
  private readFile(path) {
    return new Promise((res, rej) => {
      fs.readFile(path, 'utf8', (err, data) => {
        if (err) rej(err);
        else res(data);
      });
    });
  }

  public async SendMail(templateName, model, mailOptions): Promise<void> {
    const html = await this.readHTMLTemplate(templateName);
    const template = handlebars.compile(html);
    const htmlToSend = template(model);

    if (!mailOptions.to.length) {
      return null;
    }

    mailOptions.from = mailOptions.from
      ? mailOptions.from
      : appEnv('SMTP_EMAIL_FROM');

      mailOptions.html = htmlToSend;
    try {
      if (appEnv('SMTP_ENABLED')) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log(info);
      }
    } catch (e) {
      console.log(e.stack);
      console.log(e.message);
    }
    return null;
  }

  public async SendEmailWithAttachment(templateName, model, mailOptions) {
    const html = await this.readHTMLTemplate(templateName);
    const template = handlebars.compile(html);
    const htmlToSend = template(model);

    mailOptions.from = mailOptions.from
      ? mailOptions.from
      : appEnv('SMTP_EMAIL_FROM');
    mailOptions.html = htmlToSend;
    try {
      const { filename, content } = mailOptions;
      const attachment = { filename, content };
      mailOptions.attachments = attachment;
      const info = await this.transporter.sendMail(mailOptions);
      console.log(info);
    } catch (e) {
      console.log(e.stack);
      console.log(e.message);
    }
    return null;
  }
}
