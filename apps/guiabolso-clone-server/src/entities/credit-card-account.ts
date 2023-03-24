import { Account, AccountType, Amount, CreditCardInfo, Institution, SyncType, User } from "@/entities"
import { Either, left, right } from "@/shared"
import { InvalidBalanceError, InvalidCreditCardError, InvalidNameError } from "@/entities/errors"
import { CreditCardInfoData } from "@/usecases/ports"

export class CreditCardAccount implements Account {
    public readonly name: string
    public readonly balance: Amount
    public readonly imageUrl?: string
    public readonly user: User
    public readonly type: AccountType = 'CREDIT_CARD'
    public readonly syncType: SyncType = 'MANUAL'
    public readonly institution: Institution
    public readonly creditCardInfo: CreditCardInfo

    
    private constructor(account: {name: string, balance: Amount, imageUrl?: string, user: User, institution?: Institution, creditCardInfo: CreditCardInfo }) {
        this.name = account.name
        this.balance = account.balance
        this.imageUrl = account.imageUrl
        this.user = account.user
        this.institution = account.institution
        this.creditCardInfo = account.creditCardInfo
    }

    public static create(account: { name: string, balance: number, imageUrl?: string, user: User, institution?: Institution, creditCardInfo: CreditCardInfoData}): Either<InvalidNameError | InvalidBalanceError | InvalidCreditCardError , CreditCardAccount> {
        const { name, balance, imageUrl, user, institution, creditCardInfo } = account
        
        if(!name) {
            return left(new InvalidNameError())
        }

        const balanceOrError = Amount.create(balance) 
        if(balanceOrError.isLeft()) {
            return left(new InvalidBalanceError())
        }

        const amount = balanceOrError.value as Amount

        const creditCardInfoOrError = CreditCardInfo.create(creditCardInfo)
        if(creditCardInfoOrError.isLeft()) {
            return left(creditCardInfoOrError.value)
        }

        const creditCard = creditCardInfoOrError.value as CreditCardInfo

        return right(new CreditCardAccount({name, balance: amount, imageUrl, user, institution, creditCardInfo: creditCard}))
    }

    /**
     * All transactions carried out from the invoice closing date onwards will belong to the next month's invoice.
     * All transactions made before the invoice closing date will belong to the current month's invoice.
     * 
     * Using Nubank rules as a reference. Other banks have different rules.
     * A fatura do cartão Nubank fecha 7 dias corridos antes do vencimento.
     * Todas as compras feitas a partir do dia de fechamento só entram na fatura seguinte.
     * Por isso, o melhor dia para compra é no dia do fechamento.
     * 
     * @param transactionDate 
     * @returns invoiceDates { invoiceClosingDate: Date, invoiceDueDate: Date } 
     */
    public calculateInvoiceDatesFromTransaction(transactionDate: Date) {
        let month = transactionDate.getUTCMonth() // between 0 and 11
        let year = transactionDate.getUTCFullYear()

        // current invoice
        const invoiceClosingDate = new Date(Date.UTC(year, month, this.creditCardInfo.closeDay, 0, 0, 0))
        const invoiceDueDate = new Date(Date.UTC(year, month, this.creditCardInfo.dueDay, 0, 0, 0))
        if(invoiceDueDate < invoiceClosingDate) { // ie. the diference between due date and closing date has to be 7 days
            invoiceDueDate.setUTCMonth(invoiceDueDate.getUTCMonth() + 1)
        }

        // next invoice
        if(transactionDate.getUTCDate() >= this.creditCardInfo.closeDay) {
            invoiceDueDate.setUTCMonth(invoiceDueDate.getUTCMonth() + 1)
            invoiceClosingDate.setUTCMonth(invoiceClosingDate.getUTCMonth() + 1)
        }

        return {
            invoiceClosingDate,
            invoiceDueDate,
        }
    }

}