import Responseable from '../interfaces/responsable.interface'

export default class Responser implements Responseable {
  public result: any
  public message: string
  public error: any
  public status: number
  constructor(status?: number, result: any = null, message?: string, error: any = null) {
    this.status = status
    this.result = result
    this.message = message
      ? message
      : status === 200
      ? 'Operación realizada con éxito.'
      : ''
    this.error = error
  }
}
