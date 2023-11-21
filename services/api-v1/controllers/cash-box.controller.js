/* eslint-disable max-len */
'use strict'

const fileController = require('./file.controller')
const constants = require('./../utilities/constants')
const { EJSON } = require('bson')
const moment = require('moment')
moment.locale('es')

let CashBox
let Employee
let User
let Transaction
let CashBoxType
let MovementOfCash

function getCashBox (req, res, next, id = undefined) {
  initConnectionDB(req.session.database)

  let cashBoxId
  if (id) {
    cashBoxId = id
  } else {
    cashBoxId = req.query.id
  }

  CashBox.findById(cashBoxId, (err, cashBox) => {
    if (err) {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(constants.ERR_SERVER)
    } else {
      if (!cashBox || cashBox.operationType === 'D') {
        fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND)
        return res.status(404).send(constants.NO_DATA_FOUND)
      } else {
        fileController.writeLog(req, res, next, 200, cashBox)
        return res.status(200).send({ cashBox })
      }
    }
  })
    .populate({
      path: 'type',
      model: CashBoxType,
    })
    .populate({
      path: 'employee',
      model: Employee,
    })
}

function getCashBoxes (req, res, next) {
  // http://localhost:3000/api/articles/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"

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

  CashBox.find(where)
    .limit(limit)
    .select(select)
    .sort(sort)
    .skip(skip)
    .populate({
      path: 'type',
      model: CashBoxType,
    })
    .populate({
      path: 'employee',
      model: Employee,
    })
    .exec((err, cashBoxes) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        if (!cashBoxes) {
          fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND)
          return res.status(404).send(constants.NO_DATA_FOUND)
        } else if (cashBoxes.length === 0) {
          fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND)
          return res.status(200).send({ message: constants.NO_DATA_FOUND })
        } else {
          if (cashBoxes) {
            fileController.writeLog(req, res, next, 200, cashBoxes.length)
          }
          return res.status(200).send({ cashBoxes })
        }
      }
    })
}

function getCashBoxesV2 (req, res, next) {
  initConnectionDB(req.session.database)

  let queryAggregate = []
  let group

  if (req.query) {
    let error

    let project = req.query.project
    if (project && project !== '{}') {
      try {
        project = JSON.parse(project)

        if (searchPropertyOfArray(project, 'type.')) {
          queryAggregate.push({
            $lookup: {
              from: 'cash-box-types',
              foreignField: '_id',
              localField: 'type',
              as: 'type',
            },
          })
          queryAggregate.push({
            $unwind: { path: '$type', preserveNullAndEmptyArrays: true },
          })
        }

        if (searchPropertyOfArray(project, 'employee.')) {
          queryAggregate.push({
            $lookup: {
              from: 'employees',
              foreignField: '_id',
              localField: 'employee',
              as: 'employee',
            },
          })
          queryAggregate.push({
            $unwind: { path: '$employee', preserveNullAndEmptyArrays: true },
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
            $unwind: { path: '$updateUser', preserveNullAndEmptyArrays: true },
          })
        }

        const sort = req.query.sort
        if (sort && sort !== '{}') {
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
      if (sort && sort !== '{}') {
        try {
          queryAggregate.push({ $sort: JSON.parse(sort) })
        } catch (err) {
          error = err
        }
      }
    }

    const match = req.query.match
    if (match && match !== '{}') {
      try {
        queryAggregate.push({ $match: JSON.parse(match) })
      } catch (err) {
        error = err
      }
    }

    group = req.query.group
    if (group && group !== '{}') {
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
          if (group && group !== '{}') {
            let projectGroup
            if (searchPropertyOfArray(JSON.parse(group), 'cashBoxes')) {
              projectGroup = `{ "cashBoxes": { "$slice": ["$cashBoxes", ${skip}, ${limit}] }`
            } else {
              projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`
            }
            for (const prop of Object.keys(JSON.parse(group))) {
              if (prop !== 'cashBoxes' && prop !== 'items') {
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

  CashBox.aggregate(queryAggregate)
    .then(function (result) {
      fileController.writeLog(req, res, next, 200, result.length)
      if (result.length > 0) {
        if (group && group !== '{}') {
          return res.status(200).send(result)
        } else {
          return res.status(200).send({ cashBoxes: result })
        }
      } else {
        if (group && group !== '{}') {
          return res.status(200).send({ count: 0, cashBoxes: [] })
        } else {
          return res.status(200).send({ cashBoxes: [] })
        }
      }
    })
    .catch((err) => {
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

function saveCashBox (req, res, next) {
  initConnectionDB(req.session.database)

  const cashBox = new CashBox()
  const params = req.body

  cashBox.number = params.number
  cashBox.openingDate = params.openingDate
  cashBox.closingDate = params.closingDate
  cashBox.state = params.state
  cashBox.employee = params.employee
  cashBox.type = params.type

  const user = new User()
  user._id = req.session.user
  cashBox.creationUser = user
  cashBox.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
  cashBox.operationType = 'C'

  cashBox.save((err, cashBoxSaved) => {
    if (err) {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(constants.ERR_SERVER)
    } else {
      Employee.populate(
        cashBoxSaved,
        { path: 'employee' },
        (err, cashBoxSaved) => {
          if (err) {
            fileController.writeLog(req, res, next, 500, err)
            return res.status(500).send(constants.ERR_SERVER)
          } else if (!cashBoxSaved) {
            fileController.writeLog(
              req,
              res,
              next,
              404,
              constants.NO_DATA_FOUND,
            )
            return res.status(404).send(constants.NO_DATA_FOUND)
          } else {
            getCashBox(req, res, next, cashBoxSaved._id)
          }
        },
      )
    }
  })
}

function updateCashBox (req, res, next) {
  initConnectionDB(req.session.database)

  const cashBoxId = req.query.id
  const cashBox = req.body

  const user = new User()
  user._id = req.session.user
  cashBox.updateUser = user
  cashBox.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
  cashBox.operationType = 'U'

  CashBox.findByIdAndUpdate(cashBoxId, cashBox, (err, cashBoxUpdated) => {
    if (err) {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(constants.ERR_SERVER)
    } else {
      getCashBox(req, res, next, cashBoxUpdated._id)
    }
  })
}

function deleteCashBox (req, res, next) {
  initConnectionDB(req.session.database)

  const cashBoxId = req.query.id

  const user = new User()
  user._id = req.session.user

  CashBox.findByIdAndUpdate(
    cashBoxId,
    {
      $set: {
        updateUser: user,
        updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
        operationType: 'D',
      },
    },
    (err, cashBoxUpdated) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        fileController.writeLog(req, res, next, 200, cashBoxUpdated._id)
        return res.status(200).send({ cashBox: cashBoxUpdated })
      }
    },
  )
}

async function getClosingCashBox (req, res, next) {
  const mongoose = require('mongoose')

  initConnectionDB(req.session.database)

  await deleteMovCashDuplicate(req.query.id)

  const cashBox = req.query.id

  const query = [
    {
      $lookup: {
        from: 'transaction-types',
        localField: 'type',
        foreignField: '_id',
        as: 'type',
      },
    },
    { $unwind: '$type' },
    {
      $lookup: {
        from: 'movements-of-cashes',
        localField: '_id',
        foreignField: 'transaction',
        as: 'movement-of-cash',
      },
    },
    {
      $unwind: {
        path: '$movement-of-cash',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'payment-methods',
        localField: 'movement-of-cash.type',
        foreignField: '_id',
        as: 'movement-of-cash.type',
      },
    },
    {
      $unwind: {
        path: '$movement-of-cash.type',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $and: [
          {
            cashBox: mongoose.Types.ObjectId(cashBox),
          },
          {
            operationType: { $ne: 'D' },
          },
          {
            'movement-of-cash.type.cashBoxImpact': true,
          },
          {
            'movement-of-cash.operationType': { $ne: 'D' },
          },
        ],
      },
    },
    {
      $project: {
        state: 1,
        origin: 1,
        letter: 1,
        number: 1,
        'type.name': 1,
        'type.movement': 1,
        'type.cashOpening': 1,
        'type.cashClosing': 1,
        'movement-of-cash.amountPaid': 1,
        'movement-of-cash.type._id': 1,
        'movement-of-cash.type.name': 1,
      },
    },
  ]

  Transaction.aggregate(query)
    .then(function (result) {
      if (result && result.length > 0) {
        fileController.writeLog(req, res, next, 200, result.length)
        return res.status(200).send(result)
      } else {
        fileController.writeLog(req, res, next, 200, '[]')
        return res.status(200).send([])
      }
    })
    .catch((err) => {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(err)
    })
}

// async function deleteMovCashDuplicate (cashBoxId) {
//   try {
//     const mongoose = require('mongoose')

//     // Encuentra las transacciones que cumplen con las condiciones
//     const transactions = await Transaction.find({
//       operationType: { $ne: 'D' },
//       cashBox: mongoose.Types.ObjectId(cashBoxId),
//     })

//     for (const transaction of transactions) {
//       // Encuentra los movimientos duplicados de esta transacción
//       const duplicateMovements = await MovementOfCash.find({
//         transaction: transaction._id,
//         operationType: { $ne: 'D' },
//       })

//       if (duplicateMovements.length > 1) {
//         // Mantén solo un movimiento duplicado (elimina los demás)
//         for (let j = 1; j < duplicateMovements.length; j++) {
//           await MovementOfCash.deleteOne({ _id: duplicateMovements[j]._id })
//         }
//       }
//     }
//   } catch (error) {
//     console.error(error)
//   }
// }

async function deleteMovCashDuplicate (cashBoxId) {
  try {
    const mongoose = require('mongoose')

    // Encuentra las transacciones que cumplen con las condiciones
    const transactions = await Transaction.find({
      operationType: { $ne: 'D' },
      cashBox: mongoose.Types.ObjectId(cashBoxId),
      'type.cashClosing': false,
      'type.cashOpening': false,
    })

    for (const transaction of transactions) {
      // Encuentra los movimientos de esta transacción
      const movements = await MovementOfCash.find({
        transaction: transaction._id,
        operationType: { $ne: 'D' },
      })

      const seenTypes = new Set() // Para rastrear los tipos vistos

      for (const movement of movements) {
        if (seenTypes.has(movement.type.toString())) {
          // Este tipo ya se ha visto, eliminar el duplicado
          await MovementOfCash.deleteOne({ _id: movement._id })
        } else {
          // Agregar este tipo a los tipos vistos
          seenTypes.add(movement.type.toString())
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
}

function initConnectionDB (database) {
  const Model = require('./../models/model')

  const CashBoxSchema = require('./../models/cash-box')
  CashBox = new Model('cash-box', {
    schema: CashBoxSchema,
    connection: database,
  })

  const EmployeeSchema = require('./../models/employee')
  Employee = new Model('employee', {
    schema: EmployeeSchema,
    connection: database,
  })

  const CashBoxTypeSchema = require('./../models/cash-box-type')
  CashBoxType = new Model('cash-box-type', {
    schema: CashBoxTypeSchema,
    connection: database,
  })

  const TransactionSchema = require('./../models/transaction')
  Transaction = new Model('transaction', {
    schema: TransactionSchema,
    connection: database,
  })

  const MovementOfCashSchema = require('./../models/movement-of-cash')
  MovementOfCash = new Model('movements-of-cash', {
    schema: MovementOfCashSchema,
    connection: database,
  })

  const UserSchema = require('./../models/user')
  User = new Model('user', {
    schema: UserSchema,
    connection: database,
  })
}

module.exports = {
  getCashBox,
  getCashBoxes,
  getCashBoxesV2,
  saveCashBox,
  updateCashBox,
  deleteCashBox,
  getClosingCashBox,
}
