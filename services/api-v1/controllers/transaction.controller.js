'use strict'

const fileController = require('./file.controller')
const TransactionTypeController = require('./transaction-type.controller')
const MovementOfArticleController = require('./movement-of-article.controller')
const constants = require('./../utilities/constants')
const {
  EJSON,
} = require('bson')
const moment = require('moment')
moment.locale('es')
const axios = require('axios').default
const config = require('./../config')

let Transaction
let TransactionType
let CancellationType
let CashBox
let Table
let Employee
let Company
let Turn
let VATCondition
let Printer
let User
let MovementOfArticle
let MovementOfCash
let EmployeeType
let PaymentMethod
let IdentificationType
let UseOfCFDI
let RelationType
let MovementOfCancellation
let Currency
let Tax
let Branch
let Deposit
let Transport
let PriceList
let EmailTemplate
let ShipmentMethod
let Address
let CompanyGroup
let State
let Application
let Account
let BusinessRule

// ASYNC
function get (database, transactionId) {
  return new Promise((resolve, reject) => {
    initConnectionDB(database)

    Transaction.findById(transactionId, (err, transaction) => {
      if (err) {
        reject(err)
      } else {
        resolve(transaction)
      }
    }).populate({
      path: 'cashBox',
      model: CashBox,
    }).populate({
      path: 'account',
      model: Account,
    }).populate({
      path: 'creationUser',
      model: User,
    }).populate({
      path: 'updateUser',
      model: User,
    }).populate({
      path: 'table',
      model: Table,
    }).populate({
      path: 'turnOpening',
      model: Turn,
    }).populate({
      path: 'turnClosing',
      model: Turn,
    }).populate({
      path: 'employeeOpening',
      model: Employee,
    }).populate({
      path: 'employeeClosing',
      model: Employee,
    }).populate({
      path: 'useOfCFDI',
      model: UseOfCFDI,
    }).populate({
      path: 'relationType',
      model: RelationType,
    }).populate({
      path: 'company',
      model: Company,
      populate: [{
        path: 'vatCondition',
        model: VATCondition,
      }, {
        path: 'priceList',
        model: PriceList,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }, {
        path: 'state',
        model: State,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }, {
        path: 'group',
        model: CompanyGroup,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }, {
        path: 'transport',
        model: Transport,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }, {
        path: 'identificationType',
        model: IdentificationType,
      }],
    }).populate({
      path: 'type',
      model: TransactionType,
      populate: [{
        path: 'defectPrinter',
        model: Printer,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }, {
        path: 'requestEmployee',
        model: EmployeeType,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }, {
        path: 'application',
        model: Application,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }, {
        path: 'defectEmailTemplate',
        model: EmailTemplate,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }, {
        path: 'fastPayment',
        model: PaymentMethod,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }],
    }).populate({
      path: 'currency',
      model: Currency,
    }).populate({
      path: 'taxes.tax',
      model: Tax,
    }).populate({
      path: 'branchOrigin',
      model: Branch,
    }).populate({
      path: 'branchDestination',
      model: Branch,
    }).populate({
      path: 'depositOrigin',
      model: Deposit,
      populate: [{
        path: 'branch',
        model: Branch,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }],
    }).populate({
      path: 'depositDestination',
      model: Deposit,
      populate: [{
        path: 'branch',
        model: Branch,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }],
    }).populate({
      path: 'shipmentMethod',
      model: ShipmentMethod,
    }).populate({
      path: 'transport',
      model: Transport,
    }).populate({
      path: 'priceList',
      model: PriceList,
    }).populate({
      path: 'deliveryAddress',
      model: Address,
    }).populate({
      path: 'businessRules',
      model: BusinessRule,
    })
  })
}

// NO ASYNC
function getTransaction (req, res, next, id = undefined) {
  initConnectionDB(req.session.database)

  let transactionId
  if (id) {
    transactionId = id
  } else {
    transactionId = req.query.id
  }

  get(req.session.database, transactionId).then(
    transaction => {
      if (!transaction || transaction.operationType === 'D') {
        fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND)
        return res.status(404).send(constants.NO_DATA_FOUND)
      } else {
        fileController.writeLog(req, res, next, 200, transaction)
        return res.status(200).send({
          transaction,
        })
      }
    },
  ).catch(
    err => {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(constants.ERR_SERVER)
    },
  )
}

function getTransactions (req, res, next) {
  initConnectionDB(req.session.database)

  // http://localhost:3000/api/articles/limit=6&skip=0&select=description,number&sort="number":1&where="description":"s"
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

  Transaction.find(where)
    .limit(limit)
    .select(select)
    .sort(sort)
    .skip(skip)
    .populate({
      path: 'cashBox',
      model: CashBox,
    }).populate({
      path: 'creationUser',
      model: User,
    }).populate({
      path: 'updateUser',
      model: User,
    }).populate({
      path: 'table',
      model: Table,
    }).populate({
      path: 'turnOpening',
      model: Turn,
    }).populate({
      path: 'turnClosing',
      model: Turn,
    }).populate({
      path: 'employeeOpening',
      model: Employee,
    }).populate({
      path: 'employeeClosing',
      model: Employee,
    }).populate({
      path: 'useOfCFDI',
      model: UseOfCFDI,
    }).populate({
      path: 'relationType',
      model: RelationType,
    }).populate({
      path: 'company',
      model: Company,
      populate: [{
        path: 'vatCondition',
        model: VATCondition,
      }, {
        path: 'identificationType',
        model: IdentificationType,
      }],
    }).populate({
      path: 'type',
      model: TransactionType,
      populate: [{
        path: 'defectPrinter',
        model: Printer,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }, {
        path: 'requestEmployee',
        model: EmployeeType,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }, {
        path: 'defectEmailTemplate',
        model: EmailTemplate,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }, {
        path: 'fastPayment',
        model: PaymentMethod,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }],
    }).populate({
      path: 'currency',
      model: Currency,
    }).populate({
      path: 'taxes.tax',
      model: Tax,
    }).populate({
      path: 'branchOrigin',
      model: Branch,
    }).populate({
      path: 'branchDestination',
      model: Branch,
    }).populate({
      path: 'depositOrigin',
      model: Deposit,
    }).populate({
      path: 'depositDestination',
      model: Deposit,
    }).populate({
      path: 'account',
      model: Account,
    }).populate({
      path: 'transport',
      model: Transport,
    }).populate({
      path: 'shipmentMethod',
      model: ShipmentMethod,
    }).populate({
      path: 'price-list',
      model: PriceList,
    }).populate({
      path: 'deliveryAddress',
      model: Address,
    }).populate({
      path: 'businessRules',
      model: BusinessRule,
    })
    .exec((err, transactions) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        if (transactions) {
          fileController.writeLog(req, res, next, 200, transactions.length)
        }
        return res.status(200).send({
          transactions,
        })
      }
    })
}

function getLastNumberTransactions (database, typeId, origin, letter) {
  return new Promise((resolve, reject) => {
    initConnectionDB(database)
    let number = 1
    Transaction.find({
      operationType: {
        $ne: 'D',
      },
      type: typeId,
      origin,
      letter,
    })
      .limit(1)
      .sort({
        number: -1,
      })
      .exec((err, transactions) => {
        if (err) {
          reject(err)
        } else {
          if (transactions && transactions.length > 0) {
            number = transactions[0].number + 1
          }
          resolve(number)
        }
      })
  })
}

function getLastOrderNumberTransactions (database, typeId) {
  return new Promise((resolve, reject) => {
    initConnectionDB(database)
    let orderNumber = 1
    Transaction.find({
      operationType: {
        $ne: 'D',
      },
      type: typeId,
    }).populate({
      path: 'type',
      model: TransactionType,
    })
      .limit(1)
      .sort({
        orderNumber: -1,
      })
      .exec((err, transactions) => {
        if (err) {
          reject(err)
        } else {
          if (transactions && transactions.length > 0) {
            orderNumber = transactions[0].orderNumber + 1
            if (orderNumber > transactions[0].type.maxOrderNumber) {
              orderNumber = 1
            }
          }

          resolve(orderNumber)
        }
      })
  })
}

function getTransactionsByMovement (req, res, next) {
  initConnectionDB(req.session.database)

  // http://localhost:3000/api/articles/limit=6&skip=0&select=description,number&sort="number":1&where="description":"s"

  const movement = req.params.movement
  let where = JSON.parse('{"operationType": {"$ne": "D"}}')
  let limit = 400
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

  Transaction.find(where)
    .limit(limit)
    .select(select)
    .sort(sort)
    .skip(skip)
    .populate({
      path: 'cashBox',
      model: CashBox,
    }).populate({
      path: 'creationUser',
      model: User,
    }).populate({
      path: 'updateUser',
      model: User,
    }).populate({
      path: 'table',
      model: Table,
    }).populate({
      path: 'turnOpening',
      model: Turn,
    }).populate({
      path: 'turnClosing',
      model: Turn,
    }).populate({
      path: 'employeeOpening',
      model: Employee,
    }).populate({
      path: 'employeeClosing',
      model: Employee,
    }).populate({
      path: 'useOfCFDI',
      model: UseOfCFDI,
    }).populate({
      path: 'relationType',
      model: RelationType,
    }).populate({
      path: 'company',
      model: Company,
      populate: [{
        path: 'vatCondition',
        model: VATCondition,
      }, {
        path: 'identificationType',
        model: IdentificationType,
      }],
    }).populate({
      path: 'type',
      model: TransactionType,
      match: {
        transactionMovement: movement,
      },
      populate: [{
        path: 'defectPrinter',
        model: Printer,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }, {
        path: 'requestEmployee',
        model: EmployeeType,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }, {
        path: 'defectEmailTemplate',
        model: EmailTemplate,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }, {
        path: 'fastPayment',
        model: PaymentMethod,
        match: {
          operationType: {
            $ne: 'D',
          },
        },
      }],
    }).populate({
      path: 'currency',
      model: Currency,
    }).populate({
      path: 'taxes.tax',
      model: Tax,
    }).populate({
      path: 'branchOrigin',
      model: Branch,
    }).populate({
      path: 'branchDestination',
      model: Branch,
    }).populate({
      path: 'depositOrigin',
      model: Deposit,
    }).populate({
      path: 'depositDestination',
      model: Deposit,
    }).populate({
      path: 'transport',
      model: Transport,
    }).populate({
      path: 'shipmentMethod',
      model: ShipmentMethod,
    })
    .populate({
      path: 'price-list',
      model: PriceList,
    }).populate({
      path: 'businessRules',
      model: BusinessRule,
    })
    .exec((err, transactions) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        if (!transactions) {
          fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND)
          return res.status(404).send(constants.NO_DATA_FOUND)
        } else {
          const transactionsAux = []
          for (const transaction of transactions) {
            if (transaction.type) {
              transactionsAux.push(transaction)
            }
          }
          if (transactionsAux.length === 0) {
            fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND)
            return res.status(200).send({
              message: constants.NO_DATA_FOUND,
            })
          } else {
            if (transactionsAux) {
              fileController.writeLog(req, res, next, 200, transactionsAux.length)
            }
            return res.status(200).send({
              transactions: transactionsAux,
            })
          }
        }
      }
    })
}

function getTransactionsV2 (req, res, next) {
  initConnectionDB(req.session.database)

  let queryAggregate = []
  let group

  if (req.query && req.query !== {}) {
    let error

    let project = req.query.project
    if (project && project !== {} && project !== '{}') {
      try {
        project = JSON.parse(project)

        if (searchPropertyOfArray(project, 'taxes')) {
          queryAggregate.push({
            $lookup: {
              from: 'taxes',
              localField: 'taxes.tax',
              foreignField: '_id',
              as: 'taxDetails',
            },
          }, {
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
                          $arrayElemAt: [{
                            $filter: {
                              input: '$taxDetails',
                              as: 'td',
                              cond: {
                                $eq: ['$$td._id', '$$t.tax'],
                              },
                            },
                          }, 0],
                        },
                      },
                    ],
                  },
                },
              },
            },
          })
        }

        if (searchPropertyOfArray(project, 'type.')) {
          queryAggregate.push({
            $lookup: {
              from: 'transaction-types',
              foreignField: '_id',
              localField: 'type',
              as: 'type',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$type',
              preserveNullAndEmptyArrays: true,
            },
          })

          if (searchPropertyOfArray(project, 'type.defectPrinter')) {
            queryAggregate.push({
              $lookup: {
                from: 'printers',
                let: {
                  pid: '$type.defectPrinter',
                },
                pipeline: [{
                  $match: {
                    $expr: {
                      $and: [{
                        $eq: ['$_id', '$$pid'],
                      }, {
                        $ne: ['$operationType', 'D'],
                      }],
                    },
                  },
                }],
                as: 'type.defectPrinter',
              },
            })
            queryAggregate.push({
              $unwind: {
                path: '$type.defectPrinter',
                preserveNullAndEmptyArrays: true,
              },
            })
          }

          if (searchPropertyOfArray(project, 'type.defectEmailTemplate')) {
            queryAggregate.push({
              $lookup: {
                from: 'email-templates',
                let: {
                  pid: '$type.defectEmailTemplate',
                },
                pipeline: [{
                  $match: {
                    $expr: {
                      $and: [{
                        $eq: ['$_id', '$$pid'],
                      }, {
                        $ne: ['$operationType', 'D'],
                      }],
                    },
                  },
                }],
                as: 'type.defectEmailTemplate',
              },
            })
            queryAggregate.push({
              $unwind: {
                path: '$type.defectEmailTemplate',
                preserveNullAndEmptyArrays: true,
              },
            })
          }

          if (searchPropertyOfArray(project, 'type.requestEmployee')) {
            queryAggregate.push({
              $lookup: {
                from: 'employees',
                let: {
                  pid: '$type.requestEmployee',
                },
                pipeline: [{
                  $match: {
                    $expr: {
                      $and: [{
                        $eq: ['$_id', '$$pid'],
                      }, {
                        $ne: ['$operationType', 'D'],
                      }],
                    },
                  },
                }],
                as: 'type.requestEmployee',
              },
            })
            queryAggregate.push({
              $unwind: {
                path: '$type.defectPrinter',
                preserveNullAndEmptyArrays: true,
              },
            })
          }

          if (searchPropertyOfArray(project, 'type.fastPayment')) {
            queryAggregate.push({
              $lookup: {
                from: 'payment-methods',
                let: {
                  pid: '$type.fastPayment',
                },
                pipeline: [{
                  $match: {
                    $expr: {
                      $and: [{
                        $eq: ['$_id', '$$pid'],
                      }, {
                        $ne: ['$operationType', 'D'],
                      }],
                    },
                  },
                }],
                as: 'type.fastPayment',
              },
            })
            queryAggregate.push({
              $unwind: {
                path: '$type.defectPrinter',
                preserveNullAndEmptyArrays: true,
              },
            })
          }
        }

        if (searchPropertyOfArray(project, 'cashBox.')) {
          queryAggregate.push({
            $lookup: {
              from: 'cash-boxes',
              foreignField: '_id',
              localField: 'cashBox',
              as: 'cashBox',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$cashBox',
              preserveNullAndEmptyArrays: true,
            },
          })
        }

        if (searchPropertyOfArray(project, 'table.')) {
          queryAggregate.push({
            $lookup: {
              from: 'tables',
              foreignField: '_id',
              localField: 'table',
              as: 'table',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$table',
              preserveNullAndEmptyArrays: true,
            },
          })
        }

        if (searchPropertyOfArray(project, 'employeeOpening.')) {
          queryAggregate.push({
            $lookup: {
              from: 'employees',
              foreignField: '_id',
              localField: 'employeeOpening',
              as: 'employeeOpening',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$employeeOpening',
              preserveNullAndEmptyArrays: true,
            },
          })
        }

        if (searchPropertyOfArray(project, 'employeeClosing.')) {
          queryAggregate.push({
            $lookup: {
              from: 'employees',
              foreignField: '_id',
              localField: 'employeeClosing',
              as: 'employeeClosing',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$employeeClosing',
              preserveNullAndEmptyArrays: true,
            },
          })
        }

        if (searchPropertyOfArray(project, 'company.')) {
          queryAggregate.push({
            $lookup: {
              from: 'companies',
              foreignField: '_id',
              localField: 'company',
              as: 'company',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$company',
              preserveNullAndEmptyArrays: true,
            },
          })

          if (searchPropertyOfArray(project, 'company.vatCondition.')) {
            queryAggregate.push({
              $lookup: {
                from: 'vat-conditions',
                foreignField: '_id',
                localField: 'company.vatCondition',
                as: 'company.vatCondition',
              },
            })
            queryAggregate.push({
              $unwind: {
                path: '$company.vatCondition',
                preserveNullAndEmptyArrays: true,
              },
            })
          }

          if (searchPropertyOfArray(project, 'company.identificationType.')) {
            queryAggregate.push({
              $lookup: {
                from: 'identification-types',
                foreignField: '_id',
                localField: 'company.identificationType',
                as: 'company.identificationType',
              },
            })
            queryAggregate.push({
              $unwind: {
                path: '$company.identificationType',
                preserveNullAndEmptyArrays: true,
              },
            })
          }

          if (searchPropertyOfArray(project, 'company.employee.')) {
            queryAggregate.push({
              $lookup: {
                from: 'employees',
                foreignField: '_id',
                localField: 'company.employee',
                as: 'company.employee',
              },
            })
            queryAggregate.push({
              $unwind: {
                path: '$company.employee',
                preserveNullAndEmptyArrays: true,
              },
            })
          }

          if (searchPropertyOfArray(project, 'company.group.')) {
            queryAggregate.push({
              $lookup: {
                from: 'company-groups',
                foreignField: '_id',
                localField: 'company.group',
                as: 'company.group',
              },
            })
            queryAggregate.push({
              $unwind: {
                path: '$company.group',
                preserveNullAndEmptyArrays: true,
              },
            })
          }

          if (searchPropertyOfArray(project, 'company.state.')) {
            queryAggregate.push({
              $lookup: {
                from: 'states',
                foreignField: '_id',
                localField: 'company.state',
                as: 'company.state',
              },
            })
            queryAggregate.push({
              $unwind: {
                path: '$company.state',
                preserveNullAndEmptyArrays: true,
              },
            })
          }
        }

        if (searchPropertyOfArray(project, 'turnOpening.')) {
          queryAggregate.push({
            $lookup: {
              from: 'turns',
              foreignField: '_id',
              localField: 'turnOpening',
              as: 'turnOpening',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$turnOpening',
              preserveNullAndEmptyArrays: true,
            },
          })
        }

        if (searchPropertyOfArray(project, 'turnClosing.')) {
          queryAggregate.push({
            $lookup: {
              from: 'turns',
              foreignField: '_id',
              localField: 'turnClosing',
              as: 'turnClosing',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$turnClosing',
              preserveNullAndEmptyArrays: true,
            },
          })
        }

        if (searchPropertyOfArray(project, 'currency.')) {
          queryAggregate.push({
            $lookup: {
              from: 'currencies',
              foreignField: '_id',
              localField: 'currency',
              as: 'currency',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$currency',
              preserveNullAndEmptyArrays: true,
            },
          })
        }

        if (searchPropertyOfArray(project, 'branchOrigin.')) {
          queryAggregate.push({
            $lookup: {
              from: 'branches',
              foreignField: '_id',
              localField: 'branchOrigin',
              as: 'branchOrigin',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$branchOrigin',
              preserveNullAndEmptyArrays: true,
            },
          })
        }

        if (searchPropertyOfArray(project, 'branchDestination.')) {
          queryAggregate.push({
            $lookup: {
              from: 'branches',
              foreignField: '_id',
              localField: 'branchDestination',
              as: 'branchDestination',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$branchDestination',
              preserveNullAndEmptyArrays: true,
            },
          })
        }

        if (searchPropertyOfArray(project, 'depositOrigin.')) {
          queryAggregate.push({
            $lookup: {
              from: 'deposits',
              foreignField: '_id',
              localField: 'depositOrigin',
              as: 'depositOrigin',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$depositOrigin',
              preserveNullAndEmptyArrays: true,
            },
          })

          if (searchPropertyOfArray(project, 'depositOrigin.branch.')) {
            queryAggregate.push({
              $lookup: {
                from: 'branches',
                foreignField: '_id',
                localField: 'depositOrigin.branch',
                as: 'depositOrigin.branch',
              },
            })
            queryAggregate.push({
              $unwind: {
                path: '$depositOrigin.branch',
                preserveNullAndEmptyArrays: true,
              },
            })
          }
        }

        if (searchPropertyOfArray(project, 'depositDestination.')) {
          queryAggregate.push({
            $lookup: {
              from: 'deposits',
              foreignField: '_id',
              localField: 'depositDestination',
              as: 'depositDestination',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$depositDestination',
              preserveNullAndEmptyArrays: true,
            },
          })

          if (searchPropertyOfArray(project, 'depositDestination.branch.')) {
            queryAggregate.push({
              $lookup: {
                from: 'branches',
                foreignField: '_id',
                localField: 'depositDestination.branch',
                as: 'depositDestination.branch',
              },
            })
            queryAggregate.push({
              $unwind: {
                path: '$depositDestination.branch',
                preserveNullAndEmptyArrays: true,
              },
            })
          }
        }

        if (searchPropertyOfArray(project, 'transport.')) {
          queryAggregate.push({
            $lookup: {
              from: 'transports',
              foreignField: '_id',
              localField: 'transport',
              as: 'transport',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$transport',
              preserveNullAndEmptyArrays: true,
            },
          })
        }

        if (searchPropertyOfArray(project, 'priceList.')) {
          queryAggregate.push({
            $lookup: {
              from: 'price-lists',
              foreignField: '_id',
              localField: 'priceList',
              as: 'priceList',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$priceList',
              preserveNullAndEmptyArrays: true,
            },
          })
        }

        if (searchPropertyOfArray(project, 'shipmentMethod.')) {
          queryAggregate.push({
            $lookup: {
              from: 'shipment-methods',
              foreignField: '_id',
              localField: 'shipmentMethod',
              as: 'shipmentMethod',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$shipmentMethod',
              preserveNullAndEmptyArrays: true,
            },
          })
        }

        if (searchPropertyOfArray(project, 'deliveryAddress.')) {
          queryAggregate.push({
            $lookup: {
              from: 'addresses',
              foreignField: '_id',
              localField: 'deliveryAddress',
              as: 'deliveryAddress',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$deliveryAddress',
              preserveNullAndEmptyArrays: true,
            },
          })
        }

        if (searchPropertyOfArray(project, 'creationUser.')) {
          queryAggregate.push({
            $lookup: {
              from: 'users',
              foreignField: '_id',
              localField: 'creationUser',
              as: 'creationUser',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$creationUser',
              preserveNullAndEmptyArrays: true,
            },
          })
        }

        if (searchPropertyOfArray(project, 'updateUser.')) {
          queryAggregate.push({
            $lookup: {
              from: 'users',
              foreignField: '_id',
              localField: 'updateUser',
              as: 'updateUser',
            },
          })
          queryAggregate.push({
            $unwind: {
              path: '$updateUser',
              preserveNullAndEmptyArrays: true,
            },
          })
        }

        const sort = req.query.sort
        if (sort && sort !== {} && sort !== '{}') {
          try {
            queryAggregate.push({
              $sort: JSON.parse(sort),
            })
          } catch (err) {
            error = err
          }
        }

        queryAggregate.push({
          $project: project,
        })
      } catch (err) {
        error = err
      }
    } else {
      const sort = req.query.sort
      if (sort && sort !== {} && sort !== '{}') {
        try {
          queryAggregate.push({
            $sort: JSON.parse(sort),
          })
        } catch (err) {
          error = err
        }
      }
    }

    const match = req.query.match
    if (match && match !== '{}' && match !== {}) {
      try {
        queryAggregate.push({
          $match: JSON.parse(match),
        })
      } catch (err) {
        error = err
      }
    }

    group = req.query.group
    if (group && group !== '{}' && group !== {}) {
      try {
        queryAggregate.push({
          $group: JSON.parse(group),
        })
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
            if (searchPropertyOfArray(JSON.parse(group), 'transactions')) {
              projectGroup = `{ "transactions": { "$slice": ["$transactions", ${skip}, ${limit}] }`
            } else {
              projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`
            }
            for (const prop of Object.keys(JSON.parse(group))) {
              if (prop !== 'transactions' && prop !== 'items') {
                projectGroup += `, "${prop}": 1`
              }
            }
            projectGroup += '}'
            queryAggregate.push({
              $project: JSON.parse(projectGroup),
            })
          } else {
            queryAggregate.push({
              $limit: limit,
            })
            queryAggregate.push({
              $skip: skip,
            })
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

  Transaction.aggregate(queryAggregate)
    .allowDiskUse(true)
    .then(function (result) {
      fileController.writeLog(req, res, next, 200, result.length)
      if (result.length > 0) {
        if (group && group !== '{}' && group !== {}) {
          return res.status(200).send(result)
        } else {
          return res.status(200).send({
            transactions: result,
          })
        }
      } else {
        if (group && group !== '{}' && group !== {}) {
          return res.status(200).send({
            count: 0,
            transactions: [],
          })
        } else {
          return res.status(200).send({
            transactions: [],
          })
        }
      }
    }).catch(err => {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(err)
    })
}

function getTransactionsV3 (req, res, next) {
  initConnectionDB(req.session.database)

  const queryAggregate = EJSON.parse(JSON.stringify(req.body))

  Transaction.aggregate(queryAggregate)
    .allowDiskUse(true)
    .then(function (result) {
      fileController.writeLog(req, res, next, 200, result.length)
      return res.status(200).send(result)
    }).catch(err => {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(err)
    })
}

function searchPropertyOfArray (array, value) {
  let n = false
  for (const a of Object.keys(array)) {
    if (!n) n = a.includes(value)
  }
  return n
}

async function saveTransaction (req, res, next) {
  try {
    initConnectionDB(req.session.database)

    const transaction = new Transaction()
    const params = req.body

    transaction.origin = params.origin
    transaction.letter = params.letter
    transaction.number = params.number
    transaction.date = params.date
    transaction.startDate = params.startDate
    transaction.endDate = params.endDate
    transaction.expirationDate = params.expirationDate
    transaction.VATPeriod = params.VATPeriod
    transaction.observation = params.observation
    transaction.basePrice = params.basePrice
    transaction.exempt = params.exempt
    transaction.discountAmount = params.discountAmount
    transaction.discountPercent = params.discountPercent
    transaction.commissionAmount = params.commissionAmount
    transaction.administrativeExpenseAmount = params.administrativeExpenseAmount
    transaction.otherExpenseAmount = params.otherExpenseAmount
    transaction.taxes = params.taxes
    transaction.totalPrice = params.totalPrice
    transaction.roundingAmount = params.roundingAmount
    transaction.diners = params.diners
    transaction.orderNumber = params.orderNumber
    transaction.state = params.state
    transaction.madein = params.madein
    transaction.balance = params.balance
    transaction.CAE = params.CAE // AR
    transaction.CAEExpirationDate = params.CAEExpirationDate // AR
    transaction.stringSAT = params.stringSAT // MX
    transaction.CFDStamp = params.CFDStamp // MX
    transaction.SATStamp = params.SATStamp // MX
    transaction.UUID = params.UUID
    transaction.currency = params.currency
    transaction.quotation = params.quotation
    transaction.relationType = params.relationType // MX
    transaction.useOfCFDI = params.useOfCFDI // MX
    transaction.type = params.type
    transaction.cashBox = params.cashBox
    transaction.table = params.table
    transaction.employeeOpening = params.employeeOpening
    transaction.employeeClosing = params.employeeClosing
    transaction.company = params.company
    transaction.turnOpening = params.turnOpening
    transaction.turnClosing = params.turnClosing
    transaction.branchOrigin = params.branchOrigin
    transaction.branchDestination = params.branchDestination
    transaction.depositOrigin = params.depositOrigin
    transaction.depositDestination = params.depositDestination
    transaction.transport = params.transport
    transaction.shipmentMethod = params.shipmentMethod
    transaction.deliveryAddress = params.deliveryAddress
    transaction.paymentMethodEcommerce = params.paymentMethodEcommerce
    transaction.wooId = params.wooId
    transaction.tiendaNubeId = params.tiendaNubeId
    transaction.declaredValue = params.declaredValue
    transaction.package = params.package
    transaction.account = params.account
    transaction.optionalAFIP = params.optionalAFIP
    transaction.businessRules = params.businessRules

    const user = new User()
    user._id = req.session.user
    transaction.creationUser = user
    transaction.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
    transaction.operationType = 'C'

    if (!transaction.type) {
      fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA)
      throw new Error(constants.COMPLETE_ALL_THE_DATA)
    }

    const transactionType = await TransactionTypeController.getAsync(req.session.database, transaction.type)

    if (!transaction.number) transaction.number = await getLastNumberTransactions(req.session.database, transactionType._id, transaction.origin, transaction.letter)
    if (transactionType.maxOrderNumber > 0) transaction.orderNumber = await getLastOrderNumberTransactions(req.session.database, transactionType._id)

    transaction.tracking = [{
      date: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
      state: transaction.state,
    }]
    transaction.save(async (err, transactionSaved) => {
      if (err) {
        throw err
      } else {
        if (transactionType.orderNumber >= 1) await setOrderNumberTransactions(req, transactionSaved)
        getTransaction(req, res, next, transactionSaved._id)
      }
    })
  } catch (err) {
    fileController.writeLog(req, res, next, 500, err)
    return res.status(500).send(err)
  }
}

function setOrderNumberTransactions (req, transaction) {
  return new Promise((resolve, reject) => {
    initConnectionDB(req.session.database)
    axios.post(`${config.BASE_URL_V8}/set-order-number`,
      { transaction },
      { headers: { Authorization: req.headers.authorization } },
    ).then((response) => {
      resolve(true)
    }).catch((error) => reject(error))
  })
}

async function updateTransaction (req, res, next) {
  try {
    const MovementOfArticleController = require('./movement-of-article.controller')

    initConnectionDB(req.session.database)

    const transactionId = req.query.id
    const transaction = req.body

    if (!transaction) throw new Error('Debe enviar una transacción a actualizar')

    const user = new User()
    user._id = req.session.user
    transaction.updateUser = user
    transaction.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
    transaction.operationType = 'U'

    if (transaction.state === 'Anulado' && (transaction.CAE || transaction.SATStamp || transaction.stringSAT || transaction.CFDStamp)) throw new Error('No se puede anular una transacción ya certificada.')

    if (transaction.number === 0) throw new Error('El número de documento no puede ser 0.')

    const oldTransaction = await get(req.session.database, transactionId)

    if (!oldTransaction) throw new Error('No se encuentra la transacción a actualizar')
    if (oldTransaction.state === 'Entregado' && transaction.state === 'Armando') throw new Error('No se puede volver al estado de armando')
    if (oldTransaction.CAE && !transaction.CAE) throw new Error('No se puede volver al estado de CAE')

    const transactionType = await TransactionTypeController.getAsync(req.session.database, oldTransaction.type._id)

    const where = {
      operationType: { $ne: 'D' },
      origin: transaction.origin,
      letter: transaction.letter,
      number: transaction.number,
      type: transaction.type._id || transaction.type.toString(),
      _id: { $ne: transactionId },
    }

    if (transactionType && transactionType.transactionMovement === 'Compra') {
      where.state = { $ne: 'Anulado' }
      if (transaction.company) {
        where.company = transaction.company._id || transaction.company.toString()
      }
    }

    Transaction.find(where)
      .populate({
        path: 'type',
        model: TransactionType,
      }).exec(async (err, transactions) => {
        if (err) throw err
        if (!transactions || transactions.length === 0) {
          if (transaction.state === 'Anulado') {
            // SI PASA A ESTADO ANULADO, VOLVEMOS EL STOCK DE LOS PRODUCTOS
            await MovementOfArticleController.updateStockByDelete(req, res, next, { transaction: transaction._id })
          }

          transaction.tracking = updateTracking(transaction)
          if (transaction.state === 'Pendiente de pago') verifyPayments()
          // SI VOLVIO TODOS LOS STOCK OK, ACTUALIZAMOS LA TRANSACCION
          Transaction.findByIdAndUpdate(transactionId, clearLookups(transaction), {
            new: true,
          }, async (err, transactionUpdated) => {
            if (err) throw err
            if (transaction.state === 'Anulado') {
              await deleteMovementsOfCashsesByTransaction(req, res, next, transactionId)
            }
            return res.status(200).send({
              transaction: await get(req.session.database, transactionId),
            })
          })
        } else {
          if ((transaction.type && transaction.type.electronics) || transaction.state === 'Anulado' || transaction.type.automaticNumbering) {
            transaction.tracking = updateTracking(transaction)
            if (transaction.state === 'Pendiente de pago') verifyPayments()
            Transaction.findByIdAndUpdate(transactionId, clearLookups(transaction), {
              new: true,
            }, async (err, transactionUpdated) => {
              if (err) throw err
              else {
                if (transactionUpdated && transactionUpdated.state === 'Pendiente de pago') {
                  verifyPayments()
                }
                if (transaction.state === 'Anulado') {
                  await deleteMovementsOfCashsesByTransaction(req, res, next, transactionId)
                }
                return res.status(200).send({
                  transaction: await get(req.session.database, transactionId),
                })
              }
            })
          } else {
            throw new Error('La transacción \"' + transaction.origin + '-' + transaction.letter + '-' + transaction.number + '\" ya existe')
          }
        }
      })
  } catch (error) {
    const status = error.status || 500
    fileController.writeLog(req, res, next, status, error)
    res.status(status).send({ message: error.message })
  }
}

function verifyPayments () {
  setTimeout(() => {
    const MercadopagoController = require('./mercadopago.controller')
    MercadopagoController.verifyPayments()
  }, 600000)
}

function updateTracking (transaction) {
  if (transaction.tracking && transaction.tracking.length > 0) {
    if (transaction.state !== transaction.tracking[transaction.tracking.length - 1].state) {
      transaction.tracking.push({
        date: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
        state: transaction.state,
      })
    }
  } else {
    transaction.tracking = [{
      date: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
      state: transaction.state,
    }]
  }
  return transaction.tracking
}

function clearLookups (transaction) {
  if (transaction.currency && transaction.currency._id && transaction.currency._id !== '') transaction.currency = transaction.currency._id
  if (transaction.relationType && transaction.relationType._id && transaction.relationType._id !== '') transaction.relationType = transaction.relationType._id
  if (transaction.useOfCFDI && transaction.useOfCFDI._id && transaction.useOfCFDI._id !== '') transaction.useOfCFDI = transaction.useOfCFDI._id
  if (transaction.type && transaction.type._id && transaction.type._id !== '') transaction.type = transaction.type._id
  if (transaction.cashBox && transaction.cashBox._id && transaction.cashBox._id !== '') transaction.cashBox = transaction.cashBox._id
  if (transaction.table && transaction.table._id && transaction.table._id !== '') transaction.table = transaction.table._id
  if (transaction.employeeOpening && transaction.employeeOpening._id && transaction.employeeOpening._id !== '') transaction.employeeOpening = transaction.employeeOpening._id
  if (transaction.employeeClosing && transaction.employeeClosing._id && transaction.employeeClosing._id !== '') transaction.employeeClosing = transaction.employeeClosing._id
  if (transaction.branchOrigin && transaction.branchOrigin._id && transaction.branchOrigin._id !== '') transaction.branchOrigin = transaction.branchOrigin._id
  if (transaction.branchDestination && transaction.branchDestination._id && transaction.branchDestination._id !== '') transaction.branchDestination = transaction.branchDestination._id
  if (transaction.depositOrigin && transaction.depositOrigin._id && transaction.depositOrigin._id !== '') transaction.depositOrigin = transaction.depositOrigin._id
  if (transaction.depositDestination && transaction.depositDestination._id && transaction.depositDestination._id !== '') transaction.depositDestination = transaction.depositDestination._id
  if (transaction.company && transaction.company._id && transaction.company._id !== '') transaction.company = transaction.company._id
  if (transaction.transport && transaction.transport._id && transaction.transport._id !== '') transaction.transport = transaction.transport._id
  if (transaction.turnOpening && transaction.turnOpening._id && transaction.turnOpening._id !== '') transaction.turnOpening = transaction.turnOpening._id
  if (transaction.turnClosing && transaction.turnClosing._id && transaction.turnClosing._id !== '') transaction.turnClosing = transaction.turnClosing._id
  if (transaction.priceList && transaction.priceList._id && transaction.priceList._id !== '') transaction.priceList = transaction.priceList._id
  if (transaction.creationUser && transaction.creationUser._id && transaction.creationUser._id !== '') transaction.creationUser = transaction.creationUser._id
  if (transaction.updateUser && transaction.updateUser._id && transaction.updateUser._id !== '') transaction.updateUser = transaction.updateUser._id
  return transaction
}

async function deleteTransaction (req, res, next) {
  initConnectionDB(req.session.database)

  const transactionId = req.query.id
  let isValid = false

  const user = new User()
  user._id = req.session.user

  let transaction = new Transaction()
  if (transactionId && transaction !== 'undefined') {
    await get(req.session.database, transactionId).then(
      result => {
        if (result) {
          transaction = result
          isValid = true
        } else {
          isValid = false
          fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND)
          return res.status(200).send({
            message: constants.NO_DATA_FOUND,
          })
        }
      },
    ).catch(err => {
      isValid = false
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(err)
    })
  } else {
    isValid = false
    fileController.writeLog(req, res, next, 500, constants.ERR_SERVER)
    return res.status(500).send(constants.ERR_SERVER)
  }

  if (isValid) {
    if (transaction.CAE) {
      fileController.writeLog(req, res, next, 200, 'No se puede eliminar una transacción ya validada por AFIP.')
      return res.status(200).send({
        message: 'No se puede eliminar una transacción ya validada por AFIP.',
      })
    }

    if (isValid) {
      const query = '{ "transaction": "' + transactionId + '", "operationType": { "$ne": "D" } }'
      await MovementOfArticleController.deleteMovementsOfArticlesByWhere(req, res, next, query)
        .then(
          async result => {
            if (result) {
              isValid = true
            } else {
              isValid = false
              return res.status(500).send(constants.ERR_SERVER)
            }
          },
        ).catch(
          err => {
            isValid = false
            fileController.writeLog(req, res, next, 500, err)
            return res.status(500).send(constants.ERR_SERVER)
          },
        )
    }

    if (isValid) {
      await deleteMovementsOfCashsesByTransaction(req, res, next, transactionId).then(
        async result => {
          if (result) {
            isValid = true
          } else {
            isValid = false
            return res.status(500).send(constants.ERR_SERVER)
          }
        },
      ).catch(
        err => {
          isValid = false
          fileController.writeLog(req, res, next, 500, err)
          return res.status(500).send(constants.ERR_SERVER)
        },
      )
    }

    if (isValid) {
      axios.delete(
				`${config.BASE_URL_V8}/account-seats/transaction/${transaction._id}`, {
				  headers: {
				    Authorization: req.headers.authorization,
				  },
				},
      )
    }

    if (isValid) {
      await returnBalanceMovementsOfCashesByCancelingTransaction(req, res, next, transactionId).then(
        async result => {
          if (result) {
            isValid = true
          } else {
            isValid = false
            return res.status(500).send(constants.ERR_SERVER)
          }
        },
      ).catch(
        err => {
          isValid = false
          fileController.writeLog(req, res, next, 500, err)
          return res.status(500).send(constants.ERR_SERVER)
        },
      )
    }

    if (isValid) {
      await getTransactionsOrigin(req, res, next, transaction).then(
        async result => {
          if (result) {
            result.forEach(element => {
              let state = 'Cerrado'
              if (element && element.type && element.type.requestStatusOrigin) {
                state = element.type.requestStatusOrigin
              }
              Transaction.findByIdAndUpdate(element.transactionOrigin._id, {
                $set: {
                  state,
                },
              }, async (err, transactionDelete) => {
                if (err) {
                  isValid = false
                  fileController.writeLog(req, res, next, 500, err)
                  return res.status(500).send(constants.ERR_SERVER)
                } else {
                  isValid = true
                }
              })
            })
          } else {
            isValid = true
          }
        },
      )
    }

    if (isValid) {
      if (transaction.type.cashClosing) {
        CashBox.findByIdAndUpdate(transaction.cashBox._id, {
          $set: {
            state: 'Abierta',
            closingDate: null,
          },
        }, {
          new: true,
        }, (err, cashBoxUpdated) => {
          if (err) {
            isValid = false
            fileController.writeLog(req, res, next, 500, err)
            return res.status(500).send(constants.ERR_SERVER)
          }
        })
      }
    }

    if (isValid) {
      Transaction.findByIdAndUpdate(transactionId, {
        $set: {
          updateUser: user,
          updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
          operationType: 'D',
        },
      }, async (err, transactionDelete) => {
        if (err) {
          isValid = false
          fileController.writeLog(req, res, next, 500, err)
          return res.status(500).send(constants.ERR_SERVER)
        } else {
          isValid = true
          if (isValid) {
            transaction.operationType = 'D'
            if (
              transaction.state !== 'Pendiente' &&
							transaction.state !== 'Pendiente de Pago' &&
							transaction.state !== 'Abierto' &&
							transaction.state !== 'Pago Rechazado' &&
							transaction.state !== 'Anulado') {
              updateBalance(req, res, next, transaction)
            } else {
              getTransaction(req, res, next, transaction._id)
            }
          }
        }
      })
    }
  } else {
    fileController.writeLog(req, res, next, 500, constants.NO_DATA_FOUND)
    return res.status(500).send(constants.NO_DATA_FOUND)
  }
}

async function deleteMovementsOfArticlesByTransaction (req, res, next, transactionId) {
  return new Promise((resolve, reject) => {
    const json = '{ "transaction": "' + transactionId + '" }'
    let where
    try {
      where = JSON.parse(json)
    } catch (err) {
      fileController.writeLog(req, res, next, 500, json)
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(constants.ERR_SERVER)
    }

    const user = new User()
    user._id = req.session.user

    const set = JSON.parse('{ "$set": { "updateUser": "' + user._id + '", "updateDate": "' + moment().format('YYYY-MM-DDTHH:mm:ssZ') + '","operationType": "D"}}')

    MovementOfArticle.update(where, set, {
      multi: true,
    }, (err, movementsOfArticlesUpdate) => {
      if (err) {
        reject(err)
      } else {
        resolve(movementsOfArticlesUpdate)
      }
    })
  })
}

async function deleteMovementsOfCashsesByTransaction (req, res, next, transactionId) {
  return new Promise((resolve, reject) => {
    const json = '{ "transaction": "' + transactionId + '" }'
    let where
    try {
      where = JSON.parse(json)
    } catch (err) {
      fileController.writeLog(req, res, next, 500, json)
      reject(err)
    }

    const user = new User()
    user._id = req.session.user

    let transaction

    MovementOfCash.find(where)
      .populate({
        path: 'type',
        model: PaymentMethod,
      })
      .populate({
        path: 'transaction',
        model: Transaction,
        populate: [{
          path: 'type',
          model: TransactionType,
        }],
      })
      .exec(async (err, movementsOfCashes) => {
        if (err) {
          reject(err)
        } else {
          let isSaved = true
          for (const movementOfCash of movementsOfCashes) {
            if (isSaved) {
              await get(req.session.database, transactionId).then(
                result => {
                  if (result) {
                    transaction = result
                  } else {
                    resolve(true)
                  }
                },
              ).catch(err => {
                reject(err)
              })

              const set = JSON.parse('{ "$set": { "updateUser": "' + user._id + '", "updateDate": "' + moment().format('YYYY-MM-DDTHH:mm:ssZ') + '","operationType": "D"}}')

              MovementOfCash.findByIdAndUpdate(movementOfCash._id, set, (err, movementOfCashUpdate) => {
                if (err) {
                  isSaved = false
                  reject(err)
                } else {
                  if (movementOfCash.type && movementOfCash.type.inputAndOuput && transaction.state === 'Cerrado') {
                    if (movementOfCash.number && movementOfCash.number !== 0) {
                      const query = '{ "number": "' + movementOfCash.number + '", "type": "' + movementOfCash.type._id + '" }'
                      const where = JSON.parse(query)
                      if (movementOfCash.transaction.type.movement !== 'Entrada') {
                        const set = JSON.parse('{ "$set": { "statusCheck": "Disponible" } }')
                        MovementOfCash.update(where, set, {
                          multi: true,
                        }, (err, movementOfCashUpdate) => {
                          if (err) {
                            isSaved = false
                            reject(err)
                          }
                        })
                      }
                    }
                  }
                }
              })

              if (movementOfCash.type && movementOfCash.type.inputAndOuput) {
                if (movementOfCash.number && movementOfCash.number !== 0) {
                  const query = '{ "number": "' + movementOfCash.number + '", "type": "' + movementOfCash.type._id + '" }'
                  const where = JSON.parse(query)
                  if (movementOfCash.transaction.type.movement !== 'Entrada') {
                    const set = JSON.parse('{ "$set": { "statusCheck": "Disponible" } }')
                    MovementOfCash.update(where, set, {
                      multi: true,
                    }, (err, movementOfCashUpdate) => {
                      if (err) {
                        isSaved = false
                        reject(err)
                      }
                    })
                  }
                }
              }
            }
          }
          if (isSaved) {
            resolve(true)
          }
        }
      })
  })
}

async function returnBalanceMovementsOfCashesByCancelingTransaction (req, res, next, transactionId) {
  let isValid = true

  return new Promise((resolve, reject) => {
    const json = '{ "cancelingTransaction": "' + transactionId + '", "operationType": { "$ne": "D" } }'
    let where
    try {
      where = JSON.parse(json)
    } catch (err) {
      fileController.writeLog(req, res, next, 500, json)
      isValid = false
      reject(err)
    }

    if (isValid) {
      MovementOfCash.find(where)
        .exec(async (err, movementsOfCashes) => {
          if (err) {
            reject(err)
          } else {
            for (const movementOfCash of movementsOfCashes) {
              if (isValid) {
                movementOfCash.balanceCanceled = 0
                await updateMovementOfCash(movementOfCash)
                  .then(result => { })
                  .catch(err => {
                    isValid = false
                    reject(err)
                  })
              }
            }
            if (isValid) {
              resolve(true)
            }
          }
        })
    }
  })
}

function updateMovementOfCash (movementOfCash) {
  return new Promise((resolve, reject) => {
    MovementOfCash.findByIdAndUpdate(movementOfCash._id, movementOfCash, (err, movementOfCashUpdate) => {
      if (err) {
        reject(err)
      } else {
        resolve(movementOfCashUpdate)
      }
    })
  })
}

function getShiftClosing (req, res, next) {
  initConnectionDB(req.session.database)

  const turn = req.query.turn

  const json = '{"turnClosing":"' + turn + '"}'

  let where
  try {
    where = JSON.parse(json)
  } catch (err) {
    fileController.writeLog(req, res, next, 500, json)
    fileController.writeLog(req, res, next, 500, err)
    return res.status(500).send(constants.ERR_SERVER)
  }

  Transaction.find(where)
    .exec((err, transactions) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        if (!transactions) {
          fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND)
          return res.status(404).send(constants.NO_DATA_FOUND)
        } else if (transactions.length === 0) {
          fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND)
          return res.status(200).send({
            message: constants.NO_DATA_FOUND,
          })
        } else {
          Turn.populate(transactions, {
            path: 'turnOpening',
          }, (err, transactions) => {
            if (err) {
              fileController.writeLog(req, res, next, 500, err)
              return res.status(500).send(constants.ERR_SERVER)
            } else {
              Turn.populate(transactions, {
                path: 'turnClosing',
              }, (err, transactions) => {
                if (err) {
                  fileController.writeLog(req, res, next, 500, err)
                  return res.status(500).send(constants.ERR_SERVER)
                } else {
                  Employee.populate(transactions, {
                    path: 'employeeClosing',
                  }, (err, transactions) => {
                    if (err) {
                      fileController.writeLog(req, res, next, 500, err)
                      return res.status(500).send(constants.ERR_SERVER)
                    } else {
                      TransactionType.populate(transactions, {
                        path: 'type',
                      }, (err, transactions) => {
                        if (err) {
                          fileController.writeLog(req, res, next, 500, err)
                          return res.status(500).send(constants.ERR_SERVER)
                        } else if (!transactions) {
                          fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND)
                          return res.status(404).send(constants.NO_DATA_FOUND)
                        } else {
                          const shiftClosing = calculateShiftClosing(transactions)
                          fileController.writeLog(req, res, next, 200, 'shiftClosing = ' + shiftClosing)
                          return res.status(200).send({
                            shiftClosing,
                          })
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      }
    })
}

function calculateShiftClosing (transactions) {
  let invoicedAmount = 0
  let amountOrdersCanceled = 0
  const detailOfCanceled = []

  for (const transaction of transactions) {
    if (transaction.state === 'Cerrado') {
      invoicedAmount += transaction.totalPrice
    } else if (transaction.state === 'Anulado') {
      detailOfCanceled.push(transaction)
      amountOrdersCanceled++
    }
  }

  const json = {
    invoicedAmount,
    amountOrders: transactions.length,
    amountOrdersCanceled,
    detailCanceled: detailOfCanceled,
  }

  return json
}

function getTotalTransactionsBetweenDates (req, res, next) {
  const mongoose = require('mongoose')

  initConnectionDB(req.session.database)

  let queryParams
  try {
    queryParams = JSON.parse(req.query.query)
  } catch (err) {
    fileController.writeLog(req, res, next, 500, err)
    return res.status(500).send(constants.ERR_SERVER)
  }

  const type = queryParams.type
  const movement = queryParams.movement
  const currentAccount = queryParams.currentAccount
  const modifyStock = queryParams.modifyStock
  const startDate = queryParams.startDate
  const endDate = queryParams.endDate
  const branch = queryParams.branch

  const query = []

  query.push({
    $match: {
      $and: [{
        endDate: {
          $gte: new Date(startDate),
        },
      },
      {
        endDate: {
          $lte: new Date(endDate),
        },
      },
      {
        state: 'Cerrado',
      },
      {
        operationType: {
          $ne: 'D',
        },
      },
      ],
    },
  })

  query.push({
    $lookup: {
      from: 'transaction-types',
      localField: 'type',
      foreignField: '_id',
      as: 'type',
    },
  })

  query.push({
    $match: {
      $and: [{
        'type.transactionMovement': type,
        'type.movement': movement,
        'type.currentAccount': currentAccount,
        'type.modifyStock': modifyStock,
      }],
    },
  })

  if (branch && branch !== '') {
    query.push({
      $match: {
        branchDestination: mongoose.Types.ObjectId(branch),
      },
    })
  }

  query.push({
    $group: {
      _id: null,
      count: {
        $sum: 1,
      },
      total: {
        $sum: '$totalPrice',
      },
    },
  })

  Transaction.aggregate(query)
    .then(function (result) {
      if (result && result.length > 0) {
        fileController.writeLog(req, res, next, 200, result.length)
        return res.status(200).send(result)
      } else {
        fileController.writeLog(req, res, next, 200, '[]')
        return res.status(200).send([])
      }
    }).catch(err => {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(err)
    })
}

function getVATBook (req, res, next) {
  initConnectionDB(req.session.database)

  const cond = req.query.query.split('&')

  const transactionMovement = cond[0]
  const VATPeriod = cond[1]

  const query = [{
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
                  $arrayElemAt: [{
                    $filter: {
                      input: '$taxDetails',
                      as: 'td',
                      cond: {
                        $eq: ['$$td._id', '$$t.tax'],
                      },
                    },
                  }, 0],
                },
              },
            ],
          },
        },
      },
    },
  },
  {
    $unwind: {
      path: '$taxes',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $match: {
      VATPeriod,
      state: 'Cerrado',
      operationType: {
        $ne: 'D',
      },
    },
  },
  {
    $lookup: {
      from: 'transaction-types',
      localField: 'type',
      foreignField: '_id',
      as: 'type',
    },
  },
  {
    $unwind: '$type',
  },
  {
    $match: {
      'type.tax': true,
      'type.transactionMovement': transactionMovement,
    },
  },
  {
    $lookup: {
      from: 'companies',
      localField: 'company',
      foreignField: '_id',
      as: 'company',
    },
  },
  {
    $unwind: {
      path: '$company',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'branches',
      localField: 'branchDestination',
      foreignField: '_id',
      as: 'branchDestination',
    },
  },
  {
    $unwind: {
      path: '$branchDestination',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $group: {
      _id: '$_id',
      endDate: {
        $first: '$endDate',
      },
      origin: {
        $first: '$origin',
      },
      CAE: {
        $first: '$CAE',
      },
      letter: {
        $first: '$letter',
      },
      number: {
        $first: '$number',
      },
      exempt: {
        $first: '$exempt',
      },
      totalPrice: {
        $first: '$totalPrice',
      },
      company: {
        $first: '$company',
      },
      type: {
        $first: '$type',
      },
      branchDestination: {
        $first: '$branchDestination',
      },
      taxes: {
        $addToSet: '$taxes',
      },
    },
  },
  {
    $project: {
      endDate: 1,
      year: {
        $year: '$endDate',
      },
      month: {
        $month: '$endDate',
      },
      day: {
        $dayOfMonth: '$endDate',
      },
      origin: 1,
      CAE: 1,
      letter: 1,
      number: 1,
      taxes: 1,
      exempt: 1,
      totalPrice: 1,
      'company.name': 1,
      'company.identificationValue': 1,
      'company.vatCondition': 1,
      'company.state': 1,
      'type.name': 1,
      'type.movement': 1,
      'type.abbreviation': 1,
      'type.labelPrint': 1,
      'type.transactionMovement': 1,
      'branchDestination.name': 1,
    },
  },
  {
    $sort: {
      origin: 1,
      endDate: 1,
      'type.name': 1,
      letter: 1,
      number: 1,
    },
  },
  ]

  Transaction.aggregate(query)
    .allowDiskUse(true)
    .then(function (result) {
      fileController.writeLog(req, res, next, 200, result.length)
      return res.status(200).send({
        transactions: result,
      })
    }).catch(err => {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(err)
    })
}

async function updateBalance (req, res, next, transactionDestination = undefined) {
  initConnectionDB(req.session.database)

  if (!transactionDestination) {
    transactionDestination = req.body
  }
  let balanceOrigins = 0

  let endProcess = false

  await getTransactionsOrigin(req, res, next, transactionDestination)
    .then(
      async movementsOfCancellations => {
        if (movementsOfCancellations && movementsOfCancellations.length > 0) {
          for (const mov of movementsOfCancellations) {
            if (transactionDestination.operationType === 'D') {
              if (mov.balance > 0) {
                mov.transactionOrigin.balance += roundNumber(mov.balance, 2)
              } else {
                mov.transactionOrigin.balance -= roundNumber(mov.balance, 2)
              }
            } else {
              if (mov.balance > 0) {
                mov.transactionOrigin.balance -= roundNumber(mov.balance, 2)
              } else {
                mov.transactionOrigin.balance += roundNumber(mov.balance, 2)
              }
            }
            if (mov.transactionOrigin.balance < 0) {
              mov.transactionOrigin.balance = 0
            }
            await updateTransactionById(req, res, next, mov.transactionOrigin)
              .then(transaction => {
                if ((mov.transactionOrigin.type.transactionMovement === 'Venta' &&
									mov.transactionOrigin.type.movement === 'Salida') ||
									(mov.transactionOrigin.type.transactionMovement === 'Compra' &&
										mov.transactionOrigin.type.movement === 'Entrada')) {
                  balanceOrigins -= roundNumber(mov.balance, 2)
                } else {
                  balanceOrigins += roundNumber(mov.balance, 2)
                }
              })
              .catch(err => {
                endProcess = true
                fileController.writeLog(req, res, next, 500, err)
                return res.status(500).send(constants.ERR_SERVER)
              })
          }
        }
      },
    )
    .catch(
      err => {
        endProcess = true
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      },
    )

  if (!endProcess) {
    if (transactionDestination.operationType !== 'D') {
      MovementOfCash.find({
        transaction: transactionDestination._id,
        operationType: {
          $ne: 'D',
        },
      }).exec(async (err, movementsOfCashes) => {
        if (err) {
          fileController.writeLog(req, res, next, 500, err)
          return res.status(500).send(constants.ERR_SERVER)
        } else {
          PaymentMethod.populate(movementsOfCashes, {
            path: 'type',
          }, async (err, movementsOfCashes) => {
            if (err) {
              fileController.writeLog(req, res, next, 500, err)
              return res.status(500).send(constants.ERR_SERVER)
            } else {
              if (movementsOfCashes && movementsOfCashes.length > 0) {
                let balance = 0
                for (const movementOfCash of movementsOfCashes) {
                  if (movementOfCash.type.isCurrentAccount) {
                    balance = balance + movementOfCash.amountPaid
                  }
                }
                if (balance > 0) {
                  transactionDestination.balance = roundNumber(balance, 2)
                } else {
                  if (transactionDestination.type.currentAccount === 'Cobra') {
                    transactionDestination.balance = roundNumber(transactionDestination.totalPrice - balanceOrigins + balance, 2)
                  } else {
                    transactionDestination.balance = roundNumber(balance - balanceOrigins, 2)
                  }
                }
                if (transactionDestination.balance < 0) transactionDestination.balance = 0
                transactionDestination = await updateTransactionById(req, res, next, transactionDestination)
              } else {
                transactionDestination.balance = roundNumber(transactionDestination.totalPrice, 2)
                if (transactionDestination.balance < 0) transactionDestination.balance = 0
                transactionDestination = await updateTransactionById(req, res, next, transactionDestination)
              }
              getTransaction(req, res, next, transactionDestination._id)
            }
          })
        }
      })
    } else {
      fileController.writeLog(req, res, next, 200, transactionDestination)
      return res.status(200).send({
        transaction: transactionDestination,
      })
    }
  }
}

async function updateTransactionById (req, res, next, transaction) {
  initConnectionDB(req.session.database)

  return new Promise(async (resolve, reject) => {
    await Transaction.find({
      _id: transaction._id,
    }).exec(async (err, transactions) => {
      if (err) {
        reject(err)
      } else {
        if (transactions && transactions.length > 0) {
          transactions[0].balance = roundNumber(transaction.balance, 2)
          transactions[0].tracking = updateTracking(transactions[0])
          await Transaction.findByIdAndUpdate(transactions[0]._id, clearLookups(transactions[0]), (err, transactionUpdated) => {
            if (err) {
              reject(err)
            } else {
              resolve(transactionUpdated)
            }
          })
        }
      }
    })
  })
}

function getTransactionsOrigin (req, res, next, transactionDestination) {
  initConnectionDB(req.session.database)

  return new Promise((resolve, reject) => {
    const json = `{"transactionDestination": "${transactionDestination._id}", "operationType":{ "$ne": "D" }}`

    let where
    try {
      where = JSON.parse(json)
    } catch (err) {
      fileController.writeLog(req, res, next, 500, json)
      fileController.writeLog(req, res, next, 500, err)
      reject(err)
    }

    MovementOfCancellation
      .find(where)
      .populate({
        path: 'transactionOrigin',
        model: Transaction,
        populate: [{
          path: 'type',
          model: TransactionType,
        }, {
          path: 'taxes.tax',
          model: Tax,
        }],
      }).populate({
        path: 'type',
        model: CancellationType,
      })
      .exec((err, movementsOfCancellations) => {
        if (err) {
          reject(err)
        } else {
          resolve(movementsOfCancellations)
        }
      })
  })
}

function roundNumber (value, numberOfDecimals = 2) {
  if (!isNaN(value)) {
    switch (numberOfDecimals) {
      case 0:
        return Math.round(value * 1) / 1
      case 1:
        return Math.round(value * 10) / 10
      case 2:
        return Math.round(value * 100) / 100
      case 3:
        return Math.round(value * 1000) / 1000
      case 4:
        return Math.round(value * 1000) / 1000
      default:
        return Math.round(value * 100) / 100
    }
  } else {
    return parseFloat(value.toFixed(numberOfDecimals))
  }
}

function initConnectionDB (database) {
  const Model = require('./../models/model')

  const TransactionSchema = require('./../models/transaction')
  Transaction = new Model('transaction', {
    schema: TransactionSchema,
    connection: database,
  })

  const BranchSchema = require('./../models/branch')
  Branch = new Model('branch', {
    schema: BranchSchema,
    connection: database,
  })

  const DespositSchema = require('./../models/deposit')
  Deposit = new Model('deposit', {
    schema: DespositSchema,
    connection: database,
  })

  const TransactionTypeSchema = require('./../models/transaction-type')
  TransactionType = new Model('transaction-type', {
    schema: TransactionTypeSchema,
    connection: database,
  })

  const CancellationTypeSchema = require('./../models/cancellation-type')
  CancellationType = new Model('cancellation-type', {
    schema: CancellationTypeSchema,
    connection: database,
  })

  const CashBoxSchema = require('./../models/cash-box')
  CashBox = new Model('cash-box', {
    schema: CashBoxSchema,
    connection: database,
  })

  const TableSchema = require('./../models/table')
  Table = new Model('table', {
    schema: TableSchema,
    connection: database,
  })

  const EmployeeSchema = require('./../models/employee')
  Employee = new Model('employee', {
    schema: EmployeeSchema,
    connection: database,
  })

  const PaymentMethodSchema = require('./../models/payment-method')
  PaymentMethod = new Model('payment-method', {
    schema: PaymentMethodSchema,
    connection: database,
  })

  const CompanySchema = require('./../models/company')
  Company = new Model('company', {
    schema: CompanySchema,
    connection: database,
  })

  const TurnSchema = require('./../models/turn')
  Turn = new Model('turn', {
    schema: TurnSchema,
    connection: database,
  })

  const VATConditionSchema = require('./../models/vat-condition')
  VATCondition = new Model('vat-condition', {
    schema: VATConditionSchema,
    connection: database,
  })

  const PrinterSchema = require('./../models/printer')
  Printer = new Model('printer', {
    schema: PrinterSchema,
    connection: database,
  })

  const MovementOfCashSchema = require('./../models/movement-of-cash')
  MovementOfCash = new Model('movements-of-cash', {
    schema: MovementOfCashSchema,
    connection: database,
  })

  const MovementOfArticleSchema = require('./../models/movement-of-article')
  MovementOfArticle = new Model('movements-of-article', {
    schema: MovementOfArticleSchema,
    connection: database,
  })

  const EmployeeTypeSchema = require('./../models/employee-type')
  EmployeeType = new Model('employee-type', {
    schema: EmployeeTypeSchema,
    connection: database,
  })

  const UserSchema = require('./../models/user')
  User = new Model('user', {
    schema: UserSchema,
    connection: database,
  })

  const IdentificationTypeSchema = require('./../models/identification-type')
  IdentificationType = new Model('identification-type', {
    schema: IdentificationTypeSchema,
    connection: database,
  })

  const RelationTypeSchema = require('./../models/relation-type')
  RelationType = new Model('relation-type', {
    schema: RelationTypeSchema,
    connection: database,
  })

  const UseOfCFDISchema = require('./../models/use-of-CFDI')
  UseOfCFDI = new Model('uses-of-cfdi', {
    schema: UseOfCFDISchema,
    connection: database,
  })

  const MovementOfCancellationSchema = require('./../models/movement-of-cancellation')
  MovementOfCancellation = new Model('movements-of-cancellation', {
    schema: MovementOfCancellationSchema,
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

  const TransportSchema = require('./../models/transport')
  Transport = new Model('transport', {
    schema: TransportSchema,
    connection: database,
  })

  const PriceListSchema = require('./../models/price-list')
  PriceList = new Model('price-list', {
    schema: PriceListSchema,
    connection: database,
  })

  const CompanyGroupSchema = require('./../models/company-group')
  CompanyGroup = new Model('company-group', {
    schema: CompanyGroupSchema,
    connection: database,
  })

  const StateSchema = require('./../models/state')
  State = new Model('state', {
    schema: StateSchema,
    connection: database,
  })

  const ShipmentMethodSchema = require('./../models/shipment-method')
  ShipmentMethod = new Model('shipment-method', {
    schema: ShipmentMethodSchema,
    connection: database,
  })

  const EmailTemplateSchema = require('./../models/email-template')
  EmailTemplate = new Model('email-template', {
    schema: EmailTemplateSchema,
    connection: database,
  })

  const AddressSchema = require('./../models/address')
  Address = new Model('address', {
    schema: AddressSchema,
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

  const BusinessRuleSchema = require('./../models/business-rule')
  BusinessRule = new Model('business-rule', {
    schema: BusinessRuleSchema,
    connection: database,
  })
}

module.exports = {
  get,
  getTransaction,
  getTransactions,
  getTransactionsV2,
  getTransactionsV3,
  saveTransaction,
  updateTransaction,
  deleteTransaction,
  getShiftClosing,
  getTransactionsByMovement,
  getTotalTransactionsBetweenDates,
  getVATBook,
  updateBalance,
}
