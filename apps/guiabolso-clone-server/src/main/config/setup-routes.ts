import { Express, Router } from 'express'
import { adaptRoute } from '@/main/adapters'
import { 
    makeAddManualTransactionController, 
    makeCreateManualBankAccountController, 
    makeCreateManualCreditCardAccountController, 
    makeCreateManualWalletAccountController, 
    makeListAllCategoriesController, 
    makeListInstitutionsByTypeController, 
    makeRemoveManualTransactionController, 
    makeSignInController,
    makeSignUpController,
    makeUpdateManualTransactionController
 } from '@/main/factories'

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
    router.post('/create/manual-credit-card', adaptRoute(makeCreateManualCreditCardAccountController()))
    router.get('/institution', adaptRoute(makeListInstitutionsByTypeController()))
    router.get('/category', adaptRoute(makeListAllCategoriesController()))

    router.post('/manual-transaction', adaptRoute(makeAddManualTransactionController()))
    router.delete('/manual-transaction', adaptRoute(makeRemoveManualTransactionController()))
    router.put('/manual-transaction', adaptRoute(makeUpdateManualTransactionController()))
}