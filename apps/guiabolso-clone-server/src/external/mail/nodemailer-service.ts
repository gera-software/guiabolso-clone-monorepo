import { MailService } from "@/usecases/ports";
import nodemailer from 'nodemailer'

export class NodemailerService implements MailService {
    public transporter: nodemailer.Transporter;

    // TODO constructor should receive env params 
    constructor() {
      this.transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
  
    public send(message: string, subject: string, to: string): Promise<void> {
      const mailOptions: nodemailer.SendMailOptions = {
        from: 'guiabolsoclone@gmail.com', // TODO hardcoded string
        to,
        subject,
        text: message,
      };
      console.log('[Nodemailer] send', mailOptions)

      return this.transporter.sendMail(mailOptions)
  
    }

}