import express from 'express'
import cors from 'cors'
import { env } from './config/env'
import { routes } from './routes'
import { errorMiddleware } from './middleware/error.middleware'

export function createApp() {
  const app = express()

  // Behind a proxy (Render, Railway, nginx) set trust proxy, or express-rate-limit
  // sees every request as coming from the proxy IP and throttles all users together.
  // Left off deliberately: enabling it without a real proxy lets clients spoof their
  // IP via X-Forwarded-For and slip the limiter.
  // app.set('trust proxy', 1)
  app.use(cors({ origin: env.WEB_ORIGIN }))
  app.use(express.json())
  app.use(routes)
  app.use(errorMiddleware)

  return app
}
