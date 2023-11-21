import User from 'domains/user/user.interface'
import {Request} from 'express'

interface RequestWithUser extends Request {
  user: User
  database: string
}

export default RequestWithUser
