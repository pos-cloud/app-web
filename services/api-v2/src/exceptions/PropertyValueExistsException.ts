import Responser from '../utils/responser'

import Responseable from './../interfaces/responsable.interface'
import HttpException from './HttpException'

export default class PropertyValueExistsException extends HttpException {
  constructor(property: string, value: string) {
    let responser: Responseable = new Responser()

    responser.result = null
    responser.error = `${property} property with value ${value} already exists`
    responser.status = 400
    responser.message = `${property} property with value ${value} already exists`
    super(responser)
  }
}
