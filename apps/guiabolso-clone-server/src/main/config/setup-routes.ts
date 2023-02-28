import { Express, Router } from 'express'
import { adaptRoute } from '@/main/adapters'
import { makeCreateManualWalletAccountController, makeSignInController, makeSignUpController } from '@/main/factories'

export default (app: Express): void => {
    const router = Router()
    app.use('/api', router)

    /** Cadastro */
    router.post('/signup', adaptRoute(makeSignUpController()))
    /** Login */
    router.post('/signin', adaptRoute(makeSignInController()))

    router.post('/create/manual-wallet', adaptRoute(makeCreateManualWalletAccountController()))
}