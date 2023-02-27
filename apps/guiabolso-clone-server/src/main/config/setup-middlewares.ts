import { Express } from 'express'
import { bodyParser } from '@/main/middleware/body-parser'
import { contentType } from '@/main/middleware/content-type'

export default (app: Express): void => {
    app.use(bodyParser)
    app.use(contentType)
}