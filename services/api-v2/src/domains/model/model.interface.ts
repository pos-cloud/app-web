import User from './../../domains/user/user.interface'

export default interface Model {
  _id: string
  operationType?: string
  audits: [
    {
      user: User
      date: string
    },
  ]
}
