import { MailService } from "@/usecases/ports";
import nodemailer from 'nodemailer'

type SmtpOptions = {
  service: string,
  user: string,
  password: string,
}

export class NodemailerService implements MailService {
    public transporter: nodemailer.Transporter;

    constructor(smtpOptions: SmtpOptions) {
      this.transporter = nodemailer.createTransport({
        service: smtpOptions.service,
        auth: {
          user: smtpOptions.user,
          pass: smtpOptions.password,
        },
        tls: {rejectUnauthorized: false},
      });
    }
  
    public send(textMessage: string, htmlMessage: string, subject: string, to: string): Promise<void> {
      const mailOptions: nodemailer.SendMailOptions = {
        from: 'guiabolsoclone@gmail.com', // TODO hardcoded string
        to,
        subject,
        text: textMessage,
        html: htmlMessage,
      };
      console.log('[Nodemailer] send', mailOptions)

      return this.transporter.sendMail(mailOptions)
  
    }

}