import * as Sentry from '@sentry/node'
import Responseable from 'interfaces/responsable.interface'
import * as moment from 'moment'
import 'moment/locale/es'

export default class HttpException extends Error {
  public result: any
  public status: number
  public message: string
  public error: any
  constructor(responser: Responseable) {
    let message =
      responser.message && responser.message.toString() !== ''
        ? responser.message.toString()
        : 'Error inesperado.'

    super(message)
    this.status = responser.status
    this.result = responser.result
    this.message = message
    this.error = responser.error ? responser.error.toString() : 'Error inesperado.'
    if (this.status === 500) {
      try {
        Sentry.captureException(this.error)
      } catch (error) {
        console.log(error)
      }
      console.error(
        '\x1b[32m',
        moment().format('DD/MM/YYYY HH:mm:ss'),
        `STATUS ${this.status}`,
      )
      console.error(
        this.status === 500 ? '\x1b[31m' : '\x1b[33m',
        this.stack ? this.stack : 'Error inesperado.',
      )
      console.log('\x1b[37m', '\x1b[40m')
    }
  }
}
