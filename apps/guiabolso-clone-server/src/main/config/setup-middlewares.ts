import { Express } from 'express'
import { bodyParser } from '@/main/middleware/body-parser'

export default (app: Express): void => {
    app.use(bodyParser)
}