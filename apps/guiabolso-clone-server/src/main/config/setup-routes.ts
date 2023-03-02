import { Express, Router } from 'express'
import { adaptRoute } from '@/main/adapters'
import { makeCreateManualBankAccountController, makeCreateManualWalletAccountController, makeListInstitutionsByTypeController, makeSignInController, makeSignUpController } from '@/main/factories'

export default (app: Express): void => {
    const router = Router()
    app.use('/api', router)

    /** Cadastro */
    router.post('/signup', adaptRoute(makeSignUpController()))
    /** Login */
    router.post('/signin', adaptRoute(makeSignInController()))

    // TODO faltam as verificações de segurança se o usuario não estiver autenticado!
    router.post('/create/manual-wallet', adaptRoute(makeCreateManualWalletAccountController()))
    router.post('/create/manual-bank', adaptRoute(makeCreateManualBankAccountController()))
    router.get('/institution', adaptRoute(makeListInstitutionsByTypeController()))
}