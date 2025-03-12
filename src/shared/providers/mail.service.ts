// import { Injectable } from '@nestjs/common/decorators';
// import { createTransport } from 'nodemailer';
// import * as handlebars from 'handlebars';
// import * as fs from 'fs';
// import * as path from 'path';
// import { appEnv } from '../helpers/EnvHelper';

// @Injectable()
// export class MailService {
//   // smtp configuration for nodemailer
//   public transporter = createTransport({
//     host: "smtp-relay.brevo.com",
//     port: 587,
//     secure: false, //
//     auth: {
//       user: "naveedmoiz928@gmail.com", // Your Brevo email login
//       pass: "xsmtpsib-a038afd3ee78ebab370f6ea01797247f2a314119db637be42a936c8e9b386711-dYQSIz3WHftk8TNZ", // Your Brevo API key
//     },
//   });

//   // public transporter = createTransport({
//   //   host: appEnv('SMTP_SERVER', 'email-smtp.us-east-2.amazonaws.com'),
//   //   port: appEnv('SMTP_PORT', '465'),
//   //   secure: true,
//   //   auth: {
//   //     user: appEnv('SMTP_EMAIL_USER', 'AKIAXELN6JSHHQLPWNLE'),
//   //     pass: appEnv(
//   //       'SMPT_EMAIL_PASSWORD',
//   //       'BISXiW/ncuHxMdswfJNMFxU1v03ukxi25Fa/ZpGLKbA5',
//   //     ),
//   //   },
//   // });

//   private async readHTMLTemplate(templateName: string) {
//     const html = await this.readFile(
//       path.join(
//         __dirname,
//         '../../../',
//         'src',
//         'shared',
//         'email-templates',
//         templateName,
//       ),
//     );
//     return html;
//   }
//   private readFile(path) {
//     return new Promise((res, rej) => {
//       fs.readFile(path, 'utf8', (err, data) => {
//         if (err) rej(err);
//         else res(data);
//       });
//     });
//   }

//   public async SendMail(templateName, model, mailOptions): Promise<void> {
//     const html = await this.readHTMLTemplate(templateName);
//     const template = handlebars.compile(html);
//     const htmlToSend = template(model);

//     if (!mailOptions.to.length) {
//       return null;
//     }

//     mailOptions.from = mailOptions.from
//       ? mailOptions.from
//       // : appEnv('SMTP_EMAIL_FROM');
//       : 'naveedmoiz928@gmail.com';
//     mailOptions.html = htmlToSend;
//     try {
//       if (appEnv('SMTP_ENABLED')) {
//         const info = await this.transporter.sendMail(mailOptions);
//         console.log(info);
//       }
//     } catch (e) {
//       console.log(e.stack);
//       console.log(e.message);
//     }
//     return null;
//   }

//   public async SendEmailWithAttachment(templateName, model, mailOptions) {
//     const html = await this.readHTMLTemplate(templateName);
//     const template = handlebars.compile(html);
//     const htmlToSend = template(model);

//     mailOptions.from = mailOptions.from
//       ? mailOptions.from
//       : appEnv('SMTP_EMAIL_FROM');
//     mailOptions.html = htmlToSend;
//     try {
//       const { filename, content } = mailOptions;
//       const attachment = { filename, content };
//       mailOptions.attachments = attachment;
//       const info = await this.transporter.sendMail(mailOptions);
//       console.log(info);
//     } catch (e) {
//       console.log(e.stack);
//       console.log(e.message);
//     }
//     return null;
//   }
// }
