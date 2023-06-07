import { NodemailerService }  from '@/external/mail';
import nodemailer from 'nodemailer';

jest.mock("nodemailer");
const mockedNodemailer = jest.mocked(nodemailer)
const sendMailMock = jest.fn().mockResolvedValue(10)

describe('Nodemailer Service', () => {
    let emailService: NodemailerService;

    beforeEach(() => {
            // @ts-ignore
            mockedNodemailer.createTransport.mockReturnValue({
                sendMail: sendMailMock
            })

    });


    it('should send an email successfully', async () => {
        sendMailMock.mockReturnValue(undefined)

        const smtpOptions = {
            service: process.env.SMTP_SERVICE,
            user: process.env.SMTP_USER,
            password: process.env.SMTP_PASSWORD,
        }
        emailService = new NodemailerService(smtpOptions)

        await emailService.send('message', '<p>message</p>', 'teste', 'gilmar-andrade@outlook.com')

        expect(sendMailMock).toBeCalledWith({
            from: "guiabolsoclone@gmail.com", 
            subject: "teste", 
            to: "gilmar-andrade@outlook.com",
            text: "message", 
            html: '<p>message</p>'
        })
    })

    it('should handle email sending error', async () => {
        sendMailMock.mockRejectedValue('error message')

        const smtpOptions = {
            service: process.env.SMTP_SERVICE,
            user: process.env.SMTP_USER,
            password: process.env.SMTP_PASSWORD,
        }
        emailService = new NodemailerService(smtpOptions)

        try {
            await emailService.send('message', '<p>message</p>', 'teste', 'gilmar-andrade@outlook.com')
          } catch (err) {
            expect(err).toEqual('error message');
        }

    })

});
