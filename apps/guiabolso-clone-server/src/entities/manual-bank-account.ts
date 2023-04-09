import { ManualAccount, AccountType, Amount, BankTransaction, Institution, SyncType, User } from "@/entities"
import { Either, left, right } from "@/shared"
import { InvalidBalanceError, InvalidNameError } from "@/entities/errors"

export class ManualBankAccount implements ManualAccount {
    public readonly name: string
    public readonly balance: Amount
    public readonly imageUrl?: string
    public readonly user: User
    public readonly type: AccountType = 'BANK'
    public readonly syncType: SyncType = 'MANUAL'
    public readonly institution: Institution

    
    private constructor(account: {name: string, balance: Amount, imageUrl?: string, user: User, institution?: Institution}) {
        this.name = account.name
        this.balance = account.balance
        this.imageUrl = account.imageUrl
        this.user = account.user
        this.institution = account.institution
    }

    public static create(account: { name: string, balance: number, imageUrl?: string, user: User, institution?: Institution}): Either<InvalidNameError | InvalidBalanceError, ManualBankAccount>  {
        const { name, balance, imageUrl, user, institution } = account
        
        if(!name) {
            return left(new InvalidNameError())
        }

        const balanceOrError = Amount.create(balance) 
        if(balanceOrError.isLeft()) {
            return left(new InvalidBalanceError())
        }

        const amount = balanceOrError.value as Amount

        return right(new ManualBankAccount({name, balance: amount, imageUrl, user, institution}))
    }

    public addTransaction(transaction: BankTransaction) {
        this.balance.add(transaction.amount.value)
    }

    public removeTransaction(transaction: BankTransaction) {
        this.balance.subtract(transaction.amount.value)
    }
}