import Responseable from './../interfaces/responsable.interface'
import Responser from './../utils/responser'
import HttpException from './HttpException'

export default class AuthenticationTokenMissingException extends HttpException {
  constructor() {
    let responser: Responseable = new Responser()

    responser.result = null
    responser.error = 'authentication token missing'
    responser.status = 401
    responser.message = 'authentication token missing'
    super(responser)
  }
}
