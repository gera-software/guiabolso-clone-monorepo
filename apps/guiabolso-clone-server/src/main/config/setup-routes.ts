import { Express, Router } from 'express'
import { adaptRoute } from '@/main/adapters'
import { makeSignUpController } from '@/main/factories'

export default (app: Express): void => {
    const router = Router()
    app.use('/api', router)

    router.post('/signup', adaptRoute(makeSignUpController()))
}