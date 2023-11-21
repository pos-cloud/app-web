import * as Sentry from '@sentry/node'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as moment from 'moment'

import errorMiddleware from './middleware/error.middleware'
import config from './utils/config'
import initializeControllers from './utils/initialize-controllers'

import 'dotenv/config';

const cors = require('cors')

class App {
  app: express.Application

  constructor() {
    this.app = express().use('*', cors())

    this.initializeMiddlewares()
    initializeControllers(this.app)
    this.initializeErrorHandling()
  }

  listen() {
    this.app.listen(config.PORT || 308, () => {
      console.log(
        `${moment().format(
          'YYYY-MM-DDTHH:mm:ssZ',
        )} App listening on the port ${config.PORT || 308} env=${config.NODE_ENV}`,
      )
      this.initSentry()
    })
  }

  initSentry() {
    Sentry.init({
      dsn: 'https://f09263c294c44983a95bdb746d84fc2d@o469833.ingest.sentry.io/6142663',
      tracesSampleRate: 1.0,
      environment: config.NODE_ENV,
    })
  }

  getServer() {
    return this.app
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json())
    this.app.use(cookieParser())
  }

  private initializeErrorHandling() {
    this.app.use(Sentry.Handlers.errorHandler())
    this.app.use(errorMiddleware)
  }
}

export default App
