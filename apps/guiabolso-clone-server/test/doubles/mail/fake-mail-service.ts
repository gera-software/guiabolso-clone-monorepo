import { MailService } from "@/usecases/ports";

export class FakeMailService implements MailService {
    public _sended: { textMessage: string, htmlMessage: string, subject: string, to: string }[]

    constructor() {
        this._sended = []
    }

    async send(textMessage: string, htmlMessage: string, subject: string, to: string): Promise<void> {
        this._sended.push({ textMessage, htmlMessage, subject, to })
        return
    }
    
}