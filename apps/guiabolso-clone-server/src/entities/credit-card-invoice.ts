import { right } from "@/shared";
import { Amount, CreditCardAccount } from "@/entities";

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
        const amount = Amount.create(invoice.amount).value as Amount

        return right(new CreditCardInvoice({
            closeDate: invoice.closeDate,
            dueDate: invoice.dueDate,
            amount,
            account: invoice.account,
        }))
    }
}