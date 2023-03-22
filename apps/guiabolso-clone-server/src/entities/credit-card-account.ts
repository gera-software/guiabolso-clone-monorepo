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

    public calculateInvoiceDueDateFromTransaction(transactionDate: Date) {
        //suposed invoiceDate
        const creditCardDate = new Date(transactionDate)
        let invoiceMonth = creditCardDate.getUTCMonth() // between 0 and 11
        let invoiceYear = creditCardDate.getUTCFullYear()

        //account info
        const closeDay = this.creditCardInfo.closeDay
        const dueDay = this.creditCardInfo.dueDay

        const closingDate = new Date(Date.UTC(invoiceYear, invoiceMonth, closeDay, 0, 0, 0))

        const dueDate = new Date(Date.UTC(invoiceYear, invoiceMonth, dueDay, 0, 0, 0))

        // move a transação para a data de vencimento da fatura correspondente
        if(creditCardDate >= closingDate) {
            dueDate.setUTCMonth(dueDate.getUTCMonth() + 1)
            closingDate.setUTCMonth(closingDate.getUTCMonth() + 1)
            // console.log('dentro da fatura do mes que vem', dueDate.toISOString())
        } else {
            // console.log('dentro da fatura do mes atual', dueDate.toISOString())
        }

        return dueDate
        // return {
        //     dueDate,
        //     closingDate,
        // }
    }

}