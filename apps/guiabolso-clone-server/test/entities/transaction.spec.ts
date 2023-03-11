import { Transaction, User } from "@/entities"
import { InvalidTransactionError } from "@/entities/errors"

describe("Transaction entity", () => {
    test("should not create transaction with empty user", () => {
        const user: User = null
        const error = Transaction.create({ user }).value as Error
        expect(error).toBeInstanceOf(InvalidTransactionError)
        expect(error.message).toBe('Invalid user')
    })

})