import { JwtTokenManager } from "@/external/token-manager"
import { Payload } from "@/usecases/authentication/ports"
import { TokenExpiredError } from "jsonwebtoken"
import * as sinon from 'sinon'

describe('JWT token manager', () => {
    test('should correctly sign and verify a json web token', async () => {
        const secret = 'my secret'
        const tokenManager = new JwtTokenManager(secret)

        const info: Payload = {
          data: {
            id: 'my id',
            name: 'user name',
            email: 'email@email.com',
          },
          // 1 hour expiration
          exp: Math.floor(Date.now() / 1000) + (60 * 60),
         }
        const signedToken = await tokenManager.sign(info)
        const response = await tokenManager.verify(signedToken)
        expect(signedToken).not.toEqual(info)
        expect(response.isRight()).toBeTruthy()

        const result = response.value as Payload
        expect(result.data).toEqual(info.data)
        expect(result.exp).toEqual(info.exp)
        expect(result).toHaveProperty('iat') // issued at (creation date)
    })

    test('should correctly verify invalid json web token', async () => {
      const secret = 'my secret'
      const tokenManager = new JwtTokenManager(secret)
      const info: Payload = { id: 'my id' }
      const signedToken = await tokenManager.sign(info)
      const invalidToken = signedToken + 'some trash'
      expect((await tokenManager.verify(invalidToken)).isLeft()).toBeTruthy()
    })

    test.skip('should correctly verify default expiration of json web tokens - not expired', async () => {
      const clock = sinon.useFakeTimers()
      const secret = 'my secret'
      const tokenManager = new JwtTokenManager(secret)
      const info: Payload = { id: 'my id' }
      const signedToken = await tokenManager.sign(info)
      const twentyNineDays: number = 3600100 * 24 * 29
      clock.tick(twentyNineDays)
      const response = await tokenManager.verify(signedToken)
      expect(signedToken).not.toEqual(info)
      expect(response).toHaveProperty('value.id')
      expect(response.isRight()).toBeTruthy()
      clock.restore()
    })
  
    test.skip('should correctly verify default expiration of json web tokens - expired', async () => {
      const clock = sinon.useFakeTimers()
      const secret = 'my secret'
      const tokenManager = new JwtTokenManager(secret)
      const info: Payload = { id: 'my id' }
      const signedToken = await tokenManager.sign(info)
      const thirtyOneDays: number = 3600100 * 24 * 31
      clock.tick(thirtyOneDays)
      expect(signedToken).not.toEqual(info)
      expect(((await (tokenManager.verify(signedToken))).value)).toBeInstanceOf(TokenExpiredError)
      clock.restore()
    })

    test('should correctly verify expired json web tokens', async () => {
      const clock = sinon.useFakeTimers()
      const secret = 'my secret'
      const tokenManager = new JwtTokenManager(secret)
      const info: Payload = { 
        id: 'my id',
        // 1 hour expiration
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
       }
      const signedToken = await tokenManager.sign(info)
      // more than one hour has passed
      clock.tick(3600100)
      expect(signedToken).not.toEqual(info)
      expect(((await (tokenManager.verify(signedToken))).value)).toBeInstanceOf(TokenExpiredError)
      clock.restore()
    })
})