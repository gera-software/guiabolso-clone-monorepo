import { Amount } from "@/entities"
import { InvalidAmountError } from "@/entities/errors"

describe("Amount value object", () => {
    test("should not create an amount if it isn't an integer value", () => {
        const invalidAmount = 5.69
        const error = Amount.create(invalidAmount).value as Error
        expect(error).toBeInstanceOf(InvalidAmountError)
    })

    test("should create an amount if it is a positive integer value", () => {
        const validAmount = 569
        const amount = Amount.create(validAmount).value as Amount
        expect(amount.value).toBe(validAmount)
    })

    test("should create an amount if it is a negative integer value", () => {
        const validAmount = -569
        const amount = Amount.create(validAmount).value as Amount
        expect(amount.value).toBe(validAmount)
    })

    test("should create an amount if it is zero value", () => {
        const validAmount = 0
        const amount = Amount.create(validAmount).value as Amount
        expect(amount.value).toBe(validAmount)
    })
})