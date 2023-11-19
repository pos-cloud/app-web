import * as express from 'express'
import * as jwt from 'jwt-simple'
import * as moment from 'moment'

import UserController from './../domains/user/user.controller'
import User, {UserState} from './../domains/user/user.interface'
import DisabledAuthenticationUserException from './../exceptions/DisabledAuthenticationUserException'
import HttpException from './../exceptions/HttpException'
import NotAuthorizedException from './../exceptions/NotAuthorizedException'
import DataStoredInToken from './../interfaces/dataStoredInToken.interface'
import {License} from './../interfaces/licenseInterface.interface'
import Responseable from './../interfaces/responsable.interface'
import SessionToken from './../interfaces/sessionToken.interface'
import TokenData from './../interfaces/tokenData.interface'
import WrongTokenException from './../interfaces/WrongTokenException'
import config from './../utils/config'
import Responser from './../utils/responser'

class TokenController {
  database: string

  constructor(database?: string) {
    this.database = database
  }

  createToken(user: User, database: string): TokenData {
    const expiresIn = moment()
      .add(user.tokenExpiration || config.SESSION_EXPIRATION_TIME, 'minutes')
      .unix()
    const secret = config.TOKEN_SECRET
    const dataStoredInToken: DataStoredInToken = {
      database,
      clientId: database,
      user: user._id,
      iat: moment().unix(),
      exp: expiresIn,
    }

    return {
      expiresIn,
      token: jwt.encode(dataStoredInToken, secret),
    }
  }

  createTokenSession(data: SessionToken): string {
    data.clientId ? (data.clientId = this.database) : data.clientId
    data.iat ? data.iat : moment().unix()

    return jwt.encode(data, config.TOKEN_SECRET)
  }

  createTokenForgotPassword(data: SessionToken): string {
    data.clientId ? (data.clientId = this.database) : data.clientId
    data.iat ? data.iat : moment().unix()
    data.exp = moment().add(config.FORGOT_PASSWORD_EXPIRATION_TIME, 'minutes').unix()

    return jwt.encode(data, config.TOKEN_SECRET)
  }

  createTokenLicense(license: License): string {
    let token = jwt.encode(
      {
        expiration: moment(license.billingDate).unix(),
      },
      config.TOKEN_SECRET,
    )

    return token
  }

  refreshToken = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const refreshToken: string = request.body.refreshToken.replace(/['"]+/g, '')

      this.database = request.query.clientId as string
      if (!this.database || this.database == '')
        throw new HttpException(
          new Responser(500, null, 'clientId not indicated in refreshToken'),
        )
      let user: User

      if (!refreshToken) throw new WrongTokenException()
      const verificationResponse = jwt.decode(
        refreshToken,
        config.TOKEN_SECRET,
      ) as SessionToken

      if (!verificationResponse)
        throw new HttpException(new Responser(400, null, 'token not indicated'))
      if (verificationResponse.user) {
        await new UserController(this.database)
          .getAll({match: {_id: {$oid: verificationResponse.user}}})
          .then(async (result: Responseable) => {
            if (result.result.length === 0) throw new NotAuthorizedException()
            user = result.result[0]
            if (user.state === UserState.Disabled)
              throw new DisabledAuthenticationUserException()
            user.password = undefined
            user.refreshToken = undefined
          })
      }
      const expiresIn = moment()
        .add(user.tokenExpiration || config.SESSION_EXPIRATION_TIME, 'minutes')
        .unix()
      const token = this.createTokenSession({
        user: user ? (user._id ? user._id : user.toString()) : null,
        clientId: this.database,
        exp: expiresIn,
      })

      response.send(
        new Responser(200, {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            employee: user.employee,
            state: user.state,
            permission: user.permission,
          },
          token,
          expiresIn,
          refreshToken,
        }),
      )
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }
}

export default TokenController
