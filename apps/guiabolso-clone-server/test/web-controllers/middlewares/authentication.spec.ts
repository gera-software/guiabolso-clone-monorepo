import { HttpResponse } from "@/web-controllers/ports"
import { FakeTokenManager, ThrowingFakeTokenManager } from "@test/doubles/authentication"
import { forbidden, ok, serverError } from '@/web-controllers/util'
import { Authentication } from "@/web-controllers/middlewares"

describe('Authentication middleware', () => {
    test('should return forbidden with invalid token error if access token is empty', async () => {
        const authMiddleware = new Authentication(new FakeTokenManager())
        const response: HttpResponse = await authMiddleware.handle({ accessToken: '', requesterId: '0' })
        expect(response).toEqual(forbidden(new Error('Invalid token or requester id.')))
    })

    test('should return forbidden with invalid token error if access token is null', async () => {
        const authMiddleware = new Authentication(new FakeTokenManager())
        const response: HttpResponse = await authMiddleware.handle({ accessToken: null, requesterId: '0' })
        expect(response).toEqual(forbidden(new Error('Invalid token or requester id.')))
    })

    test('should return forbidden with invalid token error if access token is invalid', async () => {
        const tokenManager = new FakeTokenManager()
        const payload = { id: 'my id' }
        const token = await tokenManager.sign(payload)
        const invalidToken = token + 'some trash'
        const authMiddleware = new Authentication(tokenManager)
        const response: HttpResponse = await authMiddleware.handle({ accessToken: invalidToken, requesterId: 'my id' })
        expect(response).toEqual(forbidden(new Error('Invalid token.')))
    })

    test('should return forbidden if id on access token is different from requester id', async () => {
        const tokenManager = new FakeTokenManager()
        const payload = { id: 'my id' }
        const token = await tokenManager.sign(payload)
        const authMiddleware = new Authentication(tokenManager)
        const response: HttpResponse = await authMiddleware.handle({ accessToken: token, requesterId: 'other id' })
        expect(response).toEqual(forbidden(new Error('User not allowed to perform this operation.')))
    })

    test('should return payload if access token is valid', async () => {
        const tokenManager = new FakeTokenManager()
        const payload = { id: 'my id' }
        const validToken = await tokenManager.sign(payload)
        const authMiddleware = new Authentication(tokenManager)
        const response: HttpResponse = await authMiddleware.handle({ accessToken: validToken, requesterId: 'my id' })
        expect(response).toEqual(ok(payload))
    })

    test('should return server error if server throws', async () => {
        const tokenManager = new ThrowingFakeTokenManager()
        const payload = { id: 'my id' }
        const validToken = await tokenManager.sign(payload)
        const authMiddleware = new Authentication(tokenManager)
        const response: HttpResponse = await authMiddleware.handle({ accessToken: validToken, requesterId: '0' })
        expect(response).toEqual(serverError(new Error('An error.')))
      })
})