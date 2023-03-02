import { left, right } from "@/shared"
import { Amount } from "./amount"
import { InvalidCreditCardError } from "@/entities/errors"
import { CreditCardInfoData } from "@/usecases/ports"

export class CreditCardInfo {
    public readonly brand: string
    public readonly creditLimit: Amount
    public readonly availableCreditLimit: Amount
    public readonly closeDay: number
    public readonly dueDay: number

    private constructor(creditCard: { brand: string, creditLimit: Amount, availableCreditLimit: Amount, closeDay: number, dueDay: number }) {
        this.brand = creditCard.brand
        this.creditLimit = creditCard.creditLimit
        this.availableCreditLimit = creditCard.availableCreditLimit
        this.closeDay = creditCard.closeDay
        this.dueDay = creditCard.dueDay
    }

    public static create(creditCardInfoData: CreditCardInfoData) {

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
    
        const creditCardInfo = new CreditCardInfo({
            brand: creditCardInfoData.brand,
            creditLimit: creditLimitOrError.value as Amount,
            availableCreditLimit: availableCreditLimitOrError.value as Amount,
            closeDay: creditCardInfoData.closeDay,
            dueDay: creditCardInfoData.dueDay,
        })
    
        return right(creditCardInfo)
    }
}