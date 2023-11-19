import Responseable from './../interfaces/responsable.interface'
import Responser from './../utils/responser'
import HttpException from './HttpException'

export default class DisabledAuthenticationUserException extends HttpException {
  constructor() {
    let responser: Responseable = new Responser()

    responser.result = null
    responser.error = 'disabled authentication user'
    responser.status = 401
    responser.message = 'disabled authentication user'
    super(responser)
  }
}
