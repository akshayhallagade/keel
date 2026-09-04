import express from 'express'
import cors from 'cors'
import { env } from './config/env'
import { routes } from './routes'
import { errorMiddleware } from './middleware/error.middleware'

export function createApp() {
  const app = express()

  app.use(cors({ origin: env.WEB_ORIGIN }))
  app.use(express.json())
  app.use(routes)
  app.use(errorMiddleware)

  return app
}
