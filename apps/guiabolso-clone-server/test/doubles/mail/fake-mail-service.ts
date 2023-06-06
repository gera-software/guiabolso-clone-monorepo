import { MailService } from "@/usecases/ports";

export class FakeMailService implements MailService {
    public _sended: { message: string, subject: string, to: string }[]

    constructor() {
        this._sended = []
    }

    async send(message: string, subject: string, to: string): Promise<void> {
        this._sended.push({ message, subject, to })
        return
    }
    
}