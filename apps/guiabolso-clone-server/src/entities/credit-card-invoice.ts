import { left, right } from "@/shared";
import { Amount, CreditCardAccount } from "@/entities";
import { InvalidCreditCardInvoiceError } from "./errors";

export class CreditCardInvoice {
    public readonly closeDate: Date
    public readonly dueDate: Date
    public readonly amount: Amount
    public readonly account: CreditCardAccount

    private constructor(invoice: { closeDate: Date, dueDate: Date, amount: Amount, account: CreditCardAccount }) {
        this.closeDate = invoice.closeDate
        this.dueDate = invoice.dueDate
        this.amount = invoice.amount
        this.account = invoice.account
    }

    public static create(invoice: { closeDate: Date, dueDate: Date, amount: number, account: CreditCardAccount }) {
        if(invoice.dueDate <= invoice.closeDate) {
            return left(new InvalidCreditCardInvoiceError('Close date must be before due date'))
        }

        const diffInMs = invoice.dueDate.getTime() - invoice.closeDate.getTime()
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        if(diffInDays > 10) {
            return left(new InvalidCreditCardInvoiceError('The diference between dueDate and close date should be smaller than 10 days'))
        }
        
        const amount = Amount.create(invoice.amount).value as Amount

        return right(new CreditCardInvoice({
            closeDate: invoice.closeDate,
            dueDate: invoice.dueDate,
            amount,
            account: invoice.account,
        }))
    }
}