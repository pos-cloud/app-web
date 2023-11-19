import {NextFunction, Response} from 'express'
import * as jwt from 'jwt-simple'

import UserController from './../domains/user/user.controller'
import {UserState} from './../domains/user/user.interface'
import AuthenticationTokenMissingException from './../exceptions/AuthenticationTokenMissingException'
import DisabledAuthenticationUserException from './../exceptions/DisabledAuthenticationUserException'
import HttpException from './../exceptions/HttpException'
import WrongAuthenticationTokenException from './../exceptions/WrongAuthenticationTokenException'
import DataStoredInToken from './../interfaces/dataStoredInToken.interface'
import RequestWithUser from './../interfaces/requestWithUser.interface'
import config from './../utils/config'
import Responser from './../utils/responser'

async function authMiddleware(
  request: RequestWithUser,
  response: Response,
  next: NextFunction,
) {
  if (request.headers && request.headers.authorization) {
    let token = request.headers.authorization.replace(/['"]+/g, '')

    try {
      const verificationResponse = jwt.decode(
        token,
        config.TOKEN_SECRET,
      ) as DataStoredInToken

      if (
        verificationResponse &&
        verificationResponse.user &&
        (verificationResponse.database || verificationResponse.clientId)
      ) {
        const id = verificationResponse.user
        const database: string =
          verificationResponse.database || verificationResponse.clientId

        await new UserController(database)
          .getById(id)
          .then((result) => {
            let user = result.result

            if (user) {
              if (user.state === UserState.Enabled) {
                request.user = user
                request.database = database
                next()
              } else {
                next(new DisabledAuthenticationUserException())
              }
            } else {
              next(new WrongAuthenticationTokenException())
            }
          })
          .catch((error) => {
            next(new HttpException(new Responser(500, null, error.message, error)))
          })
      } else {
        next(new WrongAuthenticationTokenException())
      }
    } catch (error) {
      next(new WrongAuthenticationTokenException())
    }
  } else {
    next(new AuthenticationTokenMissingException())
  }
}

export default authMiddleware
