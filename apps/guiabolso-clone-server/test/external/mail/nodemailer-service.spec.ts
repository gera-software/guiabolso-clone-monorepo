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

        emailService = new NodemailerService()

        await emailService.send('message', 'teste', 'gilmar-andrade@outlook.com')

        expect(sendMailMock).toBeCalledWith({
            "from": "guiabolsoclone@gmail.com", "subject": "teste", "text": "message", "to": "gilmar-andrade@outlook.com"
        })
    })

    it('should handle email sending error', async () => {
        sendMailMock.mockRejectedValue('error message')

        emailService = new NodemailerService()

        try {
            await emailService.send('message', 'teste', 'gilmar-andrade@outlook.com')
          } catch (err) {
            expect(err).toEqual('error message');
        }

    })

});
