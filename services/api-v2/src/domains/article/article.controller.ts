import * as fs from 'fs'

import * as express from 'express'
import * as moment from 'moment'
import * as multer from 'multer'
import * as xlsx from 'xlsx';

import CategoryController from '../../domains/category/category.controller'
import Category from '../../domains/category/category.interface'
import categoryModel from '../../domains/category/category.model'
import CompanyController from '../../domains/company/company.controller'
import MakeController from '../../domains/make/make.controller'
import Make from '../../domains/make/make.interface'
import makeModel from '../../domains/make/make.model'
import TaxController from '../../domains/tax/tax.controller'
import UnitOfMeasurementController from '../../domains/unit-of-measurement/unit-of-measurement.controller'
import User from '../../domains/user/user.interface'
import userModel from '../../domains/user/user.model'
import Controller from '../model/model.controller'

import HttpException from './../../exceptions/HttpException'
import RequestWithUser from './../../interfaces/requestWithUser.interface'
import Responseable from './../../interfaces/responsable.interface'
import authMiddleware from './../../middleware/auth.middleware'
import ensureLic from './../../middleware/license.middleware'
import validationMiddleware from './../../middleware/validation.middleware'
import Responser from './../../utils/responser'
import ObjDto from './article.dto'
import Article from './article.interface'
import ObjSchema from './article.model'
import ArticleUC from './article.uc'

export default class ArticleController extends Controller {
  public EJSON: any = require('bson').EJSON
  public path = ObjSchema.getPath()
  public router = express.Router()
  public obj: any

  constructor(database: string) {
    super(ObjSchema, ObjDto, database)
    this.initializeRoutes()
  }

  private initializeRoutes() {
    let upload = multer({ storage: this.getStorage() })

    this.router
      .get(this.path, [authMiddleware, ensureLic], this.getAllObjs)
      .get(`${this.path}/:id`, [authMiddleware, ensureLic], this.getObjById)
      .post(
        this.path,
        [authMiddleware, ensureLic, validationMiddleware(ObjDto)],
        this.saveObj,
      )
      .put(
        `${this.path}/:id`,
        [authMiddleware, ensureLic, validationMiddleware(ObjDto)],
        this.updateObj,
      )
      .delete(`${this.path}/:id`, [authMiddleware, ensureLic], this.deleteArticle)
      .post(
        `${this.path}/import-excel`,
        [authMiddleware, ensureLic, upload.single('file')],
        this.updateExcel,
      )
      .post(
        `${this.path}/create-article-excel`,
        [authMiddleware, ensureLic, upload.single('excel')],
        this.createArticleExcel,
      )
      .post(
        `${this.path}/update-by-structure`,
        [authMiddleware, ensureLic],
        this.updateCostByStruct,
      )
      .post(
        `${this.path}/update-price-by-query`,
        [authMiddleware, ensureLic],
        this.updatePricebyQuery,
      )
      .post(`${this.path}/update-prices`, [authMiddleware, ensureLic], this.updatePrices)
  }

  async updateArticleExcel(request: RequestWithUser, response: express.Response) {
    if (request.file.filename) {
      let json: any = []
      let route = `/home/clients/${request.database}/excel/${request.file.filename}`
      let exceltojson = require('xlsx-to-json')

      exceltojson(
        {
          input: route,
          output: null,
          lowerCaseHeaders: true,
        },
        async (err: any, rows: any) => {
          if (err) {
            json = [
              {
                status: 500,
                err: err,
                message: 'no entro al excel',
              },
            ]
          } else {
            let code: number
            let array: Array<any> = []

            // trae todo el excel
            if (rows.length > 0) {
              let codeArray: Array<any> = []
              let taxesArray: Array<any> = []
              let article: any

              // let articlesUpdate: number = 0;
              for (let i = 0; i < rows.length; i++) {
                let update: any = []
                let taxes
                let basePrice
                let markupPercentage
                let salePrice

                code = 0
                let minStock
                let maxStock
                let pointOfOrder

                // buscar por code
                if (
                  rows[i]['codigo'] == '' &&
                  rows[i]['codigo_de_barra'] == '' &&
                  rows[i]['codigo_de_proveedor'] == '' &&
                  rows[i]['punto_de_pedido'] == '' &&
                  rows[i]['precio_base'] == '' &&
                  rows[i]['margen'] == '' &&
                  rows[i]['precio_venta'] == '' &&
                  rows[i]['stock_minimo'] == '' &&
                  rows[i]['stock_maximo'] == ''
                ) {
                  codeArray.push([0, 0, 500, 'No se ingreso codigo de busca '])
                } else {
                  if (rows[i]['codigo'] != '' && rows[i]['codigo'].length != 0) {
                    article = await search_article('code', rows[i]['codigo'])
                    if (article && article.status == 200 && article.result.length > 0) {
                      code = rows[i]['codigo']
                    } else {
                      code = rows[i]['codigo']
                    }
                  } else if (
                    rows[i]['codigo_de_barra'] != '' &&
                    rows[i]['codigo_de_barra'].length != 0
                  ) {
                    article = await search_article('barcode', rows[i]['codigo_de_barra'])
                    if (article && article.status == 200 && article.result.length > 0) {
                      code = rows[i]['codigo_de_barra']
                    } else {
                      code = rows[i]['codigo_de_barra']
                    }
                  } else if (rows[i]['codigo_de_proveedor'] != '') {
                    article = await search_article(
                      'code_prov',
                      rows[i]['codigo_de_proveedor'],
                    )
                    if (article && article.status == 200 && article.result.length > 0) {
                      code = rows[i]['codigo_de_proveedor']
                    } else {
                      code = rows[i]['codigo_de_proveedor']
                    }
                  } else if (request.body.idProvider != 'null') {
                    article = await search_article('filtro_prov', '')
                    if (article && article.status == 200 && article.result.length > 0) {
                      code = rows[i]['filtro_proveedor']
                    } else {
                      // code = rows[i]["filtro_proveedor"]
                      article = { result: [], status: 500, code: null }
                    }
                  } else {
                    article = { result: [], status: 500, code: null }
                  }

                  // 	/buscar por code

                  if (article.result.length > 0 && article.status == 200) {
                    if (article.result[0].taxes != 0) {
                      taxes = article.result[0].taxes
                    } else if (article.result[0].taxes == 0) {
                      taxes = 'f'
                    }
                    // Precios
                    if (
                      rows[i]['precio_base'] != '' &&
                      rows[i]['precio_base'].length != 0 &&
                      rows[i]['precio_base'] != '0'
                    ) {
                      basePrice = rows[i]['precio_base']
                    } else {
                      basePrice = article.result[0].basePrice
                    }
                    if (
                      rows[i]['margen'] != '' &&
                      rows[i]['margen'].length != 0 &&
                      rows[i]['margen'] != '0.00'
                    ) {
                      markupPercentage = rows[i]['margen']
                    } else {
                      markupPercentage = article.result[0].markupPercentage
                    }

                    if (
                      rows[i]['precio_venta'] != '' &&
                      rows[i]['precio_venta'].length != 0 &&
                      rows[i]['precio_venta'] != '0'
                    ) {
                      salePrice = rows[i]['precio_venta']
                    } else {
                      salePrice = 0
                    }
                    // / Precios

                    // Stock min/max
                    if (
                      rows[i]['stock_minimo'] != '' &&
                      rows[i]['stock_minimo'].length != 0
                    ) {
                      minStock = rows[i]['stock_minimo']
                    } else if (rows[i]['stock_minimo'] === 0) {
                      minStock = 0
                    } else {
                      minStock = article.result[0].minStock
                    }
                    if (
                      rows[i]['stock_maximo'] != '' &&
                      rows[i]['stock_maximo'].length != 0
                    ) {
                      maxStock = rows[i]['stock_maximo']
                    } else if (rows[i]['stock_maximo'] === 0) {
                      maxStock = 0
                    } else {
                      maxStock = article.result[0].maxStock
                    }
                    // / Stock min/max

                    // pointOfOrder
                    if (
                      rows[i]['punto_de_pedido'] != '' &&
                      rows[i]['punto_de_pedido'].length != 0
                    ) {
                      pointOfOrder = rows[i]['punto_de_pedido']
                    } else if (rows[i]['punto_de_pedido'] === 0) {
                      pointOfOrder = 0
                    } else {
                      pointOfOrder = article.result[0].pointOfOrder
                    }
                    // / pointOfOrder

                    await calculate_taxes(
                      update,
                      'base',
                      basePrice,
                      markupPercentage,
                      salePrice,
                      taxes,
                      maxStock,
                      minStock,
                      pointOfOrder,
                    ).catch((err) => {
                      console.log(err)
                      taxesArray.push(
                        i + 2,
                        code,
                        500,
                        'Error al configurar los impuestos',
                      )
                    })

                    json = await updateExcel(article, update).catch((err) => {
                      console.log(err)
                      codeArray.push([
                        i + 2,
                        code,
                        500,
                        'No se encontro el articulo con el codigo',
                      ])
                    })
                    if (json && json.status == 200) {
                      // articlesUpdate += article.result.length
                      codeArray.push([i + 2, code, 200, json.message])
                    } else if (json) {
                      codeArray.push([i + 2, code, 500, json.message])
                    }
                  } else {
                    if (
                      article.result.length == 0 &&
                      article.code == null &&
                      article.status == 500
                    ) {
                      codeArray.push([i + 2, code, 500, 'No se ingreso ningun codigo'])
                    } else {
                      codeArray.push([
                        i + 2,
                        code,
                        500,
                        'No se encontro el articulo con el codigo',
                      ])
                    }
                  }
                }
              }
              for (let z = 0; z < codeArray.length; z++) {
                let element = {
                  status: codeArray[z][2],
                  message: codeArray[z][3],
                  code: codeArray[z][1],
                  filaExcel: codeArray[z][0],
                  // countArticle: articlesUpdate
                  countArticle: article.result.length,
                }

                array.push(element)
              }
            } else {
              array = [
                {
                  status: 500,
                  message: 'Ingresar filas al excel',
                  code: code,
                  filaExcel: 0,
                },
              ]
            }
            response.send(array)
          }
        },
      )
    }

    async function updateExcel(article: any, update: any) {
      return new Promise((resolve, reject) => {
        for (let index = 0; index < article.result.length; index++) {
          new ArticleController(request.database)
            .update(article.result[index]._id, update[0])
            .then(async (result: any) => {
              resolve(result)
            })
            .catch(async (err: any) => {
              reject(err)
            })
        }
      })
    }

    async function calculate_taxes(
      update: any,
      name: string,
      value: number,
      margen: number = 0,
      salePrice: number = 0,
      taxes: any = 'f',
      maxStock: number,
      minStock: number,
      pointOfOrder: number,
    ) {
      if (name === 'base') {
        let costPriceFinish: any = value
        let utilidad_con_impuestos: number = 0
        let venta_con_impuestos: number = 0

        if (taxes != 'f') {
          let costPrice: number = 0
          let utilidad_sin_impuestos: number = (Number(value) * Number(margen)) / 100
          let venta_sin_impuestos: number = utilidad_sin_impuestos + Number(value)

          taxes.forEach((e: any) => {
            e.taxBase = Number(value)
            e.taxAmount = (e.percentage * Number(value)) / 100
            costPrice = costPrice + e.taxAmount
            utilidad_con_impuestos += (utilidad_sin_impuestos * e.percentage) / 100
            venta_con_impuestos += (venta_sin_impuestos * e.percentage) / 100
          })

          costPrice = costPrice + Number(value)

          costPriceFinish = costPrice.toFixed(2)
          utilidad_con_impuestos =
            Number(utilidad_con_impuestos.toFixed(2)) + Number(utilidad_sin_impuestos)
          venta_con_impuestos =
            Number(venta_con_impuestos.toFixed(2)) + venta_sin_impuestos

          if (salePrice > 0) {
            // costPrice // costo con impuestos
            // markupPrice // utilidad con impuestos = sale price - costo con impuestos
            //  margen // Utilidad con Impuestos * 100 / Costo con Impuestos
            utilidad_con_impuestos = Number(salePrice) - costPriceFinish
            margen = (utilidad_con_impuestos * 100) / costPriceFinish
            venta_con_impuestos = Number(salePrice)
          }
          if (request.body.roundFinalPrice) {
            venta_con_impuestos = salePrice = Number(Number(salePrice).toFixed(0))
            utilidad_con_impuestos = Number(salePrice) - costPriceFinish
            margen = (utilidad_con_impuestos * 100) / costPriceFinish
          }
          update.push({
            basePrice: value,
            markupPercentage: margen,
            costPrice: costPriceFinish,
            salePrice: venta_con_impuestos,
            markupPrice: utilidad_con_impuestos,
            taxes: taxes,
            maxStock: maxStock,
            minStock: minStock,
            pointOfOrder: pointOfOrder,
          })
        } else {
          utilidad_con_impuestos = (Number(value) * margen) / 100
          venta_con_impuestos = utilidad_con_impuestos + Number(value)
          if (salePrice > 0) {
            utilidad_con_impuestos = Number(salePrice) - value
            margen = (utilidad_con_impuestos * 100) / value
            venta_con_impuestos = Number(salePrice)
          }
          if (request.body.roundFinalPrice) {
            venta_con_impuestos = salePrice = Number(venta_con_impuestos.toFixed(0))
            utilidad_con_impuestos = Number(salePrice) - costPriceFinish
            margen = (utilidad_con_impuestos * 100) / costPriceFinish
          }
          update.push({
            basePrice: value,
            markupPercentage: margen,
            costPrice: value,
            salePrice: venta_con_impuestos,
            markupPrice: utilidad_con_impuestos,
            maxStock: maxStock,
            minStock: minStock,
            pointOfOrder: pointOfOrder,
          })
        }
      }
    }
    async function search_article(select_match: string, value: string) {
      let match: any

      if (select_match == 'code') {
        match = {
          code: value,
          operationType: { $ne: 'D' },
        }
      }
      if (select_match == 'barcode') {
        match = {
          barcode: value,
          operationType: { $ne: 'D' },
        }
      }
      if (select_match == 'code_prov') {
        match = {
          codeProvider: value,
          operationType: { $ne: 'D' },
        }
      }
      if (select_match == 'prov') {
        match = {
          code: value,
          operationType: { $ne: 'D' },
        }
      }
      if (select_match == 'filtro_prov') {
        match = {
          operationType: { $ne: 'D' },
        }
      }
      if (request.body.idProvider != 'null') {
        match.provider = { $oid: request.body.idProvider }
      }

      return new Promise((resolve, reject) => {
        new ArticleController(request.database)
          .getAll({
            project: {},
            match: match,
          })
          .then((result: Responseable) => {
            resolve(result)
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
  }

  async createArticleExcel(request: RequestWithUser, response: express.Response) {
    if (request.file.filename) {
      let route = `/home/clients/${request.database}/excel/${request.file.filename}`
      let exceltojson = require('xlsx-to-json')

      exceltojson(
        {
          input: route,
          output: null,
          lowerCaseHeaders: true,
        },
        async (err: any, rows: any) => {
          if (err) {
          } else {
            let code: number = 0
            let array = []

            if (rows.length > 0) {
              let taxes
              let codeArray = []

              for (let i = 0; i < rows.length; i++) {
                code = 0
                // let article = new ObjDto();
                let article: Article = ObjSchema.getInstance(request.database)

                if (
                  rows[i]['codigo'] == '' &&
                  rows[i]['codigo_de_barra'] == '' &&
                  rows[i]['codigo_de_proveedor'] == ''
                ) {
                  // NO INGRESO NINGUN CODIGO
                  codeArray.push([i + 2, code, 500, 'No se ingreso ningun codigo'])
                } else {
                  let numb = 0

                  if (rows[i]['codigo'] != '' && rows[i]['codigo'].length != 0) {
                    let cod: number = await search_article('code', rows[i]['codigo'])

                    code += cod
                    numb += 1
                  }
                  if (
                    rows[i]['codigo_de_barra'] != '' &&
                    rows[i]['codigo_de_barra'].length != 0
                  ) {
                    let barc: number = await search_article(
                      'barcode',
                      rows[i]['codigo_de_barra'],
                    )

                    code += barc
                    numb += 1
                  }
                  if (
                    rows[i]['codigo_de_proveedor'] &&
                    rows[i]['codigo_de_proveedor'] != '' &&
                    rows[i]['codigo_de_proveedor'].length != 0
                  ) {
                    let prov: number = await search_article(
                      'code_prov',
                      rows[i]['codigo_de_proveedor'],
                    )

                    code += prov
                    numb += 1
                  }
                  if (code === 0 || code < numb) {
                    // No encontro ningun articulo - Crear
                    article.code = rows[i]['codigo']
                    article.codeProvider = rows[i]['codigo_de_proveedor']
                    article.barcode = rows[i]['codigo_de_barra']

                    // Precios
                    if (
                      rows[i]['precio_base'] != '' &&
                      rows[i]['precio_base'].length != 0 &&
                      rows[i]['precio_base'] != '0'
                    ) {
                      article.basePrice = rows[i]['precio_base']
                    } else {
                      article.basePrice = 0
                    }
                    if (
                      rows[i]['margen'] != '' &&
                      rows[i]['margen'].length != 0 &&
                      rows[i]['margen'] != '0.00'
                    ) {
                      article.markupPercentage = rows[i]['margen']
                    } else {
                      article.markupPercentage = 0
                    }
                    if (
                      rows[i]['precio_venta'] != '' &&
                      rows[i]['precio_venta'].length != 0 &&
                      rows[i]['precio_venta'] != '0'
                    ) {
                      article.salePrice = rows[i]['precio_venta']
                    } else {
                      article.salePrice = 0
                    }
                    if (rows[i]['impuesto'] != '' && rows[i]['impuesto'].length != 0) {
                      taxes = rows[i]['impuesto']
                    }
                    // / Precios

                    // Stock min/max
                    if (
                      rows[i]['stock_minimo'] != '' &&
                      rows[i]['stock_minimo'].length != 0
                    ) {
                      article.minStock = rows[i]['stock_minimo']
                    } else {
                      article.minStock = 0
                    }
                    if (
                      rows[i]['stock_maximo'] != '' &&
                      rows[i]['stock_maximo'].length != 0
                    ) {
                      article.maxStock = rows[i]['stock_maximo']
                    } else {
                      article.maxStock = 0
                    }
                    // / Stock min/max

                    // pointOfOrder
                    if (
                      rows[i]['punto_de_pedido'] != '' &&
                      rows[i]['punto_de_pedido'].length != 0
                    ) {
                      article.pointOfOrder = rows[i]['punto_de_pedido']
                    } else {
                      article.pointOfOrder = 0
                    }
                    // / pointOfOrder
                    const trueFalse: any = {
                      si: true,
                      no: false,
                    }

                    // allowPurchase
                    if (
                      rows[i]['hablitado_compra'] != '' &&
                      rows[i]['hablitado_compra'].length != 0
                    ) {
                      article.allowPurchase = trueFalse[rows[i]['hablitado_compra']]
                    }
                    // / allowPurchase
                    // allowSale
                    if (
                      rows[i]['hablitado_venta'] != '' &&
                      rows[i]['hablitado_venta'].length != 0
                    ) {
                      article.allowSale = trueFalse[rows[i]['hablitado_venta']]
                    }
                    // allowSale
                    // allowSale
                    if (
                      rows[i]['hablitado_venta'] != '' &&
                      rows[i]['hablitado_venta'].length != 0
                    ) {
                      article.allowSale = trueFalse[rows[i]['hablitado_venta']]
                    }
                    // allowSale
                    // allowStock
                    if (
                      rows[i]['hablitado_stock'] != '' &&
                      rows[i]['hablitado_stock'].length != 0
                    ) {
                      article.allowStock = trueFalse[rows[i]['hablitado_stock']]
                    }
                    // allowStock
                    // isWeigth
                    if (
                      rows[i]['es_pesable'] != '' &&
                      rows[i]['es_pesable'].length != 0
                    ) {
                      article.isWeigth = trueFalse[rows[i]['es_pesable']]
                    }
                    // isWeigth
                    // allowSaleWithoutStock
                    if (
                      rows[i]['vender_sinstock'] != '' &&
                      rows[i]['vender_sinstock'].length != 0
                    ) {
                      article.allowSaleWithoutStock =
                        trueFalse[rows[i]['vender_sinstock']]
                    }
                    // allowSaleWithoutStock

                    // TAXES Y PRICES
                    await calculate_taxes(
                      article,
                      article.basePrice,
                      article.markupPercentage,
                      article.salePrice,
                      taxes,
                      request.database,
                    )
                    if (request.body.roundFinalPrice) article.salePrice = Number(article.salePrice.toFixed(0))
                    // marca
                    if (
                      rows[i]['marca'] != '' &&
                      rows[i]['marca'].length != 0 &&
                      rows[i]['marca'] != '0.00'
                    ) {
                      let makeSearch = await make(rows[i]['marca'])

                      if (makeSearch) {
                        article.make = makeSearch._id
                      }
                    }
                    // / marca
                    // RUBRO
                    if (
                      rows[i]['rubro'] != '' &&
                      rows[i]['rubro'].length != 0 &&
                      rows[i]['rubro'] != '0.00'
                    ) {
                      let CategorySearch = await categorySearch(rows[i]['rubro'])

                      if (CategorySearch) {
                        article.category = CategorySearch._id
                      }
                    }
                    //  / RUBRO

                    // Proveedor
                    if (rows[i]['proveedor'] != '' && rows[i]['proveedor'].length != 0) {
                      let providerSearch = await searchProvider(rows[i]['proveedor'])

                      if (providerSearch) {
                        article.providers = providerSearch._id
                        article.provider = providerSearch._id
                      }
                    }
                    //  / Proveedor
                    // unidad_de _medida
                    // unitOfMeasurement
                    if (
                      rows[i]['unidad_de _medida'] != '' &&
                      rows[i]['unidad_de _medida'].length != 0 &&
                      rows[i]['unidad_de _medida'] != '0.00'
                    ) {
                      let unitSearch = await searchUnitOfMeasurement(
                        rows[i]['unidad_de _medida'],
                      )

                      if (unitSearch) {
                        article.unitOfMeasurement = unitSearch._id
                      }
                    }
                    // / unidad_de _medida

                    // / unidad_de _medida
                    if (
                      rows[i]['descripcion'] != '' &&
                      rows[i]['descripcion'].length != 0
                    ) {
                      article.description = rows[i]['descripcion']
                      article.posDescription = rows[i]['descripcion']
                    } else {
                    }
                    article.quantityPerMeasure = rows[i]['cantidad']
                    let user: User = userModel.getInstance(request.database)

                    user._id = request.user._id
                    article.creationUser = user
                    article.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
                    article.operationType = 'C'

                    // article._id = '0'
                    await new ArticleController(request.database)
                      .save(article)
                      .then(() => {
                        codeArray.push([i + 2, code, 200, 'articulo creado'])
                      })
                  } else {
                    codeArray.push([i + 2, code, 500, 'articulo existente'])
                  }
                }
              }

              for (let z = 0; z < codeArray.length; z++) {
                let element = {
                  status: codeArray[z][2],
                  message: codeArray[z][3],
                  code: codeArray[z][1],
                  filaExcel: codeArray[z][0],
                }

                array.push(element)
              }
            } else {
              array = [
                {
                  status: 500,
                  message: 'Ingresar filas al excel',
                  code: code,
                  filaExcel: 0,
                },
              ]
            }
            response.send(array)
          }
        },
      )
    }
    async function searchUnitOfMeasurement(name: string): Promise<any> {
      let match = {
        name: name,
      }

      return new Promise((resolve, reject) => {
        new UnitOfMeasurementController(request.database)
          .getAll({ match: match })
          .then(async (result) => {
            if (result.result.length > 0) {
              resolve(result.result[0])
            } else {
              resolve(null)
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
    async function searchProvider(name: string): Promise<any> {
      let match = {
        type: 'Proveedor',
        name: name,
      }

      return new Promise((resolve, reject) => {
        new CompanyController(request.database)
          .getAll({ match: match })
          .then(async (result) => {
            if (result.result.length > 0) {
              resolve(result.result[0])
            } else {
              resolve(null)
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
    async function categorySearch(params: string): Promise<any> {
      let match = {
        description: params,
      }

      return new Promise((resolve, reject) => {
        new CategoryController(request.database)
          .getAll({
            match: match,
          })
          .then(async (result) => {
            if (result.result.length > 0) {
              resolve(result.result[0])
            } else {
              await createCategory(params).then((r) => {
                resolve(r)
              })
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
    async function createCategory(name: string) {
      let category: Category = categoryModel.getInstance(request.database)

      category.description = name
      category.picture = 'default.jpg'
      category.visibleOnSale = false
      category.ecommerceEnabled = false

      let user: User = userModel.getInstance(request.database)

      user._id = request.user._id
      category.creationUser = user
      category.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
      category.operationType = 'C'

      return new Promise(async (resolve) => {
        await new CategoryController(request.database)
          .save(category)
          .then((r) => {
            if (r.status == 200) {
              resolve(r.result)
            }
          })
          .catch((e) => {
            throw e
          })
      })
    }
    async function make(make: string): Promise<any> {
      let match = {
        description: make,
      }

      return new Promise((resolve, reject) => {
        new MakeController(request.database)
          .getAll({
            match: match,
          })
          .then(async (result) => {
            if (result.result.length > 0) {
              resolve(result.result[0])
            } else {
              await createMake(make).then((r) => {
                resolve(r)
              })
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
    async function createMake(make: string): Promise<Make> {
      let makeCreate: Make = makeModel.getInstance(request.database)

      makeCreate.description = make
      makeCreate.picture = 'default.jpg'
      makeCreate.visibleSale = false
      makeCreate.ecommerceEnabled = false

      let user: User = userModel.getInstance(request.database)

      user._id = request.user._id
      makeCreate.creationUser = user
      makeCreate.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
      makeCreate.operationType = 'C'

      return new Promise(async (resolve, reject) => {
        await new MakeController(request.database)
          .save(makeCreate)
          .then((r) => {
            if (r.result._id) {
              resolve(r.result)
            } else {
              reject(null)
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
    async function search_article(select_match: string, value: string): Promise<number> {
      let match = {}

      if (select_match == 'code') {
        match = {
          code: value,
          operationType: { $ne: 'D' },
        }
      }
      if (select_match == 'barcode') {
        match = {
          barcode: value,
          operationType: { $ne: 'D' },
        }
      }
      if (select_match == 'code_prov') {
        match = {
          codeProvider: value,
          operationType: { $ne: 'D' },
        }
      }
      if (select_match == 'prov') {
        match = {
          code: value,
          operationType: { $ne: 'D' },
        }
      }

      return new Promise((resolve, reject) => {
        new ArticleController(request.database)
          .getAll({ match: match })
          .then((result: { result: string | any[] }) => {
            if (result.result.length > 0) {
              resolve(1)
            } else {
              resolve(0)
            }
          })
          .catch((err: any) => {
            reject(err)
          })
      })
    }
    async function calculate_taxes(
      article: Article,
      basePrice: number,
      margen: number,
      salePrice: number,
      taxes: number = 0,
      database: string,
    ) {
      let utilidad_sin_impuestos: number = Number(
        ((Number(basePrice) * Number(margen)) / 100).toFixed(2),
      )

      article.markupPercentage = Number(margen)
      article.basePrice = Number(basePrice)
      article.salePrice = Number(
        Number((Number(basePrice) * Number(margen)) / 100 + Number(basePrice)),
      )
      article.markupPrice = Number(utilidad_sin_impuestos)
      article.costPrice = Number(basePrice)
      if (taxes !== 0) {
        let tax = await searchTaxe(taxes, database)
        //
        if (tax) {
          article.taxes = [
            {
              percentage: Number(tax.percentage),
              taxBase: Number(Number(basePrice).toFixed(2)),
              taxAmount: Number(
                Number((Number(basePrice) * tax.percentage) / 100).toFixed(2),
              ),
              tax: tax._id,
            },
          ]

          article.markupPercentage = Number(margen)
          article.basePrice = Number(basePrice)

          let s: number = Number(
            Number((utilidad_sin_impuestos * tax.percentage) / 100).toFixed(2),
          )

          s =
            Number.parseFloat(s.toString()) +
            parseFloat(utilidad_sin_impuestos.toString())
          article.markupPrice = Number(parseFloat(s.toString()))
          article.costPrice = Number(
            Number(
              (Number(basePrice) * tax.percentage) / 100 + Number(basePrice),
            ).toFixed(2),
          )
          article.salePrice = Number(
            (
              parseFloat(article.markupPrice.toString()) +
              parseFloat(article.costPrice.toString())
            ).toFixed(2),
          )
        }
        if (margen > 0) {
          article.markupPercentage = margen
        }
        if (basePrice > 0) {
          article.basePrice = basePrice
        }
        if (salePrice > 0) {
          article.salePrice = salePrice
        }

        return article
      }
    }
    async function searchTaxe(params: number, database: string): Promise<any> {
      let match = {
        percentage: Number(params),
      }

      return new Promise((resolve, reject) => {
        new TaxController(database)
          .getAll({
            match: match,
          })
          .then((result) => {
            if (result.result.length > 0) {
              resolve(result.result[0])
            } else {
              resolve(null)
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
  }

  getStorage(): multer.StorageEngine {
    let storage = multer.diskStorage({
      destination: function (request: RequestWithUser, file, cb) {
        try {
          let path = '/home/clients/'

          if (request.database) {
            path += `${request.database}/excel`
          }
          fs.mkdirSync(path, { recursive: true })
          cb(null, path)
        } catch (err) {
          cb(err, null)
        }
      },
      filename: function (req, file, cb) {
        try {
          let name: string =
            moment().format('YYYY-MM-DD-THH_mm_ss').toString() +
            '-' +
            file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, '.xlsx')

          cb(null, name.replace(/ /g, '-'))
        } catch (err) {
          cb(err, null)
        }
      },
    })

    return storage
  }

  updateCostByStruct = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const result = await new ArticleUC(
        request.database,
        request.headers.authorization,
      ).updateCostByStruct()

      response.send(new Responser(200, result))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }
  //test
  updatePrices = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user

      const result = await new ArticleUC(
        request.database,
        request.headers.authorization,
      ).recalculatePrices(
        request.body.articlesCode,
        request.body.field,
        request.body.decimal,
        request.body.percentage,
      )

      response.send(new Responser(200, result))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  updatePricebyQuery = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    this.userAudit = request.user

    const make = request.body.make
    const category = request.body.category
    const articlesCode: string[] = []

    let match: any = {}

    if (make) match['make'] = { $oid: make }
    if (category) match['category'] = { $oid: category }
    match['operationType'] = { $ne: 'D' }

    await new ArticleController(request.database)
      .getAll({
        project: {
          code: 1,
          operationType: 1,
          make: 1,
          category: 1,
        },
        match: match,
      })
      .then(
        async (result) => {
          if (result.status === 200) {
            result.result.forEach(async (element: Article) => {
              articlesCode.push(element.code)
            })

            const resultPrice = await new ArticleUC(
              request.database,
              request.headers.authorization,
            ).recalculatePrices(
              articlesCode,
              request.body.field,
              request.body.decimal,
              request.body.percentage,
            )

            response.send(new Responser(200, resultPrice))
          } else {
            new HttpException(
              new Responser(result.status, null, result.message, result.error),
            )
          }
        },
        (error) => {
          new HttpException(
            new Responser(error.status || 500, null, error.message, error),
          )
        },
      )
  }

  deleteArticle = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const id = request.params.id

      await new ArticleUC(request.database, request.headers.authorization).deleteArticle(id)

      response.send(new Responser(200))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  updateExcel = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user

      const file = request.file;
      if (!file) {
        throw new Error('No se ha proporcionado ningún archivo.');
      }

      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      //   const data = xlsx.utils.sheet_to_json(worksheet);
      const range = xlsx.utils.decode_range(worksheet['!ref']);
      const data = [];

      for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
        let hasData = false;
        const rowData: any = {};
        for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
          const cellAddress = xlsx.utils.encode_cell({ r: rowNum, c: colNum });
          const cell = worksheet[cellAddress];
          const value = cell && cell.v !== undefined ? String(cell.v) : '';
          rowData[`column${colNum + 1}`] = value;
          if (value.trim() !== '') {
            hasData = true;
          }
        }
        if (hasData) {
          data.push(rowData);
        }
      }

      const res = await new ArticleUC(request.database).importFromExcel(data)

      response.send(new Responser(200, res))
    } catch (error) {
      console.log(error)
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }
}
