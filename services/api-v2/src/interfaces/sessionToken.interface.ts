export default interface SessionToken {
  user: string
  clientId: string
  iat?: number
  exp?: number
}
