import {Request} from 'express'

interface request extends Request {
  user: any
  database: string
}

export default request