export default interface DataStoredInToken {
  user: string
  database: string
  clientId: string
  iat: number
  exp: number
}
