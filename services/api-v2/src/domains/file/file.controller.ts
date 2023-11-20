import * as fs from 'fs'
import * as path from 'path'

import * as express from 'express'
import * as jimp from 'jimp'
import * as moment from 'moment'
import * as multer from 'multer'

import HttpException from './../../exceptions/HttpException'
import RequestWithUser from './../../interfaces/requestWithUser.interface'
import authMiddleware from './../../middleware/auth.middleware'
import ensureLic from './../../middleware/license.middleware'
import Responser from './../../utils/responser'

export default class FileController {
  public EJSON: any = require('bson').EJSON
  public path = '/file'
  public router = express.Router()
  public obj: any

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    let upload = multer({storage: this.getStorage()})

    this.router
      .get(`${this.path}`, this.getFile)
      .post(
        `${this.path}`,
        [authMiddleware, ensureLic, upload.single('image')],
        this.upload,
      )
      .delete(`${this.path}`, [authMiddleware, ensureLic], this.deleteFile)
  }

  public getStorage(): multer.StorageEngine {
    let storage = multer.diskStorage({
      destination: function (request: RequestWithUser, file, cb) {
        let path = '/home/clients/'

        if (request.database) {
          path += `${request.database}/${request.query.type}s/${request.query.model}`
        }
        fs.mkdirSync(path, {recursive: true})
        cb(null, path)
      },
      filename: function (req, file, cb) {
        let name: string =
          moment().format('YYYY-MM-DD-THH_mm_ss').toString() +
          '-' +
          file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

        cb(null, name.replace(/ /g, '-'))
      },
    })

    return storage
  }

  public getFile(
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) {
    try {
      let type: string = 'image'
      let filename: string = request.query.filename as string
      let format: string = request.query.format as string
      let waterMark = request.query.waterMark as string
      let quality = request.query.quality as any
      let width = request.query.width as any
      let height = request.query.height as any
      let maxWidth = request.query.maxWidth as any
      let maxHeight = request.query.maxHeight as any
      let model = request.query.model as string
      let database = request.query.database as string

      if (request.query.clientId) database = request.query.clientId as string

      if (!filename)
        throw new HttpException(new Responser(400, null, 'filename is required'))
      if (!model) throw new HttpException(new Responser(400, null, 'model is required'))
      if (!database)
        throw new HttpException(new Responser(400, null, 'clientId is required'))

      let file = `/home/clients/${database}/images/${model}/${filename}`

      if (type == 'image') {
        if (format || waterMark || quality || width || height || maxWidth || maxHeight) {
          jimp.read(file, function (err: any, image: any) {
            if (err) throw err

            if (quality) {
              quality = parseFloat(quality)
              image = image.quality(quality)
            } else {
              quality = 100
            }

            let widthOriginal = image.bitmap.width
            let heightOriginal = image.bitmap.height

            if (width) width = parseInt(width)
            if (height) height = parseInt(height)
            if (maxWidth) maxWidth = parseInt(maxWidth)
            if (maxHeight) maxHeight = parseInt(maxHeight)

            if (width && height) {
              // SI ESCIFICA ALTO Y ANCHO
              image = image.resize(width, height)
            } else if (width && !height) {
              // SI ESCIFICA ANCHO
              height = jimp.AUTO
              image = image.resize(width, height)
            } else if (!width && height) {
              // SI ESCIFICA ALTO
              width = jimp.AUTO
              image = image.resize(width, height)
            } else if (maxWidth && maxHeight) {
              // SI ESCIFICA MAX ALTO Y MAX ANCHO
              if (widthOriginal > maxWidth) {
                width = maxWidth
                height = jimp.AUTO
                image = image.resize(width, height)
                width = image.bitmap.width
                height = image.bitmap.height
                if (height > maxHeight) {
                  height = maxHeight
                  width = jimp.AUTO
                  image = image.resize(width, height)
                }
              }
            } else if (maxWidth && !maxHeight) {
              // SI ESCIFICA MAX ANCHO
              if (widthOriginal > maxWidth) {
                width = maxWidth
                height = jimp.AUTO
              }
              image = image.resize(width, height)
            } else if (!maxWidth && maxHeight) {
              // SI ESCIFICA MAX ALTO
              if (heightOriginal > maxHeight) {
                height = maxHeight
                width = jimp.AUTO
              }
              image = image.resize(width, height)
            }
            width = image.bitmap.width
            height = image.bitmap.height

            if (waterMark == 'true') {
              new jimp(
                `/home/clients/${request.database}/images/watermark.png`,
                function (err: any, imgWaterMark: any) {
                  if (err) throw err
                  if (width != jimp.AUTO) {
                    imgWaterMark = imgWaterMark
                      .opacity(0.3)
                      .resize((width / 100) * 40, jimp.AUTO) // 40% del tamaño de la imagen
                  } else if (height != jimp.AUTO) {
                    imgWaterMark = imgWaterMark
                      .opacity(0.3)
                      .resize(jimp.AUTO, (height / 100) * 40) // 40% del tamaño de la imagen
                  }

                  let xPositionWaterMark = width / 2 - imgWaterMark.bitmap.width / 2
                  let yPositionWaterMark = height / 2 - imgWaterMark.bitmap.height / 2

                  image
                    .composite(imgWaterMark, xPositionWaterMark, yPositionWaterMark)
                    .quality(quality)
                    .getBuffer(jimp.MIME_JPEG, function (err: any, buffer: any) {
                      response.set('Content-Type', jimp.MIME_JPEG)
                      response.send(new Responser(200, buffer))
                    })
                },
              )
            } else {
              if (
                quality === 100 &&
                widthOriginal === width &&
                heightOriginal === height
              ) {
                response.set('Content-Type', jimp.MIME_JPEG)
                if (format === 'base64') {
                  let bitmap = fs.readFileSync(path.resolve(file))

                  response
                    .status(200)
                    .send(new Responser(200, new Buffer(bitmap).toString('base64')))
                } else {
                  response.sendFile(path.resolve(file))
                }
              } else {
                image.getBuffer(jimp.MIME_JPEG, function (err: any, buffer: any) {
                  response.set('Content-Type', jimp.MIME_JPEG)
                  if (format === 'base64') {
                    response.send(
                      new Responser(200, {
                        properties: {
                          width: width,
                          height: height,
                        },
                        file: buffer.toString('base64'),
                      }),
                    )
                  } else {
                    response.send(buffer)
                  }
                })
              }
            }
          })
        } else {
          response.sendFile(path.resolve(file))
        }
      } else {
        response.sendFile(path.resolve(file))
      }
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  private upload = async (request: RequestWithUser, response: express.Response) => {
    response.send(new Responser(200, request.file.filename))
  }

  public deleteFile = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    const type = request.query.type
    const model = request.query.model
    const filename = request.query.filename

    try {
      let file = `/home/clients/${request.database}/${type}s/${model}/${filename}`

      fs.unlinkSync(file)
      response.send(new Responser(200, filename))
    } catch (err) {
      next(new Responser(500, null, err.message, err))
    }
  }
}
