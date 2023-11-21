import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator'

import Responseable from './../../interfaces/responsable.interface'
import AccountController from './account.controller'

@ValidatorConstraint()
export class IsUserAlreadyExist implements ValidatorConstraintInterface {
  async validate(text: string, validationArguments: ValidationArguments) {
    let isValid: boolean = true

    await new AccountController('distribuidoragiletta')
      .getAll({
        project: {
          code: 1,
        },
        match: {
          code: text,
          operationType: {$ne: 'D'},
        },
      })
      .then(async (result: Responseable) => {
        if (result.status === 200) {
          if (result.result.length > 0) {
            isValid = false
          }
        }
      })
      .catch()

    return isValid
  }
}
