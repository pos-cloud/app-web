'use strict'

const fileController = require('./file.controller')
const ArticleStockController = require('./article-stock.controller')
const constants = require('./../utilities/constants')
const { EJSON } = require('bson')
const moment = require('moment')
moment.locale('es')
const mongoose = require('mongoose')

let MovementOfArticle
let Transaction
let Article
let User
let TransactionType
let Make
let Category
let UnitOfMeasurement
let Currency
let Tax
let Deposit
let Location
let ArticleField
let Branch
let Classification
let ArticleStock
let Account
let BusinessRule

// METODOS ASYNC
async function get (id) {
  return new Promise(async (resolve, reject) => {
    if (mongoose.Types.ObjectId.isValid(id)) {
      await MovementOfArticle.findById(id, (err, movementOfArticle) => {
        if (err) {
          reject(err)
        } else {
          resolve(movementOfArticle)
        }
      })
        .populate({ path: 'taxes.tax', model: Tax })
        .populate({ path: 'otherFields.articleField', model: ArticleField })
        .populate({ path: 'make', model: Make })
        .populate({ path: 'category', model: Category })
        .populate({
          path: 'article',
          model: Article,
          populate: [{ path: 'unitOfMeasurement', model: UnitOfMeasurement },
            { path: 'currency', model: Currency },
            {
              path: 'locations.location',
              model: Location,
              populate: [{ path: 'deposit', model: Deposit }]
            },
            {
              path: 'deposits.deposit',
              model: Deposit,
              populate: [{ path: 'deposits.deposit.branch', model: Branch }]
            },
            { path: 'taxes.tax', model: Tax }]
        })
        .populate({ path: 'transaction', model: Transaction, populate: [{ path: 'type', model: TransactionType }, { path: 'taxes.tax', model: Tax }] })
        .populate({ path: 'creationUser', model: User })
        .populate({ path: 'updateUser', model: User })
        .populate({ path: 'deposit', model: Deposit })
        .populate({ path: 'account', model: Account })
        .populate({ path: 'businessRule', model: BusinessRule })
    } else {
      reject(null)
    }
  })
}

// METODOS ASYNC
async function update (req, res, next, movementOfArticleId, movementOfArticle) {
  return new Promise(async (resolve, reject) => {
    initConnectionDB(req.session.database)

    const user = new User()
    user._id = req.session.user
    movementOfArticle.updateUser = user
    movementOfArticle.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
    movementOfArticle.operationType = 'U'

    await MovementOfArticle.updateOne({ _id: movementOfArticleId }, clearLookups(movementOfArticle), async (err, result) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, JSON.stringify({
          date: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
          database: req.session.database,
          movementOfArticleId,
          err
        }))
        reject(err)
      } else {
        if (result && result.ok === 1 && result.n === 1) {
          await get(movementOfArticleId).then(
            movementOfArticle => {
              resolve(movementOfArticle)
            }
          ).catch(
            err => {
              fileController.writeLog(req, res, next, 500, JSON.stringify({
                date: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
                database: req.session.database,
                movementOfArticleId,
                err
              }))
              reject(err)
            }
          )
        } else {
          // Se dejan console log para ver q onda los errores.
          fileController.writeLog(req, res, next, 500, JSON.stringify({
            date: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
            database: req.session.database,
            movementOfArticleId,
            result
          }))
          reject(result)
        }
      }
    })
  })
}

async function save (req, res, next, movementOfArticle) {
  return new Promise(async (resolve, reject) => {
    initConnectionDB(req.session.database)

    const user = new User()
    user._id = req.session.user
    movementOfArticle.creationUser = user
    movementOfArticle.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
    movementOfArticle.operationType = 'C'

    let totalTaxes = 0
    if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
      for (const tax of movementOfArticle.taxes) {
        totalTaxes += tax.taxAmount
      }
    }
    movementOfArticle.markupPriceWithoutVAT = roundNumber(movementOfArticle.salePrice - totalTaxes - movementOfArticle.basePrice)

    await movementOfArticle.save(async (err, movementOfArticleSaved) => {
      if (err) {
        reject(err)
      } else {
        if (movementOfArticleSaved) {
          await get(movementOfArticleSaved._id).then(
            movementOfArticle => {
              resolve(movementOfArticle)
            }
          ).catch(
            err => {
              reject(err)
            }
          )
        } else {
          reject(movementOfArticleSaved)
        }
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

// METODOS PARA FRONTEND
async function getMovementOfArticle (req, res, next, id = undefined) {
  initConnectionDB(req.session.database)

  let movementOfArticleId
  if (id) {
    movementOfArticleId = id
  } else {
    movementOfArticleId = req.query.id
  }

  await get(movementOfArticleId).then(
    movementOfArticle => {
      if (!movementOfArticle || movementOfArticle.operationType === 'D') {
        fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND)
        return res.status(404).send(constants.NO_DATA_FOUN)
      } else {
        fileController.writeLog(req, res, next, 200, movementOfArticle._id)
        return res.status(200).send({ movementOfArticle })
      }
    }
  ).catch(
    err => {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(constants.ERR_SERVER)
    }
  )
}

function getMovementsOfArticles (req, res, next) {
  initConnectionDB(req.session.database)

  // http://localhost:3000/api/articles/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"

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
          json = json + '{' + item[1] + '}]}'
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

  MovementOfArticle.find(where)
    .limit(limit)
    .select(select)
    .sort(sort)
    .skip(skip)
    .populate({
      path: 'taxes.tax',
      model: Tax
    }).populate({
      path: 'otherFields.articleField',
      model: ArticleField
    }).populate({
      path: 'make',
      model: Make
    }).populate({
      path: 'category',
      model: Category
    }).populate({
      path: 'article',
      model: Article,
      populate: [{
        path: 'unitOfMeasurement',
        model: UnitOfMeasurement
      }, {
        path: 'currency',
        model: Currency
      }, {
        path: 'taxes.tax',
        model: Tax
      }, {
        path: 'classification',
        model: Classification
      }, {
        path: 'children.article',
        model: Article,
        populate: [{
          path: 'deposits.deposit',
          model: Deposit,
          populate: [{
            path: 'branch',
            model: Branch
          }]
        }]
      }, {
        path: 'deposits.deposit',
        model: Deposit,
        populate: [{
          path: 'branch',
          model: Branch
        }]
      }, {
        path: 'locations.location',
        model: Location,
        populate: [{
          path: 'deposit',
          model: Deposit
        }]
      }]
    }).populate({
      path: 'transaction',
      model: Transaction,
      populate: [{
        path: 'type',
        model: TransactionType
      }, {
        path: 'branchOrigin',
        model: Branch
      }, {
        path: 'branchDestination',
        model: Branch
      }, {
        path: 'depositOrigin',
        model: Deposit
      }, {
        path: 'depositDestination',
        model: Deposit
      }]
    }).populate({
      path: 'creationUser',
      model: User
    }).populate({
      path: 'updateUser',
      model: User
    }).populate({
      path: 'deposit',
      model: Deposit
    }).populate({
      path: 'account',
      model: Account
    })
    .populate({ path: 'businessRule', model: BusinessRule })
    .exec((err, movementsOfArticles) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        if (!movementsOfArticles || movementsOfArticles.length === 0) {
          fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND)
          return res.status(404).send({ message: constants.NO_DATA_FOUN })
        } else {
          fileController.writeLog(req, res, next, 200, movementsOfArticles.length)
          return res.status(200).send({ movementsOfArticles })
        }
      }
    })
}

function getMovementsOfArticlesV2 (req, res, next) {
  initConnectionDB(req.session.database)

  let queryAggregate = []
  let group

  if ((req.query && req.query !== {}) && (!req.query.fullQuery || req.query.fullQuery === '[]' || req.query.fullQuery === [])) {
    let error

    let project = req.query.project
    if (project && project !== {} && project !== '{}') {
      try {
        project = JSON.parse(project)

        if (searchPropertyOfArray(project, 'taxes')) {
          queryAggregate.push(
            {
              $lookup: {
                from: 'taxes',
                localField: 'taxes.tax',
                foreignField: '_id',
                as: 'taxDetails'
              }
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
                                    $eq: ['$$td._id', '$$t.tax']
                                  }
                                }
                              }, 0
                            ]
                          }
                        }
                      ]
                    }
                  }
                }
              }
            }
          )
        }

        if (searchPropertyOfArray(project, 'otherFields')) {
          queryAggregate.push(
            {
              $lookup: {
                from: 'otherFields',
                localField: 'otherFields.articleField',
                foreignField: '_id',
                as: 'articleFieldDetails'
              }
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
                                    $eq: ['$$od._id', '$$o.articleField']
                                  }
                                }
                              }, 0
                            ]
                          }
                        }
                      ]
                    }
                  }
                }
              }
            }
          )
        }

        if (searchPropertyOfArray(project, 'make.')) {
          queryAggregate.push({ $lookup: { from: 'makes', foreignField: '_id', localField: 'make', as: 'make' } })
          queryAggregate.push({ $unwind: { path: '$make', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'category.')) {
          queryAggregate.push({ $lookup: { from: 'categories', foreignField: '_id', localField: 'category', as: 'category' } })
          queryAggregate.push({ $unwind: { path: '$category', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'account.')) {
          queryAggregate.push({ $lookup: { from: 'accounts', foreignField: '_id', localField: 'account', as: 'account' } })
          queryAggregate.push({ $unwind: { path: '$account', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'deposit.')) {
          queryAggregate.push({ $lookup: { from: 'deposits', foreignField: '_id', localField: 'deposit', as: 'deposit' } })
          queryAggregate.push({ $unwind: { path: '$deposit', preserveNullAndEmptyArrays: true } })

          queryAggregate.push({ $lookup: { from: 'branches', foreignField: '_id', localField: 'deposit.branch', as: 'deposit.branch' } })
          queryAggregate.push({ $unwind: { path: '$deposit.branch', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'article.')) {
          queryAggregate.push({ $lookup: { from: 'articles', foreignField: '_id', localField: 'article', as: 'article' } })
          queryAggregate.push({ $unwind: { path: '$article', preserveNullAndEmptyArrays: true } })

          if (searchPropertyOfArray(project, 'article.deposit.')) {
            queryAggregate.push({ $lookup: { from: 'deposits', foreignField: '_id', localField: 'article.deposit', as: 'article.deposit' } })
            queryAggregate.push({ $unwind: { path: '$article.deposit', preserveNullAndEmptyArrays: true } })
          }

          if (searchPropertyOfArray(project, 'article.providers.')) {
            queryAggregate.push({ $lookup: { from: 'companies', foreignField: '_id', localField: 'article.providers', as: 'article.providers' } })
            queryAggregate.push({ $unwind: { path: '$article.providers', preserveNullAndEmptyArrays: true } })
          }
          if (searchPropertyOfArray(project, 'article.provider.')) {
            queryAggregate.push({ $lookup: { from: 'companies', foreignField: '_id', localField: 'article.provider', as: 'article.provider' } })
            queryAggregate.push({ $unwind: { path: '$article.provider', preserveNullAndEmptyArrays: true } })
          }

          if (searchPropertyOfArray(project, 'article.otherFields.') || searchPropertyOfArray(project, 'otherFieldsValues')) {
            queryAggregate.push({ $lookup: { from: 'companies', foreignField: '_id', localField: 'providers', as: 'providers' } })
          }
          if (searchPropertyOfArray(project, 'article.otherFields.') || searchPropertyOfArray(project, 'otherFieldsValues')) {
            queryAggregate.push({ $lookup: { from: 'companies', foreignField: '_id', localField: 'provider', as: 'provider' } })
          }

          if (searchPropertyOfArray(project, 'article.location.')) {
            queryAggregate.push({ $lookup: { from: 'locations', foreignField: '_id', localField: 'article.location', as: 'article.location' } })
            queryAggregate.push({ $unwind: { path: '$article.location', preserveNullAndEmptyArrays: true } })
          }

          if (searchPropertyOfArray(project, 'article.currency.')) {
            queryAggregate.push({ $lookup: { from: 'currencies', foreignField: '_id', localField: 'article.currency', as: 'article.currency' } })
            queryAggregate.push({ $unwind: { path: '$article.currency', preserveNullAndEmptyArrays: true } })
          }

          if (searchPropertyOfArray(project, 'article.unitOfMeasurement.')) {
            queryAggregate.push({ $lookup: { from: 'unit-of-measurements', foreignField: '_id', localField: 'article.unitOfMeasurement', as: 'article.unitOfMeasurement' } })
            queryAggregate.push({ $unwind: { path: '$article.unitOfMeasurement', preserveNullAndEmptyArrays: true } })
          }

          if (searchPropertyOfArray(project, 'articleParent')) {
            queryAggregate.push({
              $lookup: {
                from: 'variants',
                let: { pid: '$article._id' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$articleChild', '$$pid'] } } },
                  { $project: { _id: '$articleParent' } }
                ],
                as: 'articleParent'
              }
            })
            queryAggregate.push({ $unwind: { path: '$articleParent', preserveNullAndEmptyArrays: true } })
            queryAggregate.push({ $lookup: { from: 'articles', foreignField: '_id', localField: 'articleParent._id', as: 'articleParent' } })
            queryAggregate.push({ $unwind: { path: '$articleParent', preserveNullAndEmptyArrays: true } })
          }
        }

        if (searchPropertyOfArray(project, 'transaction.')) {
          queryAggregate.push({ $lookup: { from: 'transactions', foreignField: '_id', localField: 'transaction', as: 'transaction' } })
          queryAggregate.push({ $unwind: { path: '$transaction' } })

          if (searchPropertyOfArray(project, 'transaction.type.')) {
            queryAggregate.push({ $lookup: { from: 'transaction-types', foreignField: '_id', localField: 'transaction.type', as: 'transaction.type' } })
            queryAggregate.push({ $unwind: { path: '$transaction.type' } })
          }

          if (searchPropertyOfArray(project, 'transaction.employeeOpening.')) {
            queryAggregate.push({ $lookup: { from: 'employees', foreignField: '_id', localField: 'transaction.employeeOpening', as: 'transaction.employeeOpening' } })
            queryAggregate.push({ $unwind: { path: '$transaction.employeeOpening', preserveNullAndEmptyArrays: true } })
          }

          if (searchPropertyOfArray(project, 'transaction.employeeClosing.')) {
            queryAggregate.push({ $lookup: { from: 'employees', foreignField: '_id', localField: 'transaction.employeeClosing', as: 'transaction.employeeClosing' } })
            queryAggregate.push({ $unwind: { path: '$transaction.employeeClosing', preserveNullAndEmptyArrays: true } })
          }

          if (searchPropertyOfArray(project, 'transaction.company.')) {
            queryAggregate.push({ $lookup: { from: 'companies', foreignField: '_id', localField: 'transaction.company', as: 'transaction.company' } })
            queryAggregate.push({ $unwind: { path: '$transaction.company', preserveNullAndEmptyArrays: true } })

            if (searchPropertyOfArray(project, 'transaction.company.state')) {
              queryAggregate.push({ $lookup: { from: 'states', foreignField: '_id', localField: 'transaction.company.state', as: 'transaction.company.state' } })
              queryAggregate.push({ $unwind: { path: '$transaction.company.state', preserveNullAndEmptyArrays: true } })
            }
          }
        }

        if (searchPropertyOfArray(project, 'creationUser.')) {
          queryAggregate.push({ $lookup: { from: 'users', foreignField: '_id', localField: 'creationUser', as: 'creationUser' } })
          queryAggregate.push({ $unwind: { path: '$creationUser', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'creationUser.')) {
          queryAggregate.push({ $lookup: { from: 'users', foreignField: '_id', localField: 'creationUser', as: 'creationUser' } })
          queryAggregate.push({ $unwind: { path: '$creationUser', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'updateUser.')) {
          queryAggregate.push({ $lookup: { from: 'users', foreignField: '_id', localField: 'updateUser', as: 'updateUser' } })
          queryAggregate.push({ $unwind: { path: '$updateUser', preserveNullAndEmptyArrays: true } })
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
            if (searchPropertyOfArray(JSON.parse(group), 'movementsOfArticles')) {
              projectGroup = `{ "movementsOfArticles": { "$slice": ["$movementsOfArticles", ${skip}, ${limit}] }`
            } else {
              projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`
            }
            for (const prop of Object.keys(JSON.parse(group))) {
              if (prop !== 'movementsOfArticles' && prop !== 'items') {
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
  } else {
    queryAggregate = JSON.parse(req.query.fullQuery)
  }

  queryAggregate = EJSON.parse(JSON.stringify(queryAggregate))

  MovementOfArticle.aggregate(queryAggregate)
    .allowDiskUse(true)
    .then(function (result) {
      fileController.writeLog(req, res, next, 200, result.length)
      if (result.length > 0) {
        if (group && group !== '{}' && group !== {}) {
          return res.status(200).send(result)
        } else {
          return res.status(200).send({ movementsOfArticles: result })
        }
      } else {
        if (group && group !== '{}' && group !== {}) {
          return res.status(200).send({ count: 0, movementsOfArticles: [] })
        } else {
          return res.status(200).send({ movementsOfArticles: [] })
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

function getShiftClosing (req, res, next) {
  initConnectionDB(req.session.database)

  const turn = req.query.turn

  let whereMovement
  try {
    whereMovement = JSON.parse('{"operationType": "D"}')
  } catch (err) {
    fileController.writeLog(req, res, next, 500, err)
    return res.status(500).send(constants.ERR_SERVER)
  }

  let whereTransaction
  try {
    whereTransaction = JSON.parse('{ "turnClosing" : "' + turn + '" }')
  } catch (err) {
    fileController.writeLog(req, res, next, 500, err)
    return res.status(500).send(constants.ERR_SERVER)
  }

  MovementOfArticle.find(whereMovement)
    .populate({
      path: 'transaction',
      match: whereTransaction
    })
    .exec((err, movementsOfArticles) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        if (!movementsOfArticles) {
          fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND)
          return res.status(404).send(constants.NO_DATA_FOUN)
        } else if (movementsOfArticles.length === 0) {
          fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUN)
          return res.status(200).send({ message: constants.NO_DATA_FOUN })
        } else {
          const shiftClosing = calculateShiftClosing(movementsOfArticles)
          fileController.writeLog(req, res, next, 200, 'shiftClosing = ' + shiftClosing)
          return res.status(200).send({ shiftClosing })
        }
      }
    })
}

function calculateShiftClosing (movementsOfArticles) {
  const deletedItems = []
  for (const movementOfArticle of movementsOfArticles) {
    if (movementOfArticle.transaction !== null) {
      deletedItems.push(movementOfArticle)
    }
  }

  const json = {
    deletedItems
  }
  return json
}

async function saveMovementOfArticle (req, res, next) {
  initConnectionDB(req.session.database)

  const movementOfArticle = new MovementOfArticle()
  const params = req.body

  movementOfArticle.code = params.code
  movementOfArticle.codeSAT = params.codeSAT
  movementOfArticle.description = params.description
  movementOfArticle.observation = params.observation
  movementOfArticle.basePrice = params.basePrice
  movementOfArticle.otherFields = params.otherFields
  movementOfArticle.taxes = params.taxes
  movementOfArticle.costPrice = params.costPrice
  movementOfArticle.unitPrice = params.unitPrice
  movementOfArticle.markupPercentage = params.markupPercentage
  movementOfArticle.markupPrice = params.markupPrice
  movementOfArticle.discountRate = params.discountRate
  movementOfArticle.discountAmount = params.discountAmount
  movementOfArticle.transactionDiscountAmount = params.transactionDiscountAmount
  movementOfArticle.salePrice = params.salePrice
  movementOfArticle.roundingAmount = params.roundingAmount
  movementOfArticle.make = params.make
  movementOfArticle.category = params.category
  movementOfArticle.amount = params.amount
  movementOfArticle.deposit = params.deposit
  movementOfArticle.quantityForStock = params.quantityForStock
  movementOfArticle.barcode = params.barcode
  movementOfArticle.notes = params.notes
  movementOfArticle.printed = params.printed
  movementOfArticle.printIn = params.printIn
  movementOfArticle.status = params.status
  movementOfArticle.article = params.article
  movementOfArticle.transaction = params.transaction
  movementOfArticle.businessRule = params.businessRule
  movementOfArticle.measure = params.measure
  movementOfArticle.quantityMeasure = params.quantityMeasure
  movementOfArticle.modifyStock = params.modifyStock
  movementOfArticle.stockMovement = params.stockMovement
  movementOfArticle.movementParent = params.movementParent
  movementOfArticle.movementOrigin = params.movementOrigin
  movementOfArticle.read = params.read
  movementOfArticle.op = params.op
  movementOfArticle.isOptional = params.isOptional
  movementOfArticle.isGeneratedByPayment = params.isGeneratedByPayment
  movementOfArticle.isGeneratedByRule = params.isGeneratedByRule
  movementOfArticle.account = params.account
  movementOfArticle.recalculateParent = params.recalculateParent
  movementOfArticle.transactionEndDate = params.transactionEndDate

  let totalTaxes = 0
  if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
    for (const tax of movementOfArticle.taxes) {
      totalTaxes += tax.taxAmount
    }
  }
  movementOfArticle.markupPriceWithoutVAT = roundNumber(movementOfArticle.salePrice - totalTaxes - movementOfArticle.basePrice)

  await save(req, res, next, movementOfArticle).then(
    async movementOfArticle => {
      fileController.writeLog(req, res, next, 200, 'ok')
      return res.status(200).send({ movementOfArticle })
    }
  ).catch(
    err => {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(constants.ERR_SERVER)
    }
  )
}

function saveMovementsOfArticles (req, res, next) {
  initConnectionDB(req.session.database)

  const params = req.body

  const movementsOfArticles = params.movementsOfArticles

  MovementOfArticle.create(movementsOfArticles, (err, movementsOfArticlesSaved) => {
    if (err) {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(constants.ERR_SERVER)
    } else {
      fileController.writeLog(req, res, next, 200, movementsOfArticlesSaved)
      return res.status(200).send({ movementsOfArticles: movementsOfArticlesSaved })
    }
  })
}

async function updateMovementOfArticle (req, res, next) {
  initConnectionDB(req.session.database)

  const movementOfArticleId = req.query.id
  const movementOfArticle = req.body

  let totalTaxes = 0
  if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
    for (const tax of movementOfArticle.taxes) {
      totalTaxes += tax.taxAmount
    }
  }
  movementOfArticle.markupPriceWithoutVAT = roundNumber(movementOfArticle.salePrice - totalTaxes - movementOfArticle.basePrice)

  await update(req, res, next, movementOfArticleId, movementOfArticle).then(
    movementOfArticle => {
      fileController.writeLog(req, res, next, 200, 'ok')
      return res.status(200).send({ movementOfArticle })
    }
  ).catch(
    err => {
      fileController.writeLog(req, res, next, 500, JSON.stringify(err))
      return res.status(500).send(constants.ERR_SERVER)
    }
  )
}

function updateMovementOfArticleByWhere (req, res, next) {
  initConnectionDB(req.session.database)

  let where
  if (req.query.where) where = JSON.parse(req.query.where)

  if (where) {
    let sort = { _id: -1 }
    if (req.query.sort) sort = JSON.parse(req.query.sort)

    let set = {}
    if (req.query.set) set = JSON.parse(req.query.set)

    const user = new User()
    user._id = req.session.user
    set.updateUser = user
    set.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
    set.operationType = 'U'

    MovementOfArticle.findOneAndUpdate(where, set, { new: true, sort }, (err, movementOfArticleUpdate) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        if (movementOfArticleUpdate) {
          fileController.writeLog(req, res, next, 200, movementOfArticleUpdate._id)
          getMovementOfArticle(req, res, next, movementOfArticleUpdate._id)
        } else {
          fileController.writeLog(req, res, next, 200, { movementOfArticle: null })
          return res.status(200).send({ movementOfArticle: null })
        }
      }
    })
  } else {
    fileController.writeLog(req, res, next, 200, { message: 'Debe filtrar los documentos a actualizar' })
    return res.status(200).send({ message: 'Debe filtrar los documentos a actualizar' })
  }
}

function updateMovementsOfArticlesByWhere (req, res, next) {
  initConnectionDB(req.session.database)

  let where
  if (req.query.where) where = JSON.parse(req.query.where)

  if (where) {
    let sort = { _id: -1 }
    if (req.query.sort) sort = JSON.parse(req.query.sort)

    let set = {}
    if (req.query.set) set = JSON.parse(req.query.set)

    const user = new User()
    user._id = req.session.user
    set.updateUser = user
    set.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
    set.operationType = 'U'

    MovementOfArticle.updateMany(where, set, { new: true, sort }, (err, movementsOfArticlesUpdate) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        if (movementsOfArticlesUpdate) {
          fileController.writeLog(req, res, next, 200, movementsOfArticlesUpdate.length)
          return res.status(200).send({ movementsOfArticles: movementsOfArticlesUpdate })
        } else {
          fileController.writeLog(req, res, next, 200, { movementsOfArticlesUpdate: null })
          return res.status(200).send({ movementsOfArticlesUpdate: null })
        }
      }
    })
  } else {
    fileController.writeLog(req, res, next, 200, { message: 'Debe filtrar los documentos a actualizar' })
    return res.status(200).send({ message: 'Debe filtrar los documentos a actualizar' })
  }
}

async function deleteMovementOfArticle (req, res, next) {
  initConnectionDB(req.session.database)

  const movementOfArticleId = req.query.id

  const where = { _id: movementOfArticleId }

  await updateStockByDelete(req, res, next, where).then(
    result => {
      const user = new User()
      user._id = req.session.user

      const set = {
        $set: {
          updateUser: user._id,
          updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
          operationType: 'D'
        }
      }

      MovementOfArticle.findByIdAndUpdate(movementOfArticleId,
        set, (err, movementOfArticleDeleted) => {
          if (err) {
            fileController.writeLog(req, res, next, 500, err)
            return res.status(500).send(constants.ERR_SERVER)
          } else {
            fileController.writeLog(req, res, next, 200, movementOfArticleDeleted)
            return res.status(200).send({ movementOfArticle: movementOfArticleDeleted })
          }
        })
    }
  ).catch(
    err => {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(constants.ERR_SERVER)
    }
  )
}

async function deleteMovementsOfArticles (req, res, next) {
  initConnectionDB(req.session.database)

  const query = req.query.query

  const user = new User()
  user._id = req.session.user

  const where = JSON.parse(query)

  await updateStockByDelete(req, res, next, where).then(
    result => {
      const set = {
        $set: {
          updateUser: user._id,
          updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
          operationType: 'D'
        }
      }

      MovementOfArticle.update(where, set, { multi: true }, (err, movementsOfArticlesUpdate) => {
        if (err) {
          fileController.writeLog(req, res, next, 500, err)
          return res.status(500).send(constants.ERR_SERVER)
        } else {
          fileController.writeLog(req, res, next, 200, movementsOfArticlesUpdate)
          return res.status(200).send({ movementsOfArticles: movementsOfArticlesUpdate })
        }
      })
    }
  ).catch(
    err => {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(constants.ERR_SERVER)
    }
  )
}

async function deleteMovementsOfArticlesByWhere (req, res, next, query = undefined) {
  initConnectionDB(req.session.database)

  return new Promise(async (resolve, reject) => {
    let where
    try {
      where = JSON.parse(query)
    } catch (err) {
      fileController.writeLog(req, res, next, 500, query)
      fileController.writeLog(req, res, next, 500, err)
      reject(err)
    }

    await updateStockByDelete(req, res, next, where).then(
      async result => {
        const user = new User()
        user._id = req.session.user

        const set = {
          $set: {
            updateUser: user._id,
            updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
            operationType: 'D'
          }
        }

        await MovementOfArticle.update(where, set, { multi: true }, (err, movementsOfArticlesUpdate) => {
          if (err) {
            reject(err)
          } else {
            resolve(movementsOfArticlesUpdate)
          }
        })
      }
    ).catch(
      err => {
        reject(err)
      }
    )
  })
}

async function updateStockByDelete (req, res, next, query = undefined) {
  return new Promise(async (resolve, reject) => {
    initConnectionDB(req.session.database)

    await MovementOfArticle.find(query)
      .exec(async (err, movementsOfArticles) => {
        if (err) {
          reject(err)
        } else {
          if (!movementsOfArticles || movementsOfArticles.length === 0) {
            resolve(movementsOfArticles)
          } else {
            for (const mov of movementsOfArticles) {
              if (mov.quantityForStock !== 0) {
                await updateArticleStock(req, res, next, mov).then(
                  async result => {
                    mov.quantityForStock = 0
                    await update(req, res, next, mov._id, mov).then(
                      movementOfArticle => {
                      }
                    ).catch(
                      err => {
                        reject(err)
                      }
                    )
                  }
                ).catch(
                  err => {
                    reject(err)
                  }
                )
              }
            }
            resolve(movementsOfArticles)
          }
        }
      })
  })
}

async function updateArticleStock (req, res, next, movementOfArticle = undefined) {
  return new Promise(async (resolve, reject) => {
    initConnectionDB(req.session.database)

    let json = '{"$and":[{"operationType": {"$ne": "D"}},'
    json = json + '{"deposit": "' + movementOfArticle.deposit + '"},'
    json = json + '{"article": "' + movementOfArticle.article + '"}]}'
    let where
    try {
      where = JSON.parse(json)

      await ArticleStock.find(where)
        .exec(async (err, articleStocks) => {
          if (err) {
            reject(err)
          } else if (articleStocks && articleStocks.length > 0) {
            articleStocks[0].realStock -= movementOfArticle.quantityForStock
            await ArticleStockController.update(req, res, next, articleStocks[0]._id, articleStocks[0]).then(
              articleStock => {
                resolve(articleStock)
              }
            ).catch(
              err => {
                reject(err)
              }
            )
          }
        })
    } catch (err) {
      reject(err)
    }
  })
}

function clearLookups (movementOfArticle) {
  if (movementOfArticle.movementParent && movementOfArticle.movementParent._id && movementOfArticle.movementParent._id !== '') movementOfArticle.movementParent = movementOfArticle.movementParent._id
  if (movementOfArticle.make && movementOfArticle.make._id && movementOfArticle.make._id !== '') movementOfArticle.make = movementOfArticle.make._id
  if (movementOfArticle.category && movementOfArticle.category._id && movementOfArticle.category._id !== '') movementOfArticle.category = movementOfArticle.category._id
  if (movementOfArticle.deposit && movementOfArticle.deposit._id && movementOfArticle.deposit._id !== '') movementOfArticle.deposit = movementOfArticle.deposit._id
  if (movementOfArticle.article && movementOfArticle.article._id && movementOfArticle.article._id !== '') movementOfArticle.article = movementOfArticle.article._id
  if (movementOfArticle.transaction && movementOfArticle.transaction._id && movementOfArticle.transaction._id !== '') movementOfArticle.transaction = movementOfArticle.transaction._id
  if (movementOfArticle.creationUser && movementOfArticle.creationUser._id && movementOfArticle.creationUser._id !== '') movementOfArticle.creationUser = movementOfArticle.creationUser._id
  if (movementOfArticle.updateUser && movementOfArticle.updateUser._id && movementOfArticle.updateUser._id !== '') movementOfArticle.updateUser = movementOfArticle.updateUser._id
  return movementOfArticle
}

function getMovementsOfArticlesV3 (req, res, next) {
  initConnectionDB(req.session.database)

  const queryAggregate = EJSON.parse(JSON.stringify(req.body))

  MovementOfArticle.aggregate(queryAggregate)
    .allowDiskUse(true)
    .then(function (result) {
      fileController.writeLog(req, res, next, 200, result.length)
      return res.status(200).send(result)
    }).catch(err => {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(err)
    })
}

function initConnectionDB (database) {
  const Model = require('./../models/model')

  const MovementOfArticleSchema = require('./../models/movement-of-article')
  MovementOfArticle = new Model('movements-of-article', {
    schema: MovementOfArticleSchema,
    connection: database
  })

  const TransactionSchema = require('./../models/transaction')
  Transaction = new Model('transaction', {
    schema: TransactionSchema,
    connection: database
  })

  const TransactionTypeSchema = require('./../models/transaction-type')
  TransactionType = new Model('transaction-type', {
    schema: TransactionTypeSchema,
    connection: database
  })

  const ArticleSchema = require('./../models/article')
  Article = new Model('article', {
    schema: ArticleSchema,
    connection: database
  })

  const MakeSchema = require('./../models/make')
  Make = new Model('make', {
    schema: MakeSchema,
    connection: database
  })

  const CategorySchema = require('./../models/category')
  Category = new Model('category', {
    schema: CategorySchema,
    connection: database
  })

  const UserSchema = require('./../models/user')
  User = new Model('user', {
    schema: UserSchema,
    connection: database
  })

  const UnitOfMeasurementSchema = require('./../models/unit-of-measurement')
  UnitOfMeasurement = new Model('unit-of-measurement', {
    schema: UnitOfMeasurementSchema,
    connection: database
  })

  const CurrencySchema = require('./../models/currency')
  Currency = new Model('currency', {
    schema: CurrencySchema,
    connection: database
  })

  const TaxSchema = require('./../models/tax')
  Tax = new Model('tax', {
    schema: TaxSchema,
    connection: database
  })

  const DepositSchema = require('./../models/deposit')
  Deposit = new Model('deposit', {
    schema: DepositSchema,
    connection: database
  })

  const LocationSchema = require('./../models/location')
  Location = new Model('location', {
    schema: LocationSchema,
    connection: database
  })

  const ArticleFieldSchema = require('./../models/article-field')
  ArticleField = new Model('article-field', {
    schema: ArticleFieldSchema,
    connection: database
  })

  const BusinessRuleSchema = require('./../models/business-rule')
  BusinessRule = new Model('business-rule', {
    schema: BusinessRuleSchema,
    connection: database
  })

  const AccountSchema = require('./../models/account')
  Account = new Model('account', {
    schema: AccountSchema,
    connection: database
  })

  const ClassificationSchema = require('./../models/classification')
  Classification = new Model('classification', {
    schema: ClassificationSchema,
    connection: database
  })

  const BranchSchema = require('./../models/branch')
  Branch = new Model('branch', {
    schema: BranchSchema,
    connection: database
  })

  const ArticleStockSchema = require('./../models/article-stock')
  ArticleStock = new Model('article-stock', {
    schema: ArticleStockSchema,
    connection: database
  })
}

module.exports = {
  get,
  save,
  update,
  getMovementOfArticle,
  getMovementsOfArticles,
  getMovementsOfArticlesV2,
  getShiftClosing,
  saveMovementOfArticle,
  saveMovementsOfArticles,
  updateMovementOfArticle,
  updateMovementOfArticleByWhere,
  updateMovementsOfArticlesByWhere,
  updateStockByDelete,
  deleteMovementOfArticle,
  deleteMovementsOfArticles,
  deleteMovementsOfArticlesByWhere,
  getMovementsOfArticlesV3
}
