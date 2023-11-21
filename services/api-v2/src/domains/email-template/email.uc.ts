import * as axios from 'axios'
import * as nodemailer from 'nodemailer'

import Responseable from './../../interfaces/responsable.interface'
import {connectionMail} from './email-template.model'

export default class EmailUC {
  database: string
  api: any
  authToken: string

  constructor(database: string, authToken?: string) {
    this.database = database
    this.authToken = authToken
    this.api = axios.default
  }

  sendEmail = async (smtp: connectionMail, mail: {}): Promise<Responseable> => {
    return new Promise((resolve) => {
      const transporter = nodemailer.createTransport(smtp)

      transporter.sendMail(mail, (err: any) => {
        if (err) {
          resolve({
            result: '',
            message: err.message,
            error: err,
            status: 404,
          })
        } else {
          resolve({
            result: 'Enviado con exito',
            message: 'Enviado con exito',
            error: null,
            status: 200,
          })
        }
      })
    })
  }
}
