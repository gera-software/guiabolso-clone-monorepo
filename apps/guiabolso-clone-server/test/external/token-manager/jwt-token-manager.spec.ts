import { JWtTokenManager } from "@/external/token-manager"
import { Payload } from "@/usecases/authentication/ports"

describe('JWT token manager', () => {
    test('should correctly sign and verify a json web token', async () => {
        const secret = 'my secret'
        const tokenManager = new JWtTokenManager(secret)
        const info: Payload = { id: 'my id' }
        const signedToken = await tokenManager.sign(info)
        const response = await tokenManager.verify(signedToken)
        expect(signedToken).not.toEqual(info)
        expect(response.isRight()).toBeTruthy()
        expect(response.value).toHaveProperty('id')
      })
})