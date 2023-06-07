import { NodemailerService } from "@/external/mail"
import { MailService } from "@/usecases/ports"

export const makeMailService = (): MailService => {
    const smtpOptions = {
        service: process.env.SMTP_SERVICE,
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
    }
    return new NodemailerService(smtpOptions)
}