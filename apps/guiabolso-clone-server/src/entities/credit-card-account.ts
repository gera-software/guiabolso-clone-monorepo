import { Account, AccountType, Amount, CreditCardInfo, Institution, User } from "@/entities"
import { left, right } from "@/shared"
import { InvalidBalanceError, InvalidNameError } from "@/entities/errors"
import { CreditCardInfoData } from "@/usecases/ports"

export class CreditCardAccount implements Account {
    public readonly name: string
    public readonly balance: Amount
    public readonly imageUrl?: string
    public readonly user: User
    public readonly type: AccountType = 'CREDIT_CARD'
    public readonly institution: Institution
    public readonly creditCardInfo: CreditCardInfo

    
    private constructor(wallet: {name: string, balance: Amount, imageUrl?: string, user: User, institution?: Institution, creditCardInfo: CreditCardInfo }) {
        this.name = wallet.name
        this.balance = wallet.balance
        this.imageUrl = wallet.imageUrl
        this.user = wallet.user
        this.institution = wallet.institution
        this.creditCardInfo = wallet.creditCardInfo
    }

    public static create(wallet: { name: string, balance: number, imageUrl?: string, user: User, institution?: Institution, creditCardInfo: CreditCardInfoData}) {
        const { name, balance, imageUrl, user, institution, creditCardInfo } = wallet
        
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

}