import { Account, AccountType, Amount, Institution, SyncType, User } from "@/entities"
import { left, right } from "@/shared"
import { InvalidBalanceError, InvalidNameError } from "@/entities/errors"

export class BankAccount implements Account {
    public readonly name: string
    public readonly balance: Amount
    public readonly imageUrl?: string
    public readonly user: User
    public readonly type: AccountType = 'BANK'
    public readonly syncType: SyncType = 'MANUAL'
    public readonly institution: Institution

    
    private constructor(wallet: {name: string, balance: Amount, imageUrl?: string, user: User, institution?: Institution}) {
        this.name = wallet.name
        this.balance = wallet.balance
        this.imageUrl = wallet.imageUrl
        this.user = wallet.user
        this.institution = wallet.institution
    }

    public static create(wallet: { name: string, balance: number, imageUrl?: string, user: User, institution?: Institution}) {
        const { name, balance, imageUrl, user, institution } = wallet
        
        if(!name) {
            return left(new InvalidNameError())
        }

        const balanceOrError = Amount.create(balance) 
        if(balanceOrError.isLeft()) {
            return left(new InvalidBalanceError())
        }

        const amount = balanceOrError.value as Amount

        return right(new BankAccount({name, balance: amount, imageUrl, user, institution}))
    }
}