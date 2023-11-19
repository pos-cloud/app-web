import Responser from '../utils/responser'

import Responseable from './../interfaces/responsable.interface'
import HttpException from './HttpException'

class TheRecordAlreadyExistsException extends HttpException {
  constructor() {
    let responser: Responseable = new Responser()

    responser.result = null
    responser.error = 'the record already exists'
    responser.status = 409
    responser.message = 'the record already exists'
    super(responser)
  }
}

export default TheRecordAlreadyExistsException
