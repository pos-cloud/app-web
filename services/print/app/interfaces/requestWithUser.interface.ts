import {Request} from 'express'
interface RequestWithUser extends Request {
  userId: string
  database: string
}

export default RequestWithUser
