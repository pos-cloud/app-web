import HttpException from '../exceptions/HttpException'
import Responseable from './responsable.interface'
import Responser from '../utils/responser'

export default class WrongTokenException extends HttpException {
  constructor() {
    let responser: Responseable = new Responser()

    responser.result = null
    responser.error = 'wrong token'
    responser.status = 401
    responser.message = 'wrong token'
    super(responser)
  }
}
