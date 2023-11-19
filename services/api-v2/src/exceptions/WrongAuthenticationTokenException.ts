import Responseable from './../interfaces/responsable.interface'
import Responser from './../utils/responser'
import HttpException from './HttpException'

export default class WrongAuthenticationTokenException extends HttpException {
  constructor() {
    let responser: Responseable = new Responser()

    responser.result = null
    responser.error = 'wrong authentication token'
    responser.status = 401
    responser.message = 'wrong authentication token'
    super(responser)
  }
}
