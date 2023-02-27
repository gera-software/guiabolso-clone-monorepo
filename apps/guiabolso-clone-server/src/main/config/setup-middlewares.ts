import { Express } from 'express'
import { bodyParser } from '@/main/middleware/body-parser'
import { contentType } from '@/main/middleware/content-type'
import { cors } from '@/main/middleware/cors'

export default (app: Express): void => {
    app.use(bodyParser)
    app.use(contentType)
    app.use(cors)
}