export interface MailService {
    send(textMessage: string, htmlMessage: string, subject: string, to: string): Promise<void>
}