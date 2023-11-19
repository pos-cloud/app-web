import {plainToClass} from 'class-transformer'
import {validate, ValidationError} from 'class-validator'
import * as express from 'express'

import HttpException from '../exceptions/HttpException'

import Responser from '../utils/responser'

function validationMiddleware<T>(
  type: any,
  skipMissingProperties: boolean = false,
): express.RequestHandler {
  return (req, res, next) => {
    validate(plainToClass(type, req.body), {skipMissingProperties: true}).then(
      (errors: ValidationError[]) => {
        if (errors.length > 0) {
          const message = errors
            .map((error: ValidationError) => Object.values(error.constraints))
            .join(', ')

          next(new HttpException(new Responser(400, null, message, message)))
        } else {
          next()
        }
      },
    )
  }
}

export default validationMiddleware
