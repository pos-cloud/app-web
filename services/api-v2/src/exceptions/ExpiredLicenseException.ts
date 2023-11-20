import Responseable from './../interfaces/responsable.interface'
import Responser from './../utils/responser'
import HttpException from './HttpException'

export default class ExpiredLicenseException extends HttpException {
  constructor() {
    let responser: Responseable = new Responser()

    responser.result = null
    responser.error = 'expired license'
    responser.status = 401
    responser.message = 'expired license'
    super(responser)
  }
}
