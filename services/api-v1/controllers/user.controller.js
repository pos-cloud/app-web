'use strict'

// Paquetes de terceros
const bcryptjs = require('bcryptjs')
const moment = require('moment')
moment.locale('es')
const { EJSON } = require('bson')

const fileController = require('./file.controller')
const constants = require('./../utilities/constants')

// Modelos
let User
let Employee
let EmployeeType
let Company
let Origin
let Branch
let Printer
let CashBoxType
let Permission

function getUser (req, res, next, id = undefined) {
  initConnectionDB(req.session.database)

  let userId
  if (id) {
    userId = id
  } else {
    userId = req.query.id
  }

  User.findById(userId, (err, user) => {
    if (err) {
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(constants.ERR_SERVER)
    } else {
      if (!user || user.operationType === 'D') {
        fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND)
        return res.status(404).send(constants.NO_DATA_FOUND)
      } else {
        fileController.writeLog(req, res, next, 200, user)
        return res.status(200).send({ user })
      }
    }
  }).populate({
    path: 'cashBoxType',
    model: CashBoxType,
    match: { operationType: { $ne: 'D' } }
  }).populate({
    path: 'employee',
    model: Employee,
    match: { operationType: { $ne: 'D' } },
    populate: { path: 'type', model: EmployeeType }
  }).populate({
    path: 'company',
    model: Company,
    match: { operationType: { $ne: 'D' } }
  }).populate({
    path: 'origin',
    model: Origin,
    match: { operationType: { $ne: 'D' } },
    populate: { path: 'branch', model: Branch }
  }).populate({
    path: 'branch',
    model: Branch,
    match: { operationType: { $ne: 'D' } }
  }).populate({
    path: 'permission',
    model: Permission,
    match: { operationType: { $ne: 'D' } }
  }).populate({
    path: 'printers.printer',
    model: Printer,
    match: { operationType: { $ne: 'D' } }
  }).populate({
    path: 'creationUser',
    model: User
  }).populate({
    path: 'updateUser',
    model: User
  })
}

function getUsers (req, res, next) {
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

  User.find(where)
    .limit(limit)
    .select(select)
    .sort(sort)
    .skip(skip)
    .populate({
      path: 'cashBoxType',
      model: CashBoxType,
      match: { operationType: { $ne: 'D' } }
    })
    .populate({
      path: 'employee',
      model: Employee,
      match: { operationType: { $ne: 'D' } },
      populate: { path: 'type', model: EmployeeType }
    })
    .populate({
      path: 'company',
      model: Company,
      match: { operationType: { $ne: 'D' } }
    })
    .populate({
      path: 'origin',
      model: Origin,
      match: { operationType: { $ne: 'D' } },
      populate: { path: 'branch', model: Branch }
    })
    .populate({
      path: 'printers.printer',
      model: Printer
    })
    .populate({
      path: 'branch',
      model: Branch
    })
    .populate({
      path: 'creationUser',
      model: User
    })
    .populate({
      path: 'updateUser',
      model: User
    })
    .exec((err, users) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        if (!users) {
          fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND)
          return res.status(404).send(constants.NO_DATA_FOUND)
        } else if (users.length === 0) {
          fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND)
          return res.status(200).send({ message: constants.NO_DATA_FOUND })
        } else {
          fileController.writeLog(req, res, next, 200, users.length)
          return res.status(200).send({ users })
        }
      }
    })
}

function getUsersV2 (req, res, next) {
  initConnectionDB(req.session.database)

  let queryAggregate = []
  let group

  if (req.query && req.query !== {}) {
    let error

    let project = req.query.project
    if (project && project !== {} && project !== '{}') {
      try {
        project = JSON.parse(project)

        if (searchPropertyOfArray(project, 'cashBoxType.')) {
          queryAggregate.push({ $lookup: { from: 'cash-box-types', foreignField: '_id', localField: 'cashBoxType', as: 'cashBoxType' } })
          queryAggregate.push({ $unwind: { path: '$cashBoxType', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'employee.')) {
          queryAggregate.push({ $lookup: { from: 'employees', foreignField: '_id', localField: 'employee', as: 'employee' } })
          queryAggregate.push({ $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'company.')) {
          queryAggregate.push({ $lookup: { from: 'companies', foreignField: '_id', localField: 'company', as: 'company' } })
          queryAggregate.push({ $unwind: { path: '$company', preserveNullAndEmptyArrays: true } })
        }

        if (searchPropertyOfArray(project, 'origin.')) {
          queryAggregate.push({ $lookup: { from: 'origins', foreignField: '_id', localField: 'origin', as: 'origin' } })
          queryAggregate.push({ $unwind: { path: '$origin', preserveNullAndEmptyArrays: true } })

          if (searchPropertyOfArray(project, 'branch.')) {
            queryAggregate.push({ $lookup: { from: 'branches', foreignField: '_id', localField: 'branch', as: 'branch' } })
            queryAggregate.push({ $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } })
          }
        }

        if (searchPropertyOfArray(project, 'branch.')) {
          queryAggregate.push({ $lookup: { from: 'branches', foreignField: '_id', localField: 'branch', as: 'branch' } })
          queryAggregate.push({ $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } })
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
            if (searchPropertyOfArray(JSON.parse(group), 'users')) {
              projectGroup = `{ "users": { "$slice": ["$users", ${skip}, ${limit}] }`
            } else {
              projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`
            }
            for (const prop of Object.keys(JSON.parse(group))) {
              if (prop !== 'users' && prop !== 'items') {
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

  User.aggregate(queryAggregate)
    .then(function (result) {
      fileController.writeLog(req, res, next, 200, result.length)
      if (result.length > 0) {
        if (group && group !== '{}' && group !== {}) {
          return res.status(200).send(result)
        } else {
          return res.status(200).send({ users: result })
        }
      } else {
        if (group && group !== '{}' && group !== {}) {
          return res.status(200).send({ count: 0, users: [] })
        } else {
          return res.status(200).send({ users: [] })
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

function saveUser (req, res, next) {
  initConnectionDB(req.session.database)

  // Recoger parametros
  const params = req.body

  // Si existen estos datos, empezar a trabajar para guardar el objeto
  if (params.name && params.password && (params.employee || params.company)) {
    // Crear objeto
    const user = new User()

    // Asignar valores al objeto
    user.name = params.name
    user.phone = params.phone
    user.email = params.email
    user.state = params.state
    user.cashBoxType = params.cashBoxType
    user.employee = params.employee
    user.company = params.company
    user.origin = params.origin
    user.tokenExpiration = params.tokenExpiration
    user.shortcuts = params.shortcuts
    user.printers = params.printers
    user.branch = params.branch
    user.level = params.level
    user.permission = params.permission

    user.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
    user.operationType = 'C'

    let json = '{"$and":[{"operationType": {"$ne": "D"}},'
    if (user.employee) {
      json = json + '{"$or":[{"employee": "' + user.employee + '"},'
    } else if (user.company) {
      json = json + '{"$or":[{"company": "' + user.company + '"},'
    }

    json = json + '{"name": "' + user.name + '"},{"email": "' + user.email + '"}]}]}'

    let where
    try {
      where = JSON.parse(json)
    } catch (err) {
      fileController.writeLog(req, res, next, 500, json)
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(constants.ERR_SERVER)
    }

    // Comprobar que el usuario con mismo nombre no existe
    User.find(where).exec((err, users) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        if (!users || users.length === 0) {
          // Encriptar la contraseña
          const bcryptJSSaltRounds = 12
          bcryptjs.hash(params.password, bcryptJSSaltRounds)
            .then(function (hashedPassword) {
              // Asignar la contraseña encriptada
              user.password = hashedPassword
              // Guardar el usuario
              user.save((err, userSaved) => {
                if (err) {
                  fileController.writeLog(req, res, next, 500, err)
                  return res.status(500).send(constants.ERR_SERVER)
                } else {
                  getUser(req, res, next, userSaved._id)
                }
              })
            })
            .catch(function (err) {
              fileController.writeLog(req, res, next, 500, err)
              return res.status(500).send(constants.ERR_SERVER)
            })
        } else {
          const message = 'El usuario ya se encuentra registrado.'
          fileController.writeLog(req, res, next, 200, message)
          return res.status(200).send({ message })
        }
      }
    })
  } else {
    fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA)
    return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA })
  }
}

function updateUser (req, res, next) {
  initConnectionDB(req.session.database)

  const userId = req.query.id
  const user = req.body

  const userAudit = new User()
  userAudit._id = req.session.user
  user.updateUser = userAudit
  user.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
  user.operationType = 'U'

  // Si existen estos datos, empezar a trabajar para editar el objeto
  if (user.name && user.password && (user.employee || user.company)) {
    let json
    json = '{"$and":[{"operationType": {"$ne": "D"}},'
    if (user.employee) {
      if (user.employee && user.employee._id) {
        json = json + '{"$or":[{"employee": "' + user.employee._id + '"},'
      } else {
        json = json + '{"$or":[{"employee": "' + user.employee + '"},'
      }
    } else if (user.company) {
      if (user.company && user.company._id) {
        json = json + '{"$or":[{"company": "' + user.company._id + '"},'
      } else if (user.company) {
        json = json + '{"$or":[{"company": "' + user.company + '"},'
      }
    }

    json = json + '{"name": "' + user.name + '"},{"email": "' + user.email + '"}]},'
    json = json + '{"_id": {"$ne": "' + userId + '"}}]}'

    let where
    try {
      where = JSON.parse(json)
    } catch (err) {
      fileController.writeLog(req, res, next, 500, json)
      fileController.writeLog(req, res, next, 500, err)
      return res.status(500).send(constants.ERR_SERVER)
    }

    // Controlo usuario existente
    User.find(where).exec((err, users) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        if (!users || users.length === 0) {
          // Controlo usuario existente
          let where
          try {
            where = JSON.parse('{"_id":"' + userId + '"}')
          } catch (err) {
            fileController.writeLog(req, res, next, 500, err)
            return res.status(500).send(constants.ERR_SERVER)
          }
          User.find(where).exec((err, users2) => {
            if (err) {
              fileController.writeLog(req, res, next, 500, err)
              return res.status(500).send(constants.ERR_SERVER)
            } else {
              if (users2 || users2.length === 1) {
                // Comparar contraseñas
                if (user.password === users2[0].password) {
                  User.findByIdAndUpdate(userId, user, (err, userUpdated) => {
                    if (err) {
                      fileController.writeLog(req, res, next, 500, err)
                      return res.status(500).send(constants.ERR_SERVER)
                    } else {
                      getUser(req, res, next, userUpdated._id)
                    }
                  })
                } else {
                  // Encriptar la contraseña
                  const bcryptJSSaltRounds = 12
                  bcryptjs.hash(user.password, bcryptJSSaltRounds)
                    .then(function (hashedPassword) {
                      // Asignar la contraseña encriptada
                      user.password = hashedPassword
                      // Guardar el usuario
                      User.findByIdAndUpdate(userId, user, (err, userUpdated) => {
                        if (err) {
                          fileController.writeLog(req, res, next, 500, err)
                          return res.status(500).send(constants.ERR_SERVER)
                        } else {
                          getUser(req, res, next, userUpdated._id)
                        }
                      })
                    })
                    .catch(function (err) {
                      fileController.writeLog(req, res, next, 500, err)
                      return res.status(500).send({ message: constants.ERR_SERVER })
                    })
                }
              } else {
                const message = 'El usuario no existe'
                fileController.writeLog(req, res, next, 200, message)
                return res.status(200).send({ message })
              }
            }
          })
        } else {
          const message = 'El usuario ya se ecuentra registrado.'
          fileController.writeLog(req, res, next, 200, message)
          return res.status(200).send({ message })
        }
      }
    })
  } else {
    fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DAT)
    return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA })
  }
}

function deleteUser (req, res, next) {
  initConnectionDB(req.session.database)

  const userId = req.query.id

  User.findByIdAndUpdate(userId,
    {
      $set: {
        updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
        operationType: 'D'
      }
    }, (err, userUpdated) => {
      if (err) {
        fileController.writeLog(req, res, next, 500, err)
        return res.status(500).send(constants.ERR_SERVER)
      } else {
        fileController.writeLog(req, res, next, 200, userUpdated._id)
        return res.status(200).send({ user: userUpdated })
      }
    })
}

function initConnectionDB (database) {
  const Model = require('./../models/model')

  const EmployeeTypeSchema = require('./../models/employee-type')
  EmployeeType = new Model('employee-type', {
    schema: EmployeeTypeSchema,
    connection: database
  })

  const EmployeeSchema = require('./../models/employee')
  Employee = new Model('employee', {
    schema: EmployeeSchema,
    connection: database
  })

  const CompanySchema = require('./../models/company')
  Company = new Model('company', {
    schema: CompanySchema,
    connection: database
  })

  const OriginSchema = require('./../models/origin')
  Origin = new Model('origin', {
    schema: OriginSchema,
    connection: database
  })

  const BranchSchema = require('./../models/branch')
  Branch = new Model('branch', {
    schema: BranchSchema,
    connection: database
  })

  const PrinterSchema = require('./../models/printer')
  Printer = new Model('printer', {
    schema: PrinterSchema,
    connection: database
  })

  const CashBoxTypeSchema = require('./../models/cash-box-type')
  CashBoxType = new Model('cash-box-type', {
    schema: CashBoxTypeSchema,
    connection: database
  })

  const PermissionSchema = require('./../models/permission')
  Permission = new Model('permission', {
    schema: PermissionSchema,
    connection: database
  })

  const UserSchema = require('./../models/user')
  User = new Model('user', {
    schema: UserSchema,
    connection: database
  })
}

module.exports = {
  getUser,
  getUsers,
  getUsersV2,
  saveUser,
  updateUser,
  deleteUser
}
