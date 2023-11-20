import Responseable from './../interfaces/responsable.interface'
import Responser from './../utils/responser'
import HttpException from './HttpException'

class NotAuthorizedException extends HttpException {
  constructor() {
    let responser: Responseable = new Responser()

    responser.result = null
    responser.error = "you're not authorized"
    responser.status = 403
    responser.message = "you're not authorized"
    super(responser)
  }
}

export default NotAuthorizedException
