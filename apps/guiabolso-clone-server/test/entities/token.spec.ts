import { Token } from "@/entities"

describe("Token entity", () => {
    describe('User validation token', () => {
        test('should create a token', () => {
            const type = 'USER-VALIDATION-TOKEN'
            const userId = 'valid-user-id'
            const hash = 'valid hash'
            const expireAt = new Date()
    
            const token = Token.create(type, userId, hash, expireAt)
    
            expect(token.value).toEqual({
                type,
                userId,
                hash,
                expireAt,
            })
        })
    })
})