import { Express, Router } from 'express'
import { adaptRoute } from '@/main/adapters'
import { 
    makeAddManualTransactionController, 
    makeConnectAutomaticAccountsController, 
    makeCreateManualAccountController, 
    makeListAllCategoriesController, 
    makeListAvailableAutomaticInstitutionsController, 
    makeListInstitutionsByTypeController, 
    makePluggyConnectWidgetCreateTokenController, 
    makeRemoveManualTransactionController, 
    makeSignInController,
    makeSignUpController,
    makeUpdateManualTransactionController,
 } from '@/main/factories'

export default (app: Express): void => {
    const router = Router()
    app.use('/api', router)

    /** Cadastro */
    router.post('/signup', adaptRoute(makeSignUpController()))
    /** Login */
    router.post('/signin', adaptRoute(makeSignInController()))

    // TODO faltam as verificações de segurança se o usuario não estiver autenticado!
    router.post('/manual-account', adaptRoute(makeCreateManualAccountController()))

    router.get('/institution', adaptRoute(makeListInstitutionsByTypeController()))
    router.get('/category', adaptRoute(makeListAllCategoriesController()))

    router.get('/available-automatic-institutions', adaptRoute(makeListAvailableAutomaticInstitutionsController()))
    router.get('/pluggy/create-token', adaptRoute(makePluggyConnectWidgetCreateTokenController()))
    router.post('/connect-accounts', adaptRoute(makeConnectAutomaticAccountsController()))


    router.post('/manual-transaction', adaptRoute(makeAddManualTransactionController()))
    router.delete('/manual-transaction', adaptRoute(makeRemoveManualTransactionController()))
    router.put('/manual-transaction', adaptRoute(makeUpdateManualTransactionController()))
}