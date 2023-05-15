import { ManualAccount, AccountType, Amount, CreditCardInfo, CreditCardTransaction, Institution, SyncType, User, CreditCardInvoiceStrategy } from "@/entities"
import { Either, left, right } from "@/shared"
import { InvalidBalanceError, InvalidCreditCardError, InvalidNameError } from "@/entities/errors"
import { CreditCardInfoData } from "@/usecases/ports"

export class ManualCreditCardAccount implements ManualAccount {
    public readonly name: string
    public readonly balance: Amount
    public readonly imageUrl?: string
    public readonly user: User
    public readonly type: AccountType = 'CREDIT_CARD'
    public readonly syncType: SyncType = 'MANUAL'
    public readonly institution: Institution
    public readonly creditCardInfo: CreditCardInfo

    private readonly creditCardInvoiceStrategy: CreditCardInvoiceStrategy

    
    private constructor(account: {name: string, balance: Amount, imageUrl?: string, user: User, institution?: Institution, creditCardInfo: CreditCardInfo }, creditCardInvoiceStrategy: CreditCardInvoiceStrategy) {
        this.name = account.name
        this.balance = account.balance
        this.imageUrl = account.imageUrl
        this.user = account.user
        this.institution = account.institution
        this.creditCardInfo = account.creditCardInfo

        this.creditCardInvoiceStrategy = creditCardInvoiceStrategy
    }

    public static create(account: { name: string, balance: number, imageUrl?: string, user: User, institution?: Institution, creditCardInfo: CreditCardInfoData}, creditCardInvoiceStrategy: CreditCardInvoiceStrategy): Either<InvalidNameError | InvalidBalanceError | InvalidCreditCardError , ManualCreditCardAccount> {
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

        return right(new ManualCreditCardAccount({name, balance: amount, imageUrl, user, institution, creditCardInfo: creditCard}, creditCardInvoiceStrategy))
    }

    public calculateInvoiceDatesFromTransaction(transactionDate: Date) {
        return this.creditCardInvoiceStrategy.calculateInvoiceDatesFromTransaction(transactionDate, this.creditCardInfo.closeDay, this.creditCardInfo.dueDay)
    }

    public addTransaction(transaction: CreditCardTransaction) {
        this.creditCardInfo.addToAvailableCreditLimit(transaction.amount.value)
    }

    public removeTransaction(transaction: CreditCardTransaction) {
        this.creditCardInfo.subtractFromAvailableCreditLimit(transaction.amount.value)
    }

}