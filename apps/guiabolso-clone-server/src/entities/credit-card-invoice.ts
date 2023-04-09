import { Either, left, right } from "@/shared"
import { Amount, ManualCreditCardAccount, CreditCardTransaction } from "@/entities"
import { InvalidCreditCardInvoiceError } from "@/entities/errors"

export class CreditCardInvoice {
    public readonly closeDate: Date
    public readonly dueDate: Date
    public readonly amount: Amount
    public readonly account: ManualCreditCardAccount

    private constructor(invoice: { closeDate: Date, dueDate: Date, amount: Amount, account: ManualCreditCardAccount }) {
        this.closeDate = invoice.closeDate
        this.dueDate = invoice.dueDate
        this.amount = invoice.amount
        this.account = invoice.account
    }

    public static create(invoice: { closeDate: Date, dueDate: Date, amount: number, account: ManualCreditCardAccount }): Either<InvalidCreditCardInvoiceError, CreditCardInvoice> {
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

    public addTransaction(transaction: CreditCardTransaction) {
        if(transaction.category?.name !== 'Pagamento de cartão') {
            this.amount.add(transaction.amount.value)
        }
    }

    public removeTransaction(transaction: CreditCardTransaction) {
        if(transaction.category?.name !== 'Pagamento de cartão') {
            this.amount.subtract(transaction.amount.value)
        }
    }
}