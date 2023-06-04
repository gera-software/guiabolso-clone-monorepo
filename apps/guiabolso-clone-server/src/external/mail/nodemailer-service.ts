import { MailService } from "@/usecases/ports";
import nodemailer from 'nodemailer'

export class NodemailerService implements MailService{
    public transporter: nodemailer.Transporter;

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
        from: 'seu-email@gmail.com',
        to,
        subject,
        text: message,
      };

      return this.transporter.sendMail(mailOptions)
  
    }

}