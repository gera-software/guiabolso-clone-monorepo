import express from 'express'
import setupMiddlewares from '@/main/config/setup-middlewares'

const app = express()

setupMiddlewares(app)

export default app