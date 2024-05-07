/* eslint-disable max-len */
'use strict'

const fs = require('fs')
const path = require('path')
const fileController = require('./file.controller')
const HistoryController = require('./history.controller')
const constants = require('./../utilities/constants')
const { EJSON } = require('bson')
const axios = require('axios').default
const config = require('./../config')

const moment = require('moment')
moment.locale('es')

const VariantController = require('./variant.controller')

let Article
let Make
let Category
let User
let MovementOfArticle
let UnitOfMeasurement
let Currency
let Tax
let Deposit
let Location
let Company
let ArticleField
let Branch
let Application
let Account

function getArticle (req, res, next, id = undefined) {
  initConnectionDB(req.session.database)

  let articleId
  if (id) {
    articleId = id
  } else {
    articleId = req.query.id
  }

  Article.findById(articleId, (err, article) => {
    if (err) {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(constants.ERR_SERVER)
    } else {
      if (!article || article.operationType === 'D') {
        fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND)
        return res.status(404).send(constants.NO_DATA_FOUND)
      } else {
        fileController.writeLog(req, res, next, 200, article)
        return res.status(200).send({ article })
      }
    }
  }).populate({
    path: 'make',
    model: Make,
  }).populate({
    path: 'category',
    model: Category,
    populate: [{
      path: 'parent',
      model: Category,
    }],
  }).populate({
    path: 'unitOfMeasurement',
    model: UnitOfMeasurement,
  }).populate({
    path: 'currency',
    model: Currency,
  }).populate({
    path: 'otherFields.articleField',
    model: ArticleField,
  }).populate({
    path: 'taxes.tax',
    model: Tax,
  }).populate({
    path: 'deposit',
    model: Deposit,
  }).populate({
    path: 'location',
    model: Location,
  }).populate({
    path: 'providers',
    model: Company,
  }).populate({
    path: 'provider',
    model: Company,
  }).populate({
    path: 'deposits.deposit',
    model: Deposit,
    populate: [{
      path: 'branch',
      model: Branch,
    }],
  }).populate({
    path: 'locations.location',
    model: Location,
  }).populate({
    path: 'applications',
    model: Application,
  }).populate({
    path: 'children.article',
    model: Article,
  }).populate({
    path: 'creationUser',
    model: User,
  }).populate({
    path: 'updateUser',
    model: User,
  }).populate({
    path: 'salesAccount',
    model: Account,
  }).populate({
    path: 'purchaseAccount',
    model: Account,
  })
}

function getAsync (req, res, next, id = undefined) {
  return new Promise((resolve, reject) => {
    initConnectionDB(req.session.database)

    let articleId
    if (id) {
      articleId = id
    } else {
      articleId = req.query.id
    }

    Article.findById(articleId, (err, article) => {
      if (err) {
        reject(err)
      } else {
        if (!article || article.operationType === 'D') {
          resolve({ message: constants.NO_DATA_FOUND })
        } else {
          resolve({ article })
        }
      }
    }).populate({
      path: 'make',
      model: Make,
    }).populate({
      path: 'category',
      model: Category,
      populate: [{
        path: 'parent',
        model: Category,
      }],
    }).populate({
      path: 'unitOfMeasurement',
      model: UnitOfMeasurement,
    }).populate({
      path: 'currency',
      model: Currency,
    }).populate({
      path: 'otherFields.articleField',
      model: ArticleField,
    }).populate({
      path: 'taxes.tax',
      model: Tax,
    }).populate({
      path: 'deposit',
      model: Deposit,
    }).populate({
      path: 'location',
      model: Location,
    }).populate({
      path: 'providers',
      model: Company,
    }).populate({
      path: 'provider',
      model: Company,
    }).populate({
      path: 'creationUser',
      model: User,
    }).populate({
      path: 'updateUser',
      model: User,
    }).populate({
      path: 'salesAccount',
      model: Account,
    }).populate({
      path: 'purchaseAccount',
      model: Account,
    })
  })
}

function getArticles (req, res, next) {
  initConnectionDB(req.session.database)

  let where = JSON.parse('{"operationType": {"$ne": "D"}}')
  let limit = 0
  let select = ''
  let sort = ''
  let skip = 0
  let error

  if (req.query.query !== undefined) {
    req.query.query.split('&').forEach(function (part) {
      const item = part.split('=')
      let json
      switch (item[0]) {
        case 'where':
          json = '{"$and":[{"operationType": {"$ne": "D"}},'
          json += '{' + item[1] + '}]}'
          try {
            where = JSON.parse(json)
          } catch (err) {
            fileController.writeLog(req, res, next, 500, json)
            error = err
          }
          break
        case 'limit':
          try {
            limit = parseInt(item[1])
          } catch (err) {
            error = err
          }
          break
        case 'select':
          try {
            select = item[1].replace(/,/g, ' ')
          } catch (err) {
            error = err
          }
          break
        case 'sort':
          json = '{' + item[1] + '}'
          try {
            sort = JSON.parse(json)
          } catch (err) {
            error = err
          }
          break
        case 'skip':
          try {
            skip = parseInt(item[1])
          } catch (err) {
            error = err
          }
          break
        default:
      }
    })
  }

  if (error) {
    fileController.writeLog(req, res, next, 500, error)
    return res.status(500).send(constants.ERR_SERVER)
  }

  Article.find(where)
    .limit(limit)
    .select(select)
    .sort(sort)
    .skip(skip)
    .populate({
      path: 'make',
      model: Make,
    }).populate({
      path: 'category',
      model: Category,
    }).populate({
      path: 'unitOfMeasurement',
      model: UnitOfMeasurement,
    }).populate({
      path: 'currency',
      model: Currency,
    }).populate({
      path: 'otherFields.articleField',
      model: ArticleField,
    }).populate({
      path: 'taxes.tax',
      model: Tax,
    }).populate({
      path: 'deposit',
      model: Deposit,
    }).populate({
      path: 'location',
      model: Location,
    }).populate({
      path: 'providers',
      model: Company,
    }).populate({
      path: 'provider',
      model: Company,
    }).populate({
      path: 'creationUser',
      model: User,
    }).populate({
      path: 'updateUser',
      model: User,
    }).populate({
      path: 'salesAccount',
      model: Account,
    }).populate({
      path: 'purchaseAccount',
      model: Account,
    })
    .exec((err, articles) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        if (!articles || articles.length === 0) {
          fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND)
          return res.status(200).send({ message: constants.NO_DATA_FOUND })
        } else {
          fileController.writeLog(req, res, next, 200, articles.length)
          return res.status(200).send({ articles })
        }
      }
    })
}

function getArticlesV2 (req, res, next) {
  initConnectionDB(req.session.database)

  let queryAggregate = []
  let group

  if (req.query && req.query !== {}) {
    let error

    let project = req.query.project
    if (project && project !== {} && project !== '{}') {
      try {
        project = JSON.parse(project)

        if (JSON.stringify(project).includes('taxes')) {
          queryAggregate.push(
            {
              $lookup: {
                from: 'taxes',
                localField: 'taxes.tax',
                foreignField: '_id',
                as: 'taxDetails',
              },
            },
            {
              $addFields: {
                taxes: {
                  $map: {
                    input: '$taxes',
                    as: 't',
                    in: {
                      $mergeObjects: [
                        '$$t',
                        {
                          tax: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$taxDetails',
                                  as: 'td',
                                  cond: {
                                    $eq: ['$$td._id', '$$t.tax'],
                                  },
                                },
                              }, 0,
                            ],
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          )
        }

        if (JSON.stringify(project).includes('otherFields')) {
          queryAggregate.push(
            {
              $lookup: {
                from: 'article-fields',
                localField: 'otherFields.articleField',
                foreignField: '_id',
                as: 'articleFieldDetails',
              },
            },
            {
              $addFields: {
                otherFields: {
                  $map: {
                    input: '$otherFields',
                    as: 'o',
                    in: {
                      $mergeObjects: [
                        '$$o',
                        {
                          articleField: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$articleFieldDetails',
                                  as: 'od',
                                  cond: {
                                    $eq: ['$$od._id', '$$o.articleField'],
                                  },
                                },
                              }, 0,
                            ],
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          )
        }

        if (searchPropertyOfArray(project, 'make.')) {
          queryAggregate.push({ $lookup: { from: 'makes', foreignField: '_id', localField: 'make', as: 'make' } })
          queryAggregate.push({ $unwind: { path: '$make', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'category.')) {
          queryAggregate.push({ $lookup: { from: 'categories', foreignField: '_id', localField: 'category', as: 'category' } })
          queryAggregate.push({ $unwind: { path: '$category', preserveNullAndEmptyArrays: true } })

          if (searchPropertyOfArray(project, 'category.parent')) {
            queryAggregate.push({ $lookup: { from: 'categories', foreignField: '_id', localField: 'category.parent', as: 'category.parent' } })
            queryAggregate.push({ $unwind: { path: '$category.parent', preserveNullAndEmptyArrays: true } })
          }
        }

        if (searchPropertyOfArray(project, 'unitOfMeasurement.')) {
          queryAggregate.push({ $lookup: { from: 'units-of-measurements', foreignField: '_id', localField: 'unitOfMeasurement', as: 'unitOfMeasurement' } })
          queryAggregate.push({ $unwind: { path: '$unitOfMeasurement', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'deposits')) {
          queryAggregate.push({
            $lookup: {
              from: 'deposits',
              let: { pid: '$deposits.deposit' },
              pipeline: [
                { $match: { $expr: { $in: ['$_id', '$$pid'] } } },
              ],
              as: 'deposits',
            },
          })
        }

        if (searchPropertyOfArray(project, 'applications.') || searchPropertyOfArray(project, 'applicationsName')) {
          queryAggregate.push({ $lookup: { from: 'applications', foreignField: '_id', localField: 'applications', as: 'applications' } })
        }

        if (searchPropertyOfArray(project, 'providers.') || searchPropertyOfArray(project, 'providersName')) {
          queryAggregate.push({ $lookup: { from: 'companies', foreignField: '_id', localField: 'providers', as: 'providers' } })
        }
        if (searchPropertyOfArray(project, 'provider.') || searchPropertyOfArray(project, 'providerName')) {
          queryAggregate.push({ $lookup: { from: 'companies', foreignField: '_id', localField: 'provider', as: 'provider' } })
        }

        if (searchPropertyOfArray(project, 'locations')) {
          queryAggregate.push({
            $lookup: {
              from: 'locations',
              let: { pid: '$locations._id' },
              pipeline: [
                { $match: { $expr: { $in: ['$_id', '$$pid'] } } },
              ],
              as: 'locations',
            },
          })
        }

        if (searchPropertyOfArray(project, 'currency.')) {
          queryAggregate.push({ $lookup: { from: 'currencies', foreignField: '_id', localField: 'currency', as: 'currency' } })
          queryAggregate.push({ $unwind: { path: '$currency', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'creationUser.')) {
          queryAggregate.push({ $lookup: { from: 'users', foreignField: '_id', localField: 'creationUser', as: 'creationUser' } })
          queryAggregate.push({ $unwind: { path: '$creationUser', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'updateUser.')) {
          queryAggregate.push({ $lookup: { from: 'users', foreignField: '_id', localField: 'updateUser', as: 'updateUser' } })
          queryAggregate.push({ $unwind: { path: '$updateUser', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'salesAccount.')) {
          queryAggregate.push({ $lookup: { from: 'accounts', foreignField: '_id', localField: 'salesAccount', as: 'salesAccount' } })
          queryAggregate.push({ $unwind: { path: '$salesAccount', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'purchaseAccount.')) {
          queryAggregate.push({ $lookup: { from: 'accounts', foreignField: '_id', localField: 'purchaseAccount', as: 'purchaseAccount' } })
          queryAggregate.push({ $unwind: { path: '$purchaseAccount', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'harticle.')) {
          queryAggregate.push({ $lookup: { from: 'articles', foreignField: '_id', localField: 'harticle', as: 'harticle' } })
          queryAggregate.push({ $unwind: { path: '$harticle', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'variants')) {
          queryAggregate.push({
            $lookup: {
              from: 'variants',
              let: { pid: '$_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$articleParent', '$$pid'] }, operationType: { $ne: 'D' } } },
                {
                  $lookup: {
                    from: 'variant-types',
                    let: { pid: '$type' },
                    pipeline: [
                      { $match: { $expr: { $eq: ['$_id', '$$pid'] }, operationType: { $ne: 'D' } } },
                    ],
                    as: 'type',
                  },
                }, { $unwind: { path: '$type', preserveNullAndEmptyArrays: true } },
                {
                  $lookup: {
                    from: 'variant-values',
                    let: { pid: '$value' },
                    pipeline: [
                      { $match: { $expr: { $eq: ['$_id', '$$pid'] }, operationType: { $ne: 'D' } } },
                    ],
                    as: 'value',
                  },
                }, { $unwind: { path: '$value', preserveNullAndEmptyArrays: true } },
              ],
              as: 'variants',
            },
          })
        }

        if (searchPropertyOfArray(project, 'articleParent')) {
          queryAggregate.push({
            $lookup: {
              from: 'variants',
              let: { pid: '$_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$articleChild', '$$pid'] } } },
                { $project: { _id: '$articleParent' } },
              ],
              as: 'articleParent',
            },
          })
          queryAggregate.push({ $unwind: { path: '$articleParent', preserveNullAndEmptyArrays: true } })
          queryAggregate.push({ $lookup: { from: 'articles', foreignField: '_id', localField: 'articleParent._id', as: 'articleParent' } })
          queryAggregate.push({ $unwind: { path: '$articleParent', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'priceLists')) {
          queryAggregate.push(
            {
              $lookup: {
                from: 'price-lists',
                let: {},
                pipeline: [{
                  $match: {
                    operationType: { $ne: 'D' },
                  },
                }],
                as: 'priceLists',
              },
            },
          )
        }

        if (searchPropertyOfArray(project, 'articleStocks.')) {
          queryAggregate.push({ $lookup: { from: 'article-stocks', foreignField: 'article', localField: '_id', as: 'articleStocks' } })
        }

        const sort = req.query.sort
        if (sort && sort !== {} && sort !== '{}') {
          try {
            queryAggregate.push({ $sort: JSON.parse(sort) })
          } catch (err) {
            error = err
          }
        }

        queryAggregate.push({ $project: project })
      } catch (err) {
        error = err
      }
    } else {
      const sort = req.query.sort
      if (sort && sort !== {} && sort !== '{}') {
        try {
          queryAggregate.push({ $sort: JSON.parse(sort) })
        } catch (err) {
          error = err
        }
      }
    }

    const match = req.query.match
    if (match && match !== '{}' && match !== {}) {
      try {
        queryAggregate.push({ $match: JSON.parse(match) })
      } catch (err) {
        error = err
      }
    }

    group = req.query.group
    if (group && group !== '{}' && group !== {}) {
      try {
        queryAggregate.push({ $group: JSON.parse(group) })
      } catch (err) {
        error = err
      }
    }

    let limit = req.query.limit
    let skip = req.query.skip
    if (limit) {
      try {
        limit = parseInt(limit)
        if (limit > 0) {
          if (skip) {
            skip = parseInt(skip)
          } else {
            skip = 0
          }
          if (group && group !== '{}' && group !== {}) {
            let projectGroup
            if (searchPropertyOfArray(JSON.parse(group), 'articles')) {
              projectGroup = `{ "articles": { "$slice": ["$articles", ${skip}, ${limit}] }`
            } else {
              projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`
            }
            for (const prop of Object.keys(JSON.parse(group))) {
              if (prop !== 'articles' && prop !== 'items') {
                projectGroup += `, "${prop}": 1`
              }
            }
            projectGroup += '}'
            queryAggregate.push({ $project: JSON.parse(projectGroup) })
          } else {
            queryAggregate.push({ $limit: limit })
            queryAggregate.push({ $skip: skip })
          }
        }
      } catch (err) {
        error = err
      }
    }

    if (error) {
      fileController.writeLog(req, res, next, 500, error)
      return res.status(500).send(error)
    }
  }

  queryAggregate = EJSON.parse(JSON.stringify(queryAggregate))

  Article.aggregate(queryAggregate)
    .allowDiskUse(true)
    .then(function (result) {
      fileController.writeLog(req, res, next, 200, result.length)
      if (result.length > 0) {
        if (group && group !== '{}' && group !== {}) {
          return res.status(200).send(result)
        } else {
          return res.status(200).send({ articles: result })
        }
      } else {
        if (group && group !== '{}' && group !== {}) {
          return res.status(200).send({ count: 0, articles: [] })
        } else {
          return res.status(200).send({ articles: [] })
        }
      }
    }).catch(err => {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(err)
    })
}

function searchPropertyOfArray (array, value) {
  let n = false
  for (const a of Object.keys(array)) { if (!n) n = a.includes(value) }
  return n
}

async function saveArticle (req, res, next) {
  initConnectionDB(req.session.database)

  let isValid = true
  const article = new Article()

  const params = req.body.article
  const variants = req.body.variants
  article.order = params.order
  article.type = params.type
  article.containsVariants = params.containsVariants
  article.containsStructure = params.containsStructure
  article.code = params.code
  article.codeSAT = params.codeSAT
  article.description = params.description
  article.posDescription = params.posDescription
  article.unitOfMeasurement = params.unitOfMeasurement
  article.quantityPerMeasure = params.quantityPerMeasure
  article.observation = params.observation
  article.notes = params.notes
  article.otherFields = params.otherFields
  article.basePrice = params.basePrice
  article.taxes = params.taxes
  article.costPrice = params.costPrice
  article.markupPercentage = params.markupPercentage
  article.markupPrice = params.markupPrice
  article.salePrice = params.salePrice
  article.currency = params.currency
  article.make = params.make
  article.deposits = params.deposits
  article.locations = params.locations
  article.category = params.category
  article.barcode = params.barcode
  article.printIn = params.printIn
  article.posKitchen = params.posKitchen
  article.favourite = params.favourite
  article.allowPurchase = params.allowPurchase
  article.allowSale = params.allowSale
  article.allowSaleWithoutStock = params.allowSaleWithoutStock
  article.isWeigth = params.isWeigth
  article.allowMeasure = params.allowMeasure
  article.ecommerceEnabled = params.ecommerceEnabled
  article.providers = params.provider
  article.provider = params.provider
  article.classification = params.classification
  article.pictures = params.pictures
  article.picture = params.picture
  article.tags = params.tags
  article.url = params.url
  article.applications = params.applications
  article.defaultForShipping = params.defaultForShipping
  article.minStock = params.minStock
  article.maxStock = params.maxStock
  article.pointOfOrder = params.pointOfOrder
  article.salesAccount = params.salesAccount
  article.purchaseAccount = params.purchaseAccount
  article.allowStock = params.allowStock
  article.codeProvider = params.codeProvider
  article.purchasePrice = params.purchasePrice
  article.meliId = params.meliId
  article.meliAttrs = params.meliAttrs
  article.m3 = params.m3
  article.weight = params.weight
  article.width = params.width
  article.height = params.height
  article.depth = params.depth
  article.showMenu = params.showMenu
  const user = new User()
  user._id = req.session.user
  article.creationUser = user
  article.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
  article.operationType = 'C'
  if (!article.code) {
    isValid = false
    const message = 'Debe completar el campo código'
    return res.status(200).send({ message })
  }
  if (!article.type) {
    isValid = false
    const message = 'Debe completar el campo tipo'
    return res.status(200).send({ message })
  }
  if (!article.description) {
    isValid = false
    const message = 'Debe completar el campo descripción'
    return res.status(200).send({ message })
  }
  if (article.salePrice === undefined || article.salePrice === null) {
    isValid = false
    const message = 'Debe completar el campo precio de venta'
    return res.status(200).send({ message })
  }
  if (!article.category) {
    isValid = false
    const message = 'Debe completar el campo categoría'
    return res.status(200).send({ message })
  }

  if (isValid) {
    if (article.type === 'Final') {
      let json = '{"$and":[{"operationType": {"$ne": "D"}},'
      json = json + '{"type": "' + article.type + '"},'
      if (article.barcode && article.barcode !== '') {
        json = json + '{"$or":[{"code": "' + article.code + '"},'
        json = json + '{"barcode": "' + article.barcode + '"}]}]}'
      } else {
        json = json + '{"code": "' + article.code + '"}]}'
      }
      let where
      try {
        where = JSON.parse(json)
      } catch (err) {
        fileController.writeLog(req, res, next, 500, json)
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      }

      Article.find(where).exec(async (err, articles) => {
        if (err) {
          fileController.writeLog(req, res, next, 500, err)
          return res.status(500).send(constants.ERR_SERVER)
        } else {
          if (!articles || articles.length === 0) {
            article.save(async (err, articleSaved) => {
              if (err) {
                fileController.writeLog(req, res, next, 500, err)
                return res.status(500).send(constants.ERR_SERVER)
              } else {
                HistoryController.saveAsync(
                  req.session.database,
                  req.session.user,
                  'article',
                  articleSaved,
                )
                if (articleSaved.containsVariants && variants.length > 0) {
                  // CAPTURAMOS TODOS LOS TIPO DE VARIANTES
                  const variantTypes = []
                  for (const v of variants) {
                    if (getDuplicateTypes(v.type._id, variantTypes) === 0) {
                      variantTypes.push(v.type)
                    }
                  }
                  // CAPTURAMOS CUANTAS VARIANTES HAY POR TIPO
                  let count = 1
                  for (const vt of variantTypes) {
                    const variantsByType = getVariantsByType(vt._id, variants)
                    count *= variantsByType.length
                  }

                  const variantsStored = []
                  for (let i = 0; i < count; i++) {
                    let exists = false
                    let raffledVariants = []
                    do {
                      for (const vt of variantTypes) {
                        const variantByType = getVariantByType(vt, variants)
                        raffledVariants.push(variantByType)
                      }

                      if (variantsExists(variantsStored, raffledVariants, variantTypes)) {
                        exists = true
                        raffledVariants = []
                      } else {
                        exists = false
                        const result = await saveArticleVariant(
                          req,
                          res,
                          next,
                          articleSaved,
                          raffledVariants,
                        )
                        if (result.err) {
                          fileController.writeLog(req, res, next, 500, err)
                          return res.status(500).send(constants.ERR_SERVER)
                        } else if (result.message) {
                          fileController.writeLog(req, res, next, 200, result.message)
                          return res.status(200).send({ message: result.message })
                        } else {
                          const articleChild = result.article
                          for (const v of raffledVariants) {
                            v.articleParent = articleSaved
                            v.articleChild = articleChild
                            const result = await VariantController.saveVariant(
                              req,
                              res,
                              next,
                              v,
                            )
                            if (result.err) {
                              fileController.writeLog(req, res, next, 500, err)
                              return res.status(500).send(constants.ERR_SERVER)
                            } else if (result.message) {
                              fileController.writeLog(req, res, next, 200, result.message)
                              return res.status(200).send({ message: result.message })
                            }
                          }
                          variantsStored.push(raffledVariants)
                        }
                      }
                    } while (exists)
                  }
                  getArticle(req, res, next, articleSaved._id)
                } else {
                  // SYNC WOO
                  if (articleSaved && articleSaved.ecommerceEnabled) {
                    axios.post(
                      `${config.BASE_URL_V8}/woo/sync-article/${articleSaved._id}`,
                      {},
                      { headers: { Authorization: req.headers.authorization } },
                    )
                  }
                  getArticle(req, res, next, articleSaved._id)
                }
              }
            })
          } else {
            let message = ''
            if (article.barcode && article.barcode !== '') {
              message = 'El producto con Código Interno "' + article.code + '" o Código de Barras "' + article.barcode + '"  ya existe.'
            } else {
              message = 'El producto con Código Interno "' + article.code + '" ya existe.'
            }
            fileController.writeLog(req, res, next, 200, message)
            return res.status(200).send({ message })
          }
        }
      })
    } else {
      article.save((err, articleSaved) => {
        if (err) {
          fileController.writeLog(req, res, next, 500, err)
          return res.status(500).send(constants.ERR_SERVER)
        } else {
          HistoryController.saveAsync(
            req.session.database,
            req.session.user,
            'article',
            articleSaved,
          )
          // SYNC WOO
          if (articleSaved && articleSaved.ecommerceEnabled) {
            axios.post(
                            `${config.BASE_URL_V8}/woo/sync-article/${articleSaved._id}`,
                            {},
                            { headers: { Authorization: req.headers.authorization } },
            )
              .then(function (response) {
                if (response.status === 200) {
                  getArticle(req, res, next, articleSaved._id)
                } else {
                  return res.status(response.status).send(response)
                }
              })
              .catch(function (error) {
                return res
                  .status(500).send({
                    message: (error.response && error.response.data)
                      ? error.response.data.message
                      : error.message,
                  })
              })
          }
        }
      })
    }
  }
}

function variantsExists (variantsStored, raffledVariants, variantTypes) {
  let exists = false

  if (variantsStored && variantsStored.length > 0) {
    for (let i = 0; i < variantsStored.length; i++) {
      let equals = 0
      if (!exists) {
        for (let j = 0; j < raffledVariants.length; j++) {
          for (let k = 0; k < variantsStored[i].length; k++) {
            if (
              raffledVariants[j].type._id.toString() ===
              variantsStored[i][k].type._id.toString()
            ) {
              if (
                raffledVariants[j].value._id.toString() ===
                variantsStored[i][k].value._id.toString()
              ) {
                equals++
              }
            }
          }
        }
      }
      if (variantTypes && equals === variantTypes.length) {
        exists = true
      }
      equals = 0
    }
  }
  return exists
}

function getVariantByType (variantType, variants) {
  let variant

  do {
    const random = Math.round(Math.random() * ((variants.length - 1) - 0) + 0)
    variant = variants[random]
  } while (variant && variant.type && variant.type._id.toString() !== variantType._id.toString())

  return variant
}

function getVariantsByType (typeId, variants) {
  const variantsByType = []

  if (variants && variants.length > 0) {
    for (let index = 0; index < variants.length; index++) {
      if (variants[index].type && variants[index].type._id) {
        if (typeId.toString() === variants[index].type._id.toString()) {
          variantsByType.push(variants[index])
        }
      }
    }
  }

  return variantsByType
}

function getUniqueVariants (variants) {
  const variantsToReturn = []

  for (const variant of variants) {
    if (variantsToReturn && variantsToReturn.length > 0) {
      let exists = false
      for (const variantAux of variantsToReturn) {
        if (variantAux.value._id.toString() === variant.value._id.toString()) {
          exists = true
        }
      }
      if (!exists) {
        variantsToReturn.push(variant)
      }
    } else {
      variantsToReturn.push(variant)
    }
  }

  return variantsToReturn
}

function getDuplicateTypes (typeId, variantTypes) {
  let cant = 0

  if (variantTypes && variantTypes.length > 0) {
    for (let index = 0; index < variantTypes.length; index++) {
      if (typeId.toString() === variantTypes[index]._id.toString()) {
        cant++
      }
    }
  }

  return cant
}

function saveArticleVariant (req, res, next, articleParent, variants) {
  return new Promise((resolve, reject) => {
    initConnectionDB(req.session.database)

    let isValid = true
    const article = new Article()

    const params = articleParent

    article.description = params.description
    for (let i = 0; i < variants.length; i++) {
      article.description += ' ' + variants[i].value.description
      if (variants[i + 1]) {
        article.description += ' / '
      }
    }

    article.type = 'Variante'
    article.containsVariants = false
    article.code = params.code
    article.codeSAT = params.codeSAT
    article.posDescription = params.posDescription
    article.quantityPerMeasure = params.quantityPerMeasure
    article.unitOfMeasurement = params.unitOfMeasurement
    article.observation = params.observation
    article.notes = params.notes
    article.otherFields = params.otherFields
    article.basePrice = params.basePrice
    article.taxes = params.taxes
    article.costPrice = params.costPrice
    article.markupPercentage = params.markupPercentage
    article.markupPrice = params.markupPrice
    article.salePrice = params.salePrice
    article.currency = params.currency
    article.make = params.make
    article.deposit = params.deposit
    article.location = params.location
    article.category = params.category
    article.barcode = params.barcode
    article.printIn = params.printIn
    article.favourite = params.favourite
    article.allowPurchase = params.allowPurchase
    article.allowSale = params.allowSale
    article.allowSaleWithoutStock = params.allowSaleWithoutStock
    article.isWeigth = params.isWeigth
    article.allowMeasure = params.allowMeasure
    article.ecommerceEnabled = params.ecommerceEnabled
    article.salesAccount = params.salesAccount
    article.purchaseAccount = params.purchaseAccount
    article.meliId = params.meliId
    article.meliAttrs = params.meliAttrs
    article.m3 = params.m3
    const user = new User()
    user._id = req.session.user
    article.creationUser = user
    article.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
    article.operationType = 'C'

    if (!article.code) {
      isValid = false
      const message = 'Debe completar el campo código'
      resolve({ message })
    }
    if (!article.type) {
      isValid = false
      const message = 'Debe completar el campo tipo'
      resolve({ message })
    }
    if (!article.description) {
      isValid = false
      const message = 'Debe completar el campo descripción'
      resolve({ message })
    }
    if (article.salePrice === undefined || article.salePrice === null) {
      isValid = false
      const message = 'Debe completar el campo precio de venta'
      resolve({ message })
    }
    if (!article.category) {
      isValid = false
      const message = 'Debe completar el campo categoría'
      resolve({ message })
    }

    if (isValid) {
      article.save((err, articleSaved) => {
        if (err) {
          reject(err)
        } else {
          HistoryController.saveAsync(
            req.session.database,
            req.session.user,
            'article',
            articleSaved,
          )
          resolve({ article: articleSaved })
        }
      })
    }
  })
}

async function updateArticle (req, res, next) {
  initConnectionDB(req.session.database)
  let isValid = true
  const articleId = req.query.id
  const article = req.body.article
  const variants = req.body.variants

  const user = new User()
  user._id = req.session.user
  article.updateUser = user
  article.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
  article.operationType = 'U'

  if (!article.code) {
    isValid = false
    const message = 'Debe completar el campo código'
    return res.status(200).send({ message })
  }
  if (!article.type) {
    isValid = false
    const message = 'Debe completar el campo tipo'
    return res.status(200).send({ message })
  }
  if (!article.description) {
    isValid = false
    const message = 'Debe completar el campo descripción'
    return res.status(200).send({ message })
  }
  if (article.salePrice === undefined || article.salePrice === null) {
    isValid = false
    const message = 'Debe completar el campo precio de venta'
    return res.status(200).send({ message })
  }
  if (!article.category) {
    isValid = false
    const message = 'Debe completar el campo categoría'
    return res.status(200).send({ message })
  }

  if (isValid) {
    if (article.type === 'Final') {
      let json = '{"$and":[{"operationType": {"$ne": "D"}},'
      json = json + '{"type": "' + article.type + '"},'
      if (article.barcode && article.barcode !== '') {
        json = json + '{"$or":[{"code": "' + article.code + '"},'
        json = json + '{"barcode": "' + article.barcode + '"}]},'
      } else {
        json = json + '{"code": "' + article.code + '"},'
      }
      json = json + '{"_id": {"$ne": "' + articleId + '"}}]}'

      let where
      try {
        where = JSON.parse(json)
      } catch (err) {
        fileController.writeLog(req, res, next, 500, json)
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      }

      Article.find(where).exec(async (err, articles) => {
        if (err) {
          fileController.writeLog(req, res, next, 500, err)
          return res.status(500).send(constants.ERR_SERVER)
        } else {
          if (!articles || articles.length === 0) {
            Article.findByIdAndUpdate(
              articleId,
              article,
              { new: true },
              async (err, articleUpdated) => {
                if (err) {
                  fileController.writeLog(req, res, next, 500, err)
                  return res.status(500).send(constants.ERR_SERVER)
                } else {
                  HistoryController.saveAsync(
                    req.session.database,
                    req.session.user,
                    'article',
                    articleUpdated,
                  )
                  const finalArticleId = articleId
                  if (articleUpdated?.containsVariants || article?.containsVariants) {
                  // SI NO ENVIA VARIANTES ES PORQUE ELIMINO A TODAS
                    if (variants && variants.length > 0) {
                      const variantTypes = []
                      const variantTypesStored = []

                      // CAPTURAMOS TODOS LOS TIPO DE VARIANTES ENVIADAS
                      for (const v of variants) {
                        if (getDuplicateTypes(v.type._id, variantTypes) === 0) {
                          variantTypes.push(v.type)
                        }
                      }
                      // CAPTURAMOS VARIANTES ALMACENADAS
                      const result = await VariantController.getVariantsByArticle(req, res, next, null, articleUpdated)

                      const variantsStored = []

                      if (result.err) {
                        fileController.writeLog(req, res, next, 500, err)
                        return res.status(500).send(constants.ERR_SERVER)
                      } else if (result.message) {
                        fileController.writeLog(req, res, next, 200, result.message)
                        return res.status(200).send({ message: result.message })
                      } else {
                        let resultVariants = result.variants
                        if (resultVariants && resultVariants.length > 0) {
                        // CAPTURAMOS TODOS LOS TIPO DE VARIANTES ALMACENADAS
                          for (const v of getUniqueVariants(resultVariants)) {
                            if (getDuplicateTypes(v.type._id, variantTypesStored) === 0) {
                              variantTypesStored.push(v.type)
                            }
                          }

                          // SI DIFIEREN LA CANTIDAD DE TIPOS DE VARIANTES SE ELIMINA TODO Y SE DAN DE ALTA NUEVAMENTE
                          if (variantTypesStored.length > 0 &&
                                                    variantTypes.length !== variantTypesStored.length) {
                            const result = await VariantController.deleteVariantByArticleParent(req, res, next, articleUpdated)
                            if (result.err) {
                              fileController.writeLog(req, res, next, 500, err)
                              return res.status(500).send(constants.ERR_SERVER)
                            } else if (result.message) {
                              fileController.writeLog(req, res, next, 200, result.message)
                              return res.status(200).send({ message: result.message })
                            }
                          } else {
                          // VERIFICAMOS QUE NO SE HAYA ELIMINADO NINGUN VARIANT VALUE
                            let wasVariantEliminated = false
                            for (const rv of resultVariants) {
                              let exists = false
                              for (const v of variants) {
                                if (rv.value._id.toString() === v.value._id.toString()) {
                                  exists = true
                                }
                              }
                              if (!exists) {
                                const result = await VariantController.deleteVariantByArticleChild(req, res, next, rv.articleChild)
                                wasVariantEliminated = true
                                if (result.err) {
                                  fileController.writeLog(req, res, next, 500, err)
                                  return res.status(500).send(constants.ERR_SERVER)
                                } else if (result.message) {
                                  fileController.writeLog(req, res, next, 200, result.message)
                                  return res.status(200).send({ message: result.message })
                                }
                              }
                            }

                            // SI SE ELIMINO ALGUNA CONSULTAMOS LAS QUE QUEDARON
                            if (wasVariantEliminated) {
                              const result = await VariantController.getVariantsByArticle(req, res, next, null, articleUpdated)
                              if (result.err) {
                                fileController.writeLog(req, res, next, 500, err)
                                return res.status(500).send(constants.ERR_SERVER)
                              } else if (result.message) {
                                fileController.writeLog(req, res, next, 200, result.message)
                                return res.status(200).send({ message: result.message })
                              } else {
                                resultVariants = result.variants
                              }
                            }

                            // CAPTURAMOS SORTEO DE VARIANTES ALMACENADAS
                            let exists = true
                            let countStored = 1
                            let numStored = 0
                            let anyoneStored = false
                            for (const vt of variantTypesStored) {
                              numStored = getVariantsByType(vt._id, getUniqueVariants(resultVariants)).length
                              if (anyoneStored && numStored === 0) {
                                numStored = 1
                              } else {
                                anyoneStored = true
                              }
                              countStored *= numStored
                            }
                            for (let i = 0; i < countStored; i++) {
                              let raffleVariantsStored = []
                              do {
                                for (const vt of variantTypesStored) {
                                  const variantByType = getVariantByType(vt, getUniqueVariants(resultVariants))
                                  raffleVariantsStored.push(variantByType)
                                }
                                if (variantsExists(variantsStored, raffleVariantsStored, variantTypesStored)) {
                                  exists = true
                                  if (variantsStored.length === countStored) {
                                    exists = false
                                  }
                                  raffleVariantsStored = []
                                } else {
                                  exists = false
                                  variantsStored.push(raffleVariantsStored)
                                }
                              } while (exists)
                            }
                          }
                        }
                      }
                      // CAPTURAMOS CUANTAS VARIANTES HAY POR TIPO
                      let count = 1
                      let num = 0
                      let anyone = false
                      for (const vt of variantTypes) {
                        num = getVariantsByType(vt._id, variants).length - getVariantsByType(vt._id, variantsStored).length
                        if (anyone && num === 0) {
                          num = 1
                        } else {
                          anyone = true
                        }
                        count *= num
                      }
                      for (let i = 0; i < count; i++) {
                        let exists = false
                        let raffledVariants = []
                        do {
                          for (const vt of variantTypes) {
                            const variantByType = getVariantByType(vt, variants)
                            raffledVariants.push(variantByType)
                          }

                          if (variantsExists(variantsStored, raffledVariants, variantTypes)) {
                            exists = true
                            if (variantsStored.length === count) {
                              exists = false
                            }
                            raffledVariants = []
                          } else {
                            exists = false
                            const result = await saveArticleVariant(req, res, next, articleUpdated, raffledVariants)
                            if (result.err) {
                              fileController.writeLog(req, res, next, 500, err)
                              return res.status(500).send(constants.ERR_SERVER)
                            } else if (result.message) {
                              fileController.writeLog(req, res, next, 200, result.message)
                              return res.status(200).send({ message: result.message })
                            } else {
                              const articleChild = result.article
                              for (const v of raffledVariants) {
                                v.articleParent = articleUpdated
                                v.articleChild = articleChild
                                const result = await VariantController.saveVariant(req, res, next, v)
                                if (result.err) {
                                  fileController.writeLog(req, res, next, 500, err)
                                  return res.status(500).send(constants.ERR_SERVER)
                                } else if (result.message) {
                                  fileController.writeLog(req, res, next, 200, result.message)
                                  return res.status(200).send({ message: result.message })
                                }
                              }
                              variantsStored.push(raffledVariants)
                            }
                          }
                        } while (exists)
                      }
                    } else {
                      const result = await VariantController.deleteVariantByArticleParent(req, res, next, articleUpdated)
                      if (result.err) {
                        fileController.writeLog(req, res, next, 500, err)
                        return res.status(500).send(constants.ERR_SERVER)
                      } else if (result.message) {
                        fileController.writeLog(req, res, next, 200, result.message)
                        return res.status(200).send({ message: result.message })
                      }
                    }

                    // HARCODEAMOS CATEGORY Y MAKE QUE SON TYPEHEAD PARA COMPARAR
                    if (article.category && article.category._id && article.category._id !== '') article.category = article.category._id
                    if (article.make && article.make._id && article.make._id !== '') article.make = article.make._id

                    const newDescription = article.description
                    const result = await VariantController.getVariantsByArticle(req, res, next, null, articleUpdated)
                    if (result.err) {
                      fileController.writeLog(req, res, next, 500, err)
                      return res.status(500).send(constants.ERR_SERVER)
                    } else if (result.message) {
                      fileController.writeLog(req, res, next, 200, result.message)
                      return res.status(200).send({ message: result.message })
                    } else {
                      const updatedArticles = []
                      for (const variant of result.variants) {
                        let updated = false
                        for (const up of updatedArticles) {
                          if (up._id.toString() === variant.articleChild._id.toString()) {
                            updated = true
                          }
                        }
                        if (!updated) {
                          const params = {
                            _id: variant.articleChild._id,
                            type: variant.articleChild.type,
                            containsVariants: variant.articleChild.containsVariants,
                            updateUser: variant.articleChild.updateUser,
                            updateDate: variant.articleChild.updateDate,
                            operationType: variant.articleChild.operationType,
                            lastPricePurchase: variant.articleChild.lastPricePurchase,
                            lastDatePurchase: variant.articleChild.lastDatePurchase,
                            barcode: variant.articleChild.barcode,
                            picture: variant.articleChild.picture,
                            pictures: variant.articleChild.pictures,
                            codeProvider: variant.articleChild.codeProvider,
                            codeSAT: variant.articleChild.codeSAT,
                            meliId: variant.articleChild.meliId,
                            meliAttrs: variant.articleChild.meliAttrs,
                          }
                          articleUpdated.description = variant.articleChild.description.replace(articleUpdated.description, newDescription)
                          variant.articleChild = Object.assign(articleUpdated)
                          variant.articleChild = Object.assign(variant.articleChild, params)
                          const result = await updateVariantArticle(variant.articleChild)
                          if (result.article) {
                            await getAsync(req, res, next, variant.articleChild._id)
                              .then((result) => {
                                if (result.article) {
                                  HistoryController.saveAsync(req.session.database, req.session.user, 'article', result.article)
                                }
                              })
                            updatedArticles.push(variant.articleChild)
                          } else {
                            fileController.writeLog(req, res, next, 500, result)
                            return res.status(500).send(constants.ERR_SERVER)
                          }
                        }
                      }
                    }
                  }

                  if (finalArticleId && articleUpdated.ecommerceEnabled) {
                  // // SYNC WOO
                    axios.post(`${config.BASE_URL_V8}/woo/sync-article/${finalArticleId}`,
                      {},
                      { headers: { Authorization: req.headers.authorization } },
                    ).then(function (response) {
                      if (response.status === 200) {
                      // SYNC MELI
                        axios.post(
                        `${config.BASE_URL_V8}/meli/sync-article/${finalArticleId}`,
                        {},
                        { headers: { Authorization: req.headers.authorization } },
                        )
                          .then(function (response) {
                            if (response.status === 200) {
                              getArticle(req, res, next, finalArticleId)
                            } else {
                              return res.status(response.status).send(response)
                            }
                          })
                          .catch(function (error) {
                            return res
                              .status(500).send({
                                message: (error.response && error.response.data)
                                  ? error.response.data.message
                                  : error.message,
                              })
                          })
                      } else {
                        return res.status(response.status).send(response)
                      }
                    }).catch(function (error) {
                      return res
                        .status(500).send({
                          message: (error.response && error.response.data)
                            ? error.response.data.message
                            : error.message,
                        })
                    })
                  } else {
                    getArticle(req, res, next, finalArticleId)
                  }
                }
              })
          } else {
            let message = ''
            if (article.barcode && article.barcode !== '') {
              message = 'El producto con Código Interno "' + article.code + '" o Código de Barras "' + article.barcode + '"  ya existe.'
            } else {
              message = 'El producto con Código Interno "' + article.code + '" ya existe.'
            }
            fileController.writeLog(req, res, next, 200, message)
            return res.status(200).send({ message })
          }
        }
      })
    } else {
      Article.findByIdAndUpdate(articleId, article, (err, articleUpdated) => {
        if (err) {
          fileController.writeLog(req, res, next, 500, err)
          return res.status(500).send(constants.ERR_SERVER)
        } else {
          // SYNC WOO
          axios.post(`${config.BASE_URL_V8}/woo/sync-article/${articleId}`,
            {},
            { headers: { Authorization: req.headers.authorization } },
          )
            .then(function (response) {
              if (response.status === 200) {
                // SYNC MELI
                axios.post(`${config.BASE_URL_V8}/meli/sync-article/${articleId}`,
                  {},
                  { headers: { Authorization: req.headers.authorization } },
                )
                  .then(function (response) {
                    if (response.status === 200) {
                      getArticle(req, res, next, articleId)
                    } else {
                      return res.status(response.status).send(response)
                    }
                  })
                  .catch(function (error) {
                    return res
                      .status(500).send({
                        message: (error.response && error.response.data)
                          ? error.response.data.message
                          : error.message,
                      })
                  })
              } else {
                return res.status(response.status).send(response)
              }
            })
            .catch(function (error) {
              return res
                .status(500).send({
                  message: (error.response && error.response.data)
                    ? error.response.data.message
                    : error.message,
                })
            })
        }
      })
    }
  }
}

function updateVariantArticle (article) {
  return new Promise((resolve, reject) => {
    Article.update({ _id: article._id }, article, (err, articleUpdated) => {
      if (err) {
        reject(err)
      } else {
        resolve({ article: articleUpdated })
      }
    })
  })
}

async function deleteArticle (req, res, next) {
  initConnectionDB(req.session.database)

  const articleId = req.query.id

  const user = new User()
  user._id = req.session.user

  Article.findByIdAndUpdate(articleId,
    {
      $set: {
        updateUser: user,
        updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
        operationType: 'D',
      },
    }, async (err, articleUpdated) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        // SYNC WOO
        axios.post(
                    `${config.BASE_URL_V8}/woo/sync-article/${articleId}`,
                    {},
                    { headers: { Authorization: req.headers.authorization } },
        )
          .then(function (response) {
            if (response.status === 200) {
              // SYNC MELI
              axios.post(
                `${config.BASE_URL_V8}/meli/sync-article/${articleId}`,
                {},
                { headers: { Authorization: req.headers.authorization } },
              )
                .then(async function (response) {
                  if (response.status === 200) {
                    deleteImage(articleUpdated.picture, req.session.database)
                    fileController.writeLog(req, res, next, 200, articleId)
                    if (articleUpdated.containsVariants) {
                      const result = await VariantController.deleteVariantByArticleParent(
                        req,
                        res,
                        next,
                        articleId,
                      )
                      if (result.err) {
                        fileController.writeLog(req, res, next, 500, err)
                        return res.status(500).send(constants.ERR_SERVER)
                      } else if (result.message) {
                        fileController.writeLog(req, res, next, 200, result.message)
                        return res.status(500).send({ message: result.message })
                      }
                    }
                    HistoryController.saveAsync(req.session.database,
                      req.session.user,
                      'article',
                      articleUpdated,
                    )
                    return res.status(200).send({ article: articleUpdated })
                  } else {
                    return res.status(response.status).send(response)
                  }
                })
                .catch(function (error) {
                  return res
                    .status(500).send({
                      message: (error.response && error.response.data)
                        ? error.response.data.message
                        : error.message,
                    })
                })
            } else {
              return res.status(response.status).send(response)
            }
          })
          .catch(function (error) {
            return res
              .status(500).send({
                message: (error.response && error.response.data)
                  ? error.response.data.message
                  : error.message,
              })
          })
      }
    })
}

// Funcion para que no retorne respuesta
function deleteAsync (req, res, next, article) {
  return new Promise((resolve, reject) => {
    initConnectionDB(req.session.database)

    const user = new User()
    user._id = req.session.user

    Article.findByIdAndUpdate(article._id,
      {
        $set: {
          updateUser: user,
          updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
          operationType: 'D',
        },
      }, async (err, articleUpdated) => {
        if (err) {
          reject(err)
        } else {
          HistoryController.saveAsync(
            req.session.database,
            req.session.user,
            'article',
            articleUpdated,
          )
          // SYNC WOO
          axios.post(
            `${config.BASE_URL_V8}/woo/sync-article/${article._id}`,
            {},
            { headers: { Authorization: req.headers.authorization } },
          )
            .then(function (response) {
              if (response.status === 200) {
                // SYNC MELI
                axios.post(
                  `${config.BASE_URL_V8}/meli/sync-article/${article._id}`,
                  {},
                  { headers: { Authorization: req.headers.authorization } },
                )
                  .then(function (response) {
                    if (response.status === 200) {
                      resolve({ article: articleUpdated })
                    } else {
                      return res.status(response.status).send(response)
                    }
                  })
                  .catch(function (error) {
                    return res
                      .status(500).send({
                        message: (error.response && error.response.data)
                          ? error.response.data.message
                          : error.message,
                      })
                  })
              } else {
                return res.status(response.status).send(response)
              }
            })
            .catch(function (error) {
              return res
                .status(500).send({
                  message: (error.response && error.response.data)
                    ? error.response.data.message
                    : error.message,
                })
            })
        }
      })
  })
}

function uploadImage (req, res, next) {
  initConnectionDB(req.session.database)

  const articleId = req.params.id

  if (req.file) {
    Article.findById(articleId, (err, article) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        const imageToDelete = article.picture
        Article.findByIdAndUpdate(
          articleId,
          { picture: req.file.filename },
          (err, articleUpdated) => {
            if (err) {
              fileController.writeLog(req, res, next, 500, err)
              return res.status(500).send(constants.ERR_SERVER)
            } else if(articleUpdated){
                deleteImage(imageToDelete, req.session.database)
                getArticle(req, res, next, articleId)
              // SYNC WOO
 /*             axios.post(
                `${config.BASE_URL_V8}/woo/sync-article/${articleId}`,
                {},
                { headers: { Authorization: req.headers.authorization } },
              )
                .then(function (response) {
                  if (response.status === 200) {
                  // SYNC MELI
                    axios.post(
                      `${config.BASE_URL_V8}/meli/sync-article/${articleId}`,
                      {},
                      { headers: { Authorization: req.headers.authorization } },
                    ).then(function (response) {
                      if (response.status === 200) {
                        getArticle(req, res, next, articleId)
                      } else {
                        return res.status(response.status).send(response)
                      }
                    }).catch(function (error) {
                      return res
                        .status(500).send({
                          message: (error.response && error.response.data)
                            ? error.response.data.message
                            : error.message,
                        })
                    })
                  } else {
                    return res.status(response.status).send(response)
                  }
                })
                .catch(function (error) {
                  return res
                    .status(500).send({
                      message: (error.response && error.response.data)
                        ? error.response.data.message
                        : error.message,
                    })
                })*/
            }else{
              return res.status(500).send(constants.ERR_SERVER)
            }
          })
      }
    })
  } else {
    fileController.writeLog(req, res, next, 404, constants.NO_IMAGEN_FOUND)
    return res.status(404).send(constants.NO_IMAGEN_FOUND)
  }
}

function uploadImageArray (req, res, next) {
  initConnectionDB(req.session.database)

  if (req.file) {
    return res.status(200).send({ file: req.file })
  } else {
    fileController.writeLog(req, res, next, 404, constants.NO_IMAGEN_FOUND)
    return res.status(404).send(constants.NO_IMAGEN_FOUND)
  }
}

function getImage (req, res, next) {
  const picture = req.params.picture

  if (picture && picture !== undefined) {
    try {
      return res.sendFile(
        path.resolve(
          '/home/clients/' +
          req.params.database +
          '/images/article/' +
          picture,
        ),
      )
    } catch (err) {
      fileController.writeLog(req, res, next, 404, constants.NO_IMAGEN_FOUND)
      return res.status(404).send(constants.NO_IMAGEN_FOUND)
    }
  }
}

function deleteImage (picture, database) {
  if (picture && picture !== 'default.jpg') {
    try {
      fs.unlinkSync('/home/clients/' + database + '/images/article/' + picture)
    } catch (err) {
      console.log(err)
    }
  };
}

function deleteImageArray (req, res, next) {
  initConnectionDB(req.session.database)

  if (req.query.picture) {
    fs.unlink(
      '/home/clients/' +
      req.session.database +
      '/images/article/' +
      req.query.picture,
      function (err) {
        if (err) {
          return res.status(500).send(err)
        } else {
          return res.status(200).send({ result: 'ok' })
        }
      })
  };
}

function getBestSellingArticle (req, res, next) {
  const mongoose = require('mongoose')

  initConnectionDB(req.session.database)

  let query
  try {
    query = JSON.parse(req.query.query)
  } catch (err) {
    fileController.writeLog(req, res, next, 500, err)
    return res.status(500).send(constants.ERR_SERVER)
  }

  const match = query.match
  const type = query.type
  const currentAccount = query.currentAccount
  const modifyStock = query.modifyStock
  const startDate = query.startDate
  const endDate = query.endDate
  const sort = query.sort
  const limit = query.limit
  const branch = query.branch

  const queryAggregate = []
  queryAggregate.push({
    $lookup:
        {
          from: 'articles',
          localField: 'article',
          foreignField: '_id',
          as: 'article',
        },
  })
  queryAggregate.push({
    $unwind: {
      path: '$article',
    },
  })
  queryAggregate.push({
    $lookup:
        {
          from: 'categories',
          localField: 'article.category',
          foreignField: '_id',
          as: 'article.category',
        },
  })
  queryAggregate.push({
    $unwind: {
      path: '$article.category',
      preserveNullAndEmptyArrays: true,
    },
  })
  queryAggregate.push({
    $lookup:
        {
          from: 'makes',
          localField: 'article.make',
          foreignField: '_id',
          as: 'article.make',
        },
  })
  queryAggregate.push({
    $unwind: {
      path: '$article.make',
      preserveNullAndEmptyArrays: true,
    },
  })
  queryAggregate.push({
    $lookup:
        {
          from: 'unit-of-measurements',
          localField: 'article.unitOfMeasurement',
          foreignField: '_id',
          as: 'article.unitOfMeasurement',
        },
  })
  queryAggregate.push({
    $unwind: {
      path: '$article.unitOfMeasurement',
      preserveNullAndEmptyArrays: true,
    },
  })
  queryAggregate.push({
    $lookup:
        {
          from: 'transactions',
          localField: 'transaction',
          foreignField: '_id',
          as: 'transaction',
        },
  })
  queryAggregate.push({
    $unwind: '$transaction',
  })
  queryAggregate.push({
    $match: {
      $and: [
        {
          'transaction.endDate': {
            $gte: new Date(startDate),
          },
        },
        {
          'transaction.endDate': {
            $lte: new Date(endDate),
          },
        },
        {
          'transaction.state': 'Cerrado',
        },
        {
          'transaction.operationType': { $ne: 'D' },
        },
        {
          operationType: { $ne: 'D' },
        },
      ],
    },
  })
  if (branch && branch !== '') {
    queryAggregate.push({
      $match:
            {
              'transaction.branchDestination': mongoose.Types.ObjectId(branch),
            },
    })
  }
  queryAggregate.push({
    $lookup:
        {
          from: 'transaction-types',
          localField: 'transaction.type',
          foreignField: '_id',
          as: 'transaction.type',
        },
  })
  queryAggregate.push({
    $unwind: '$transaction.type',
  })
  queryAggregate.push({
    $match:
        {
          $and:
                [
                  {
                    'transaction.type.transactionMovement': type,
                    'transaction.type.currentAccount': currentAccount,
                    'transaction.type.modifyStock': modifyStock,
                  },
                ],
        },
  })
  queryAggregate.push({
    $match: match,
  })
  queryAggregate.push({
    $project: {
      article: '$article',
      records: { $sum: 1 },
      amount: {
        $cond: {
          if: {
            $or: [
              {
                $and: [
                  { $eq: ['$transaction.type.stockMovement', 'Salida'] },
                  { $eq: ['$transaction.type.transactionMovement', 'Venta'] },
                ],
              },
              {
                $and: [
                  { $eq: ['$transaction.type.stockMovement', 'Entrada'] },
                  { $eq: ['$transaction.type.transactionMovement', 'Compra'] },
                ],
              },
            ],
          },
          then: { $multiply: ['$amount', '$article.quantityPerMeasure'] },
          else: { $multiply: ['$amount', -1, '$article.quantityPerMeasure'] },
        },
      },
      salePrice: {
        $cond: {
          if: {
            $or: [
              {
                $and: [
                  { $eq: ['$transaction.type.stockMovement', 'Salida'] },
                  { $eq: ['$transaction.type.transactionMovement', 'Venta'] },
                ],
              },
              {
                $and: [
                  { $eq: ['$transaction.type.stockMovement', 'Entrada'] },
                  { $eq: ['$transaction.type.transactionMovement', 'Compra'] },
                ],
              },
            ],
          },
          then: { $multiply: ['$salePrice', 1] },
          else: { $multiply: ['$salePrice', -1] },
        },
      },
    },

  })
  queryAggregate.push({
    $group: {
      _id: '$article',
      count: { $sum: '$amount' },
      total: { $sum: '$salePrice' },
    },
  })

  queryAggregate.push({
    $project: {
      article: '$_id',
      count: 1,
      total: 1,
    },
  })

  queryAggregate.push({ $sort: sort })

  if (limit && limit !== 0) {
    queryAggregate.push({ $limit: limit })
  }

  MovementOfArticle.aggregate(queryAggregate)
    .then(function (result) {
      fileController.writeLog(req, res, next, 200, result.length)
      return res.status(200).send(result)
    }).catch(err => {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(err)
    })
}

async function updatePrices (req, res, next) {
  initConnectionDB(req.session.database)

  const query = req.body
  const decimal = parseInt(req.query.decimal)

  let error
  let countError
  let y = 0
  const articleFailure = []
  const articlesUpdate = []
  const variantsUpdate = []

  Article.find(query.where)
    .populate({
      path: 'otherFields.articleField',
      model: ArticleField,
    })
    .populate({
      path: 'taxes.tax',
      model: Tax,
    })
    .exec(async (err, articles) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        if (articles && articles.length > 0) {
          for (let i = 0; i < articles.length; i++) {
            switch (query.field) {
              case 'basePrice':
                articles[i].costPrice = 0
                articles[i].basePrice = roundNumber(
                  (articles[i].basePrice * parseFloat(query.percentage) / 100) +
                  articles[i].basePrice, decimal)
                let taxedAmount = articles[i].basePrice

                if (articles[i].otherFields && articles[i].otherFields.length > 0) {
                  for (const field of articles[i].otherFields) {
                    if (field.articleField.datatype === 'Porcentaje') {
                      field.amount = roundNumber((articles[i].basePrice * parseFloat(field.value) / 100), decimal)
                    } else if (field.articleField.datatype === 'Número') {
                      field.amount = parseFloat(field.value)
                    }
                    if (field.articleField.modifyVAT) {
                      taxedAmount += field.amount
                    } else {
                      articles[i].costPrice += field.amount
                    }
                  }
                }

                if (articles[i].taxes && articles[i].taxes.length > 0) {
                  for (const articleTax of articles[i].taxes) {
                    articleTax.taxBase = taxedAmount
                    articleTax.taxAmount = roundNumber(taxedAmount * articleTax.percentage / 100, decimal)
                    articles[i].costPrice += (articleTax.taxAmount)
                  }
                }
                articles[i].costPrice += taxedAmount

                if (!(taxedAmount === 0 && articles[i].salePrice !== 0)) {
                  articles[i].markupPrice = roundNumber((articles[i].costPrice * articles[i].markupPercentage / 100), decimal)
                  articles[i].salePrice = articles[i].costPrice + articles[i].markupPrice
                }
                break
              case 'costPrice':

                break
              case 'markupPercentage':
                articles[i].markupPercentage += parseFloat(query.percentage)
                articles[i].markupPercentage = roundNumber(articles[i].markupPercentage, decimal)
                articles[i].markupPrice = roundNumber(articles[i].costPrice * articles[i].markupPercentage / 100)
                articles[i].salePrice = articles[i].costPrice + articles[i].markupPrice
                break
              case 'salePrice':
                articles[i].salePrice += roundNumber(parseFloat(query.percentage) * articles[i].salePrice / 100)
                articles[i].salePrice = roundNumber(articles[i].salePrice, decimal)
                if (articles[i].basePrice === 0) {
                  articles[i].costPrice = 0
                  articles[i].markupPercentage = 100
                  articles[i].markupPrice = articles[i].salePrice
                } else {
                  articles[i].markupPrice = articles[i].salePrice - articles[i].costPrice
                  articles[i].markupPercentage = roundNumber(articles[i].markupPrice / articles[i].costPrice * 100)
                }
                break
              default:
                break
            }
            const obj = await updatePricesArticle(req, res, next, articles[i])
            if (obj !== 'ok') {
              error = obj
              countError = i
              articleFailure[y] = articles[i]
              y++
            } else {
              if (articles[i].type === 'Final') {
                articlesUpdate.push(articles[i])
              } else if (articles[i].type === 'Variante') {
                variantsUpdate.push(articles[i])
              }
            }
          }
          if (error) {
            fileController.writeLog(req, res, next, 500, error)
            return res.status(200).send({ count: countError, status: 'Error', articleFailure })
          } else {
            fileController.writeLog(req, res, next, 200, { countFinal: articlesUpdate.length, countVariants: variantsUpdate.length, status: 'OK' })
            return res.status(200).send({ countFinal: articlesUpdate.length, countVariants: variantsUpdate.length, status: 'OK' })
          }
        } else {
          fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND)
          return res.status(404).send(constants.NO_DATA_FOUND)
        }
      }
    })
}

function updatePricesArticle (req, res, next, article) {
  return new Promise((resolve, reject) => {
    Article.findByIdAndUpdate(article._id, article, (err, articleUpdated) => {
      if (err) {
        reject(err)
      } else {
        HistoryController.saveAsync(req.session.database,
          req.session.user,
          'article',
          articleUpdated,
        )
        // SYNC WOO
        axios.post(
          `${config.BASE_URL_V8}/woo/sync-article/${article._id}`,
          {},
          { headers: { Authorization: req.headers.authorization } },
        ).then(function (response) {
          if (response.status === 200) {
            // SYNC MELI
            axios.post(`${config.BASE_URL_V8}/meli/sync-article/${article._id}`,
              {},
              { headers: { Authorization: req.headers.authorization } },
            )
              .then(function (response) {
                if (response.status === 200) {
                  resolve('ok')
                } else {
                  return res.status(response.status).send(response)
                }
              })
              .catch(function (error) {
                return res
                  .status(500).send({
                    message: (error.response && error.response.data)
                      ? error.response.data.message
                      : error.message,
                  })
              })
          } else {
            return res.status(response.status).send(response)
          }
        })
          .catch(function (error) {
            return res
              .status(500).send({
                message: (error.response && error.response.data)
                  ? error.response.data.message
                  : error.message,
              })
          })
      }
    })
  })
}

function roundNumber (value, numberOfDecimals = 2) {
  if (value) {
    return parseFloat(value.toFixed(numberOfDecimals))
  } else {
    if (value === 0) {
      return 0
    }
  }
}

function getImageBase64 (req, res, next) {
  const fs = require('fs')
  const picture = req.query.picture

  if (picture && picture !== undefined) {
    try {
      const bitmap = fs.readFileSync(
        path.resolve(
          '/home/clients/' +
          req.session.database +
          '/images/article/' +
          picture,
        ),
      )
      return res.status(200).send({ imageBase64: new Buffer(bitmap).toString('base64') })
    } catch (err) {
      fileController.writeLog(req, res, next, 404, constants.NO_IMAGEN_FOUND)
      return res.status(404).send(constants.NO_IMAGEN_FOUND)
    }
  }
}

function initConnectionDB (database) {
  const Model = require('./../models/model')

  const ArticleSchema = require('./../models/article')
  Article = new Model('article', {
    schema: ArticleSchema,
    connection: database,
  })

  const MakeSchema = require('./../models/make')
  Make = new Model('make', {
    schema: MakeSchema,
    connection: database,
  })

  const CategorySchema = require('./../models/category')
  Category = new Model('category', {
    schema: CategorySchema,
    connection: database,
  })

  const MovementOfArticleSchema = require('./../models/movement-of-article')
  MovementOfArticle = new Model('movements-of-article', {
    schema: MovementOfArticleSchema,
    connection: database,
  })

  const UserSchema = require('./../models/user')
  User = new Model('user', {
    schema: UserSchema,
    connection: database,
  })

  const UnitOfMeasurementSchema = require('./../models/unit-of-measurement')
  UnitOfMeasurement = new Model('unit-of-measurement', {
    schema: UnitOfMeasurementSchema,
    connection: database,
  })

  const CurrencySchema = require('./../models/currency')
  Currency = new Model('currency', {
    schema: CurrencySchema,
    connection: database,
  })

  const TaxSchema = require('./../models/tax')
  Tax = new Model('tax', {
    schema: TaxSchema,
    connection: database,
  })

  const DepositSchema = require('./../models/deposit')
  Deposit = new Model('deposit', {
    schema: DepositSchema,
    connection: database,
  })

  const LocationSchema = require('./../models/location')
  Location = new Model('location', {
    schema: LocationSchema,
    connection: database,
  })

  const ArticleFieldSchema = require('./../models/article-field')
  ArticleField = new Model('article-field', {
    schema: ArticleFieldSchema,
    connection: database,
  })

  const CompanySchema = require('./../models/company')
  Company = new Model('company', {
    schema: CompanySchema,
    connection: database,
  })

  const BranchSchema = require('./../models/branch')
  Branch = new Model('branch', {
    schema: BranchSchema,
    connection: database,
  })

  const ApplicationSchema = require('./../models/application')
  Application = new Model('application', {
    schema: ApplicationSchema,
    connection: database,
  })

  const AccountSchema = require('./../models/account')
  Account = new Model('account', {
    schema: AccountSchema,
    connection: database,
  })
}

module.exports = {
  getArticle,
  getArticles,
  saveArticle,
  updateArticle,
  deleteArticle,
  uploadImage,
  getImage,
  deleteAsync,
  getBestSellingArticle,
  updatePrices,
  getArticlesV2,
  uploadImageArray,
  deleteImageArray,
  getImageBase64,
  // createArticleExcel
}
