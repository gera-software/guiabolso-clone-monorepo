import { Accountsynchronization, AccountType, Amount, AutomaticAccount, CreditCardInfo, CreditCardInvoiceStrategy, Institution, ProviderSyncStatus, SyncType, User } from "@/entities";
import { Either, left, right } from "@/shared";
import { CreditCardInfoData } from "@/usecases/ports";
import { InvalidNameError, InvalidBalanceError, InvalidCreditCardError, InvalidInstitutionError, InvalidAccountError } from "./errors";

export class AutomaticCreditCardAccount implements AutomaticAccount {
    public readonly name: string
    public readonly balance: Amount
    public readonly imageUrl?: string
    public readonly user: User
    public readonly type: AccountType = 'CREDIT_CARD'
    public readonly syncType: SyncType = 'AUTOMATIC'
    public readonly institution: Institution
    public readonly creditCardInfo: CreditCardInfo

    public readonly providerAccountId: string
    public readonly synchronization: Accountsynchronization

    private readonly creditCardInvoiceStrategy: CreditCardInvoiceStrategy

    private constructor(account: {name: string, balance: Amount, imageUrl?: string, user: User, institution?: Institution, creditCardInfo: CreditCardInfo, providerAccountId: string, providerItemId: string, createdAt: Date, syncStatus: string, lastSyncAt?: Date }, creditCardInvoiceStrategy: CreditCardInvoiceStrategy) {
        this.name = account.name
        this.balance = account.balance
        this.imageUrl = account.imageUrl
        this.user = account.user
        this.institution = account.institution
        this.creditCardInfo = account.creditCardInfo
        this.providerAccountId = account.providerAccountId
        this.synchronization = {
            providerItemId: account.providerItemId,
            createdAt: account.createdAt,
            syncStatus: account.syncStatus as ProviderSyncStatus,
            lastSyncAt: account.lastSyncAt,
        }

        this.creditCardInvoiceStrategy = creditCardInvoiceStrategy
    }

    public static create(account: { name: string, balance: number, imageUrl?: string, user: User, institution?: Institution, creditCardInfo: CreditCardInfoData, providerAccountId: string, providerItemId: string, createdAt: Date, syncStatus: string, lastSyncAt?: Date}, creditCardInvoiceStrategy: CreditCardInvoiceStrategy): Either<InvalidNameError | InvalidBalanceError | InvalidCreditCardError | InvalidInstitutionError | InvalidAccountError, AutomaticCreditCardAccount> {
        const { name, balance, imageUrl, user, institution, creditCardInfo, providerAccountId, providerItemId, createdAt, syncStatus, lastSyncAt} = account
        
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

        if(!institution) {
            return left(new InvalidInstitutionError())
        }

        if(!providerAccountId) {
            return left(new InvalidAccountError("providerAccountId is required"))
        }

        if(!providerItemId) {
            return left(new InvalidAccountError("providerItemId is required"))
        }

        if(!createdAt) {
            return left(new InvalidAccountError("createdAt is required"))
        }

        if(!syncStatus) {
            return left(new InvalidAccountError("syncStatus is required"))
        }

        return right(new AutomaticCreditCardAccount({name, balance: amount, imageUrl, user, institution, creditCardInfo: creditCard, providerAccountId, providerItemId, createdAt, syncStatus, lastSyncAt}, creditCardInvoiceStrategy))

    }

    public calculateInvoiceDatesFromTransaction(transactionDate: Date) {
        return this.creditCardInvoiceStrategy.calculateInvoiceDatesFromTransaction(transactionDate, this.creditCardInfo.closeDay, this.creditCardInfo.dueDay)
    }

}