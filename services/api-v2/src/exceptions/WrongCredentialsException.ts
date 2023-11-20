import Responseable from './../interfaces/responsable.interface'
import Responser from './../utils/responser'
import HttpException from './HttpException'

export default class WrongCredentialsException extends HttpException {
  constructor() {
    let responser: Responseable = new Responser()

    responser.result = null
    responser.error = 'bad provided credentials'
    responser.status = 401
    responser.message = 'bad provided credentials'
    super(responser)
  }
}
