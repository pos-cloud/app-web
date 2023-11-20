import Responseable from './../interfaces/responsable.interface'
import Responser from './../utils/responser'
import HttpException from './HttpException'

export default class NotFoundException extends HttpException {
  constructor(id: string, error?: any) {
    let responser: Responseable = new Responser()

    responser.result = null
    responser.error = error
    responser.status = 404
    responser.message = `Id ${id} not found`
    super(responser)
  }
}
