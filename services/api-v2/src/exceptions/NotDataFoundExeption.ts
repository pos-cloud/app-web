import Responser from '../utils/responser'

import Responseable from './../interfaces/responsable.interface'
import HttpException from './HttpException'

class NotDataFoundException extends HttpException {
  constructor() {
    let responser: Responseable = new Responser()

    responser.result = null
    responser.error = 'not data found'
    responser.status = 404
    responser.message = 'not data found'
    super(responser)
  }
}

export default NotDataFoundException
