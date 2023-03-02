import { Account, AccountType, Amount, Institution, User } from "@/entities"
import { left, right } from "@/shared"
import { CreditCardInfoData, InvalidBalanceError, InvalidCreditCardError, InvalidNameError } from "@/entities/errors"




export interface CreditCardInfo {
    brand: string,
    creditLimit: Amount,
    availableCreditLimit: Amount,
    closeDay: number,
    dueDay: number,
}


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

        const creditCardInfoOrError = validateCreditCardInfo(creditCardInfo)
        if(creditCardInfoOrError.isLeft()) {
            return left(creditCardInfoOrError.value)
        }

        const creditCard = creditCardInfoOrError.value as CreditCardInfo

        return right(new CreditCardAccount({name, balance: amount, imageUrl, user, institution, creditCardInfo: creditCard}))
    }

}

function validateCreditCardInfo(creditCardInfoData: CreditCardInfoData) {

    const invalidParams = []
    if(!creditCardInfoData.brand) {
        invalidParams.push('brand')
    }

    if(creditCardInfoData.closeDay < 1 || creditCardInfoData.closeDay > 31) {
        invalidParams.push('closeDay')
    }

    if(creditCardInfoData.dueDay < 1 || creditCardInfoData.dueDay > 31) {
        invalidParams.push('dueDay')
    }

    const creditLimitOrError = Amount.create(creditCardInfoData.creditLimit)
    if(creditLimitOrError.isLeft()) {
        invalidParams.push('creditLimit')
    }

    const availableCreditLimitOrError = Amount.create(creditCardInfoData.availableCreditLimit)
    if(availableCreditLimitOrError.isLeft()) {
        invalidParams.push('availableCreditLimit')
    }

    if(invalidParams.length) {
        return left(new InvalidCreditCardError(`Invalid credit card params: ${invalidParams.join(', ')}`))
    }

    const creditCardInfo: CreditCardInfo = {
        brand: creditCardInfoData.brand,
        creditLimit: creditLimitOrError.value as Amount,
        availableCreditLimit: availableCreditLimitOrError.value as Amount,
        closeDay: creditCardInfoData.closeDay,
        dueDay: creditCardInfoData.dueDay,
    }

    return right(creditCardInfo)
}