// import {NextFunction, Response} from 'express'
// import * as jwt from 'jwt-simple'
// import * as moment from 'moment'

// import RequestWithUser from '../interfaces/requestWithUser.interface'

// import 'moment/locale/es'
// import ConfigController from '../app/controllers/config/config.controller'
// import ExpiredLicenseException from '../../exceptions/ExpiredLicenseException'
// import HttpException from '../../exceptions/HttpException'
// import Responseable from '../interfaces/responsable.interface'
// import config from '../../utils/config'
// import Responser from '../../utils/responser'

// async function ensureLic(
//   request: RequestWithUser,
//   response: Response,
//   next: NextFunction,
// ) {
//   const configController = new ConfigController(request.database)

//   await configController
//     .getAll({})
//     .then((result: Responseable) => {
//       if (result.status === 200) {
//         let configCli = result.result[0]
//         let token = configCli.license
//         let payload: any

//         try {
//           payload = jwt.decode(token, config.LIC_PASSWORD)
//           if (payload.number !== configCli.numberCompany) {
//             next(new ExpiredLicenseException())
//           } else {
//             configCli.licensePaymentDueDate = moment
//               .unix(payload.exp)
//               .format('DYYYY-MM-DDTHH:mm:ssZ')
//           }

//           if (payload.exp <= moment().unix()) {
//             next(new ExpiredLicenseException())
//           } else {
//             if (configCli.modules && payload.modules) {
//               let modules

//               try {
//                 modules = JSON.parse(payload.modules)
//                 let isValid = true

//                 if (modules.sale.resto !== configCli.modules.sale.resto) isValid = false
//                 if (modules.sale.counter !== configCli.modules.sale.counter)
//                   isValid = false
//                 if (modules.sale.delivery !== configCli.modules.sale.delivery)
//                   isValid = false
//                 if (modules.purchase !== configCli.modules.purchase) isValid = false
//                 if (modules.production.pos !== configCli.modules.production.pos)
//                   isValid = false
//                 if (modules.production.kitchen !== configCli.modules.production.kitchen)
//                   isValid = false
//                 if (modules.woocommerce !== configCli.modules.woocommerce) isValid = false
//                 if (modules.mercadolibre !== configCli.modules.mercadolibre)
//                   isValid = false
//                 if (modules.accounting !== configCli.modules.mercadolibre) isValid = false
//                 if (modules.stock !== configCli.modules.stock) isValid = false
//                 if (modules.demo !== configCli.modules.demo) isValid = false
//                 if (modules.gallery !== configCli.modules.gallery) isValid = false
//                 if (!isValid) {
//                   configCli.modules = modules
//                   configController
//                     .update(configCli._id, config)
//                     .then((result: Responseable) =>
//                       result.status === 200 ? next() : next(result),
//                     )
//                     .catch((error: Responseable) =>
//                       next(
//                         new HttpException(new Responser(500, null, error.message, error)),
//                       ),
//                     )
//                 } else next()
//               } catch (error) {
//                 next(new Responser(500, null, error.message, error))
//               }
//             } else {
//               if (payload.modules) {
//                 try {
//                   configCli.modules = JSON.parse(payload.modules)
//                   configController
//                     .update(configCli._id, config)
//                     .then((result: Responseable) =>
//                       result.status === 200 ? next() : next(result),
//                     )
//                     .catch((error: Responseable) =>
//                       next(
//                         new HttpException(new Responser(500, null, error.message, error)),
//                       ),
//                     )
//                 } catch (error) {
//                   next(new HttpException(new Responser(500, null, error.message, error)))
//                 }
//               } else {
//                 next(new ExpiredLicenseException())
//               }
//             }
//           }
//         } catch (ex) {
//           next(new ExpiredLicenseException())
//         }
//       } else
//         next(
//           new HttpException(new Responser(result.status, null, result.message, result)),
//         )
//     })
//     .catch((error) =>
//       next(new HttpException(new Responser(500, null, error.message, error))),
//     )
// }

// export default ensureLic
