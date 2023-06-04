export interface MailService {
    send(message: string, subject: string, to: string): Promise<void>
}