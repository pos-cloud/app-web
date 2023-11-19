import * as bcrypt from 'bcryptjs'
import * as express from 'express'

//import SMSController from '../domains/uc/sms.controller'
import UserController from '../domains/user/user.controller'
import UserDto from '../domains/user/user.dto'
import WrongCredentialsException from '../exceptions/WrongCredentialsException'
import Controller from '../interfaces/controller.interface'
import validationMiddleware from '../middleware/validation.middleware'

import User, {UserState} from './../domains/user/user.interface'
import UserSchema from './../domains/user/user.model'
import DisabledAuthenticationUserException from './../exceptions/DisabledAuthenticationUserException'
import HttpException from './../exceptions/HttpException'
import NotDataFoundException from './../exceptions/NotDataFoundExeption'
import PropertyValueExistsException from './../exceptions/PropertyValueExistsException'
import Responseable from './../interfaces/responsable.interface'
import Responser from './../utils/responser'
import LogInDto from './login/logIn.dto'
import RefreshTokenDto from './login/refreshToken.dto'
import TokenController from './token.controller'

class AuthenticationController implements Controller {
  public path = '/auth/'
  public router = express.Router()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}register`,
      validationMiddleware(UserDto),
      this.registration,
    )
    this.router.post(`${this.path}login`, validationMiddleware(LogInDto), this.loggingIn)
    this.router.post(`${this.path}logout`, this.loggingOut)
    this.router.post(`${this.path}verify-phone-number`, this.verifyPhoneNumber)
    this.router.post(`${this.path}send-code-phone-number`, this.sendCodeByPhoneNumber)
    this.router.post(
      `${this.path}refresh-token`,
      validationMiddleware(RefreshTokenDto),
      new TokenController().refreshToken,
    )
  }

  private registration = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      let database: string = request.query.database as string
      const autoLogin: string = JSON.parse(request.query.autoLogin as string)

      if (request.query.clientId) database = request.query.clientId as string
      if (!database || database == '')
        throw new HttpException(
          new Responser(500, null, 'clientId not indicated in registration'),
        )
      let userData: User = UserSchema.getInstance(database)

      userData = Object.assign(userData, request.body)

      await new UserController(database)
        .getAll({match: {email: userData.email, operationType: {$ne: 'D'}}})
        .then(async (result) => {
          if (result.result.length > 0)
            throw new PropertyValueExistsException('email', userData.email)
        })

      userData.password = await bcrypt.hash(userData.password, 10)
      let user: User

      await new UserController(database).save(userData).then((result) => {
        user = result.result
      })
      if (autoLogin) {
        if (user.state === UserState.Disabled)
          throw new DisabledAuthenticationUserException()
        user.password = undefined
        const tokenData = new TokenController(database).createToken(user, database)

        response.send(new Responser(200, {user: user, token: tokenData}))
      } else response.send(new Responser(200, {ok: 1}))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  private loggingIn = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const logInData: LogInDto = request.body
      let database: string = request.query.database as string

      if (request.query.clientId) database = request.query.clientId as string
      if (!database || database == '')
        throw new HttpException(
          new Responser(500, null, 'clientId not indicated in registration'),
        )
      let user: User

      await new UserController(database)
        .getAll({match: {email: logInData.email}, limit: 1})
        .then(async (result: Responseable) => {
          if (result.result.length > 0) user = result.result[0]
        })
      if (!user) throw new WrongCredentialsException()
      const isPasswordMatching = await bcrypt.compare(logInData.password, user.password)

      if (!isPasswordMatching) throw new WrongCredentialsException()
      if (user.state === UserState.Disabled)
        throw new DisabledAuthenticationUserException()
      const tokenData = new TokenController(database).createToken(user, database)
      const refreshToken = new TokenController().createTokenSession({
        user: user ? (user._id ? user._id : user.toString()) : null,
        clientId: database,
      })

      user.refreshToken = refreshToken
      await new UserController(database).update(user._id, user)
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
          token: tokenData,
          refreshToken,
        }),
      )
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  private loggingOut = (request: express.Request, response: express.Response) => {
    response.setHeader('Set-Cookie', ['Authorization=;Max-age=0'])
    response.send(200)
  }

  private sendCodeByPhoneNumber = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      let email: string = request.body.email
      let phone: string = request.body.phone
      let messagePlus: string = request.body.message
      const database: string = request.query.database as string

      if (!database || database == '')
        throw new HttpException(new Responser(500, null, 'database not indicated'))
      if (!email || !phone)
        throw new HttpException(new Responser(500, null, 'email and found are required'))

      email = email.trim()
      phone = phone.trim()

      let user: User

      await new UserController(database)
        .getAll({project: {email: 1, phone: 1}, match: {email: email, phone: phone}})
        .then(async (result: Responseable) => {
          if (result.result.length > 0) user = result.result[0]
        })
      if (!user) throw new NotDataFoundException()
      let opt: string = ''

      for (let i of [1, 2, 3, 4]) {
        opt += Math.floor(Math.random() * 10)
      }
      user.opt = opt
      await new UserController(database).update(user._id, user)
      const message: string = `Tu código de verificación es ${opt}.${messagePlus}`

      //await new SMSController(database).sendMessage(message, phone)
      response.send(new Responser(200, {ok: 1}))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  private verifyPhoneNumber = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      let email: string = request.body.email
      let phone: string = request.body.phone
      let opt: string = request.body.opt
      const database: string = request.query.database as string

      if (!database || database == '')
        throw new HttpException(new Responser(500, null, 'database not indicated'))
      if (!email || !phone)
        throw new HttpException(new Responser(500, null, 'email and found are required'))
      email = email.trim()
      phone = phone.trim()
      let user: User

      await new UserController(database)
        .getAll({match: {email: email, phone: phone}})
        .then(async (result: Responseable) => {
          if (result.result.length > 0) user = result.result[0]
        })
      if (!user) throw new NotDataFoundException()
      if (user.opt === opt) {
        user.opt = null
        user.state = UserState.Enabled
      } else
        throw new HttpException(
          new Responser(500, null, 'OPT entered is invalid', 'OPT entered is invalid'),
        )
      await new UserController(database).update(user._id, user)
      user.password = undefined
      const tokenData = new TokenController(database).createToken(user, database)

      response.send(new Responser(200, {user: user, token: tokenData}))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }
}

export default AuthenticationController
