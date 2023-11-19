'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let Company;
let VATCondition;
let User;
let Transaction;
let CompanyGroup;
let Employee;
let IdentificationType;
let State;
let Country;
let Transport;
let PriceList;
let Account;

function getCompany(req, res, next, id = undefined) {

    initConnectionDB(req.session.database);

    let companyId;
    if (id) {
        companyId = id;
    } else {
        companyId = req.query.id;
    }

    Company.findById(companyId, (err, company) => {
        if (err) {
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(constants.ERR_SERVER);
        } else {
            if (!company || company.operationType == 'D') {
                fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
                return res.status(404).send(constants.NO_DATA_FOUND);
            } else if (company === undefined) {
                fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
                return res.status(200).send({ message: constants.NO_DATA_FOUND });
            } else {
                fileController.writeLog(req, res, next, 200, company);
                return res.status(200).send({ company: company });
            }
        }
    })
        .populate({
            path: 'vatCondition',
            model: VATCondition
        })
        .populate({
            path: 'employee',
            model: Employee
        })
        .populate({
            path: 'transport',
            model: Transport
        })
        .populate({
            path: 'priceList',
            model: PriceList
        })
        .populate({
            path: 'state',
            model: State
        })
        .populate({
            path: 'country',
            model: Country
        })
        .populate({
            path: 'group',
            model: CompanyGroup
        })
        .populate({
            path: 'identificationType',
            model: IdentificationType
        })
        .populate({
            path: 'account',
            model: Account
        })
        .populate({
            path: 'creationUser',
            model: User
        })
        .populate({
            path: 'updateUser',
            model: User
        })

}

function getCompanies(req, res, next) {


    initConnectionDB(req.session.database);

    //http://localhost:3000/api/companies/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"

    let where = JSON.parse('{"operationType": {"$ne": "D"}}');
    let limit = 0;
    let select = "";
    let sort = "";
    let skip = 0;
    let error;

    if (req.query.query !== undefined) {

        req.query.query.split("&").forEach(function (part) {
            let item = part.split("=");
            let json;
            switch (item[0]) {
                case 'where':
                    json = '{"$and":[{"operationType": {"$ne": "D"}},';
                    json = json + "{" + item[1] + "}]}";
                    try {
                        where = JSON.parse(json);
                    } catch (err) {
                        fileController.writeLog(req, res, next, 500, json);
                        error = err;
                    }
                    break;
                case 'limit':
                    try {
                        limit = parseInt(item[1]);
                    } catch (err) {
                        error = err;
                    }
                    break;
                case 'select':
                    try {
                        select = item[1].replace(/,/g, " ");
                    } catch (err) {
                        error = err;
                    }
                    break;
                case 'sort':
                    json = "{" + item[1] + "}";
                    try {
                        sort = JSON.parse(json);
                    } catch (err) {
                        error = err;
                    }
                    break;
                case 'skip':
                    try {
                        skip = parseInt(item[1]);
                    } catch (err) {
                        error = err;
                    }
                    break;
                default:
            }
        });
    }

    if (error) {
        fileController.writeLog(req, res, next, 500, error);
        return res.status(500).send(constants.ERR_SERVER);
    }

    Company.find(where).
        limit(limit).
        select(select).
        sort(sort).
        skip(skip).
        exec((err, companies) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                if (!companies) {
                    fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
                    return res.status(404).send(constants.NO_DATA_FOUND);
                } else if (companies.length === 0) {
                    fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
                    return res.status(200).send({ message: constants.NO_DATA_FOUND });
                } else {
                    VATCondition.populate(companies, { path: 'vatCondition' }, (err, companies) => {
                        if (err) {
                            fileController.writeLog(req, res, next, 500, err);
                            return res.status(500).send(constants.ERR_SERVER);
                        } else {
                            User.populate(companies, { path: 'creationUser' }, (err, companies) => {
                                if (err) {
                                    fileController.writeLog(req, res, next, 500, err);
                                    return res.status(500).send(constants.ERR_SERVER);
                                } else {
                                    Account.populate(companies, { path: 'account' }, (err, companies) => {
                                        if (err) {
                                            fileController.writeLog(req, res, next, 500, err);
                                            return res.status(500).send(constants.ERR_SERVER);
                                        } else {
                                            Employee.populate(companies, { path: 'employee' }, (err, companies) => {
                                                if (err) {
                                                    fileController.writeLog(req, res, next, 500, err);
                                                    return res.status(500).send(constants.ERR_SERVER);
                                                } else {
                                                    Transport.populate(companies, { path: 'transport' }, (err, companies) => {
                                                        if (err) {
                                                            fileController.writeLog(req, res, next, 500, err);
                                                            return res.status(500).send(constants.ERR_SERVER);
                                                        } else {
                                                            PriceList.populate(companies, { path: 'priceList' }, (err, companies) => {
                                                                if (err) {
                                                                    fileController.writeLog(req, res, next, 500, err);
                                                                    return res.status(500).send(constants.ERR_SERVER);
                                                                } else {
                                                                    State.populate(companies, { path: 'state' }, (err, companies) => {
                                                                        if (err) {
                                                                            fileController.writeLog(req, res, next, 500, err);
                                                                            return res.status(500).send(constants.ERR_SERVER);
                                                                        } else {
                                                                            Country.populate(companies, { path: 'country' }, (err, companies) => {
                                                                                if (err) {
                                                                                    fileController.writeLog(req, res, next, 500, err);
                                                                                    return res.status(500).send(constants.ERR_SERVER);
                                                                                } else {
                                                                                    User.populate(companies, { path: 'updateUser' }, (err, companies) => {
                                                                                        if (err) {
                                                                                            fileController.writeLog(req, res, next, 500, err);
                                                                                            return res.status(500).send(constants.ERR_SERVER);
                                                                                        } else {
                                                                                            CompanyGroup.populate(companies, { path: 'group' }, (err, companies) => {
                                                                                                if (err) {
                                                                                                    fileController.writeLog(req, res, next, 500, err);
                                                                                                    return res.status(500).send(constants.ERR_SERVER);
                                                                                                } else if (!companies) {
                                                                                                    fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
                                                                                                    return res.status(404).send(constants.NO_DATA_FOUND);
                                                                                                } else {
                                                                                                    IdentificationType.populate(companies, { path: 'identificationType' }, (err, companies) => {
                                                                                                        if (err) {
                                                                                                            fileController.writeLog(req, res, next, 500, err);
                                                                                                            return res.status(500).send(constants.ERR_SERVER);
                                                                                                        } else if (!companies) {
                                                                                                            fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
                                                                                                            return res.status(404).send(constants.NO_DATA_FOUND);
                                                                                                        } else {
                                                                                                            fileController.writeLog(req, res, next, 200, companies.length);
                                                                                                            return res.status(200).send({ companies: companies });
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
}

function getCompaniesV2(req, res, next) {

    initConnectionDB(req.session.database);

    let queryAggregate = [];
    let group;

    if (req.query && req.query !== {}) {

        let error;

        let project = req.query.project;
        if (project && project !== {} && project !== "{}") {
            try {
                project = JSON.parse(project);

                if (searchPropertyOfArray(project, 'vatCondition.')) {
                    queryAggregate.push({ $lookup: { from: "vat-conditions", foreignField: "_id", localField: "vatCondition", as: "vatCondition" } });
                    queryAggregate.push({ $unwind: { path: "$vatCondition", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'group.')) {
                    queryAggregate.push({ $lookup: { from: "company-groups", foreignField: "_id", localField: "group", as: "group" } });
                    queryAggregate.push({ $unwind: { path: "$group", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'employee.')) {
                    queryAggregate.push({ $lookup: { from: "employees", foreignField: "_id", localField: "employee", as: "employee" } });
                    queryAggregate.push({ $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'state.')) {
                    queryAggregate.push({ $lookup: { from: "states", foreignField: "_id", localField: "state", as: "state" } });
                    queryAggregate.push({ $unwind: { path: "$state", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'country.')) {
                    queryAggregate.push({ $lookup: { from: "countries", foreignField: "_id", localField: "country", as: "country" } });
                    queryAggregate.push({ $unwind: { path: "$country", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'identificationType.')) {
                    queryAggregate.push({ $lookup: { from: "identification-types", foreignField: "_id", localField: "identificationType", as: "identificationType" } });
                    queryAggregate.push({ $unwind: { path: "$identificationType", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'transport.')) {
                    queryAggregate.push({ $lookup: { from: "transports", foreignField: "_id", localField: "transport", as: "transport" } });
                    queryAggregate.push({ $unwind: { path: "$transport", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'priceList.')) {
                    queryAggregate.push({ $lookup: { from: "price-lists", foreignField: "_id", localField: "priceList", as: "priceList" } });
                    queryAggregate.push({ $unwind: { path: "$priceList", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'creationUser.')) {
                    queryAggregate.push({ $lookup: { from: "users", foreignField: "_id", localField: "creationUser", as: "creationUser" } });
                    queryAggregate.push({ $unwind: { path: "$creationUser", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'updateUser.')) {
                    queryAggregate.push({ $lookup: { from: "users", foreignField: "_id", localField: "updateUser", as: "updateUser" } });
                    queryAggregate.push({ $unwind: { path: "$updateUser", preserveNullAndEmptyArrays: true } });
                }

                let sort = req.query.sort;
                if (sort && sort !== {} && sort !== "{}") {
                    try {
                        queryAggregate.push({ $sort: JSON.parse(sort) });
                    } catch (err) {
                        error = err;
                    }
                }

                queryAggregate.push({ $project: project });
            } catch (err) {
                error = err;
            }
        } else {
            let sort = req.query.sort;
            if (sort && sort !== {} && sort !== "{}") {
                try {
                    queryAggregate.push({ $sort: JSON.parse(sort) });
                } catch (err) {
                    error = err;
                }
            }
        }

        let match = req.query.match;
        if (match && match !== "{}" && match !== {}) {
            try {
                queryAggregate.push({ $match: JSON.parse(match) });
            } catch (err) {
                error = err;
            }
        }

        group = req.query.group;
        if (group && group !== "{}" && group !== {}) {
            try {
                queryAggregate.push({ $group: JSON.parse(group) });
            } catch (err) {
                error = err;
            }
        }

        let limit = req.query.limit;
        let skip = req.query.skip;
        if (limit) {
            try {
                limit = parseInt(limit);
                if (limit > 0) {
                    if (skip) {
                        skip = parseInt(skip);
                    } else {
                        skip = 0;
                    }
                    if (group && group !== "{}" && group !== {}) {
                        let projectGroup;
                        if (searchPropertyOfArray(JSON.parse(group), 'companies')) {
                            projectGroup = `{ "companies": { "$slice": ["$companies", ${skip}, ${limit}] }`;
                        } else {
                            projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
                        }
                        for (let prop of Object.keys(JSON.parse(group))) {
                            if (prop !== 'companies' && prop !== 'items') {
                                projectGroup += `, "${prop}": 1`;
                            }
                        }
                        projectGroup += `}`;
                        queryAggregate.push({ $project: JSON.parse(projectGroup) });
                    } else {
                        queryAggregate.push({ $limit: limit });
                        queryAggregate.push({ $skip: skip });
                    }
                }
            } catch (err) {
                error = err;
            }
        }

        if (error) {
            fileController.writeLog(req, res, next, 500, error);
            return res.status(500).send(error);
        }
    }

    queryAggregate = EJSON.parse(JSON.stringify(queryAggregate));

    Company.aggregate(queryAggregate)
        .then(function (result) {
            fileController.writeLog(req, res, next, 200, result.length);
            if (result.length > 0) {
                if (group && group !== "{}" && group !== {}) {
                    return res.status(200).send(result);
                } else {
                    return res.status(200).send({ companies: result });
                }
            } else {
                if (group && group !== "{}" && group !== {}) {
                    return res.status(200).send({ count: 0, companies: [] });
                } else {
                    return res.status(200).send({ companies: [] });
                }
            }
        }).catch(err => {
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(err);
        });
}

function searchPropertyOfArray(array, value) {
    let n = false;
    for (let a of Object.keys(array)) { if (!n) n = a.includes(value); }
    return n;
}

function saveCompany(req, res, next) {

    initConnectionDB(req.session.database);

    let company = new Company();
    let params = req.body;

    company.code = params.code;
    company.name = params.name;
    company.fantasyName = params.fantasyName;
    company.entryDate = params.entryDate;
    company.type = params.type;
    company.identificationType = params.identificationType;
    company.identificationValue = params.identificationValue;
    company.vatCondition = params.vatCondition;
    company.grossIncome = params.grossIncome;
    company.address = params.address;
    company.city = params.city;
    company.phones = params.phones;
    company.emails = params.emails;
    company.gender = params.gender;
    company.birthday = params.birthday;
    company.observation = params.observation;
    company.allowCurrentAccount = params.allowCurrentAccount;
    company.group = params.group;
    company.employee = params.employee;
    company.otherFields = params.otherFields;
    company.country = params.country;
    company.floorNumber = params.floorNumber;
    company.flat = params.flat;
    company.state = params.state;
    company.addressNumber = params.addressNumber;
    company.transport = params.transport;
    company.priceList = params.priceList;
    company.latitude = params.latitude;
    company.longitude = params.longitude;
    company.discount = params.discount;
    company.account = params.account;
    company.wooId = params.wooId;
    company.zipCode = params.zipCode;

    if (req.session) {
        let user = new User();
        user._id = req.session.user;
        company.creationUser = user;
    }
    company.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    company.operationType = 'C';


    if (company.name &&
        company.type) {
        company.save((err, companySaved) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                getCompany(req, res, next, companySaved._id);
            }
        });
    } else {
        fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA);
        return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
    }
}

function saveExcel(req, res, next) {

    initConnectionDB(req.session.database);
    if (req.headers.file) {
        let array = []
        let route = `/home/clients/${req.session.database}/excel/${req.headers.file}`;
        let exceltojson = require("xlsx-to-json");
        exceltojson(
            {
                input: route,
                output: null,
                lowerCaseHeaders: true,
            },
            async (err, rows) => {
                let arraySend = [];
                if (err) {
                    array = [{
                        status: 500,
                        err: err,
                        message: "no entro al excel",
                    }];
                } else {
                    if (rows.length > 0) {
                        for (let i = 0; i < rows.length; i++) {
                            let companies = new Company()

                                companies.type = 'Cliente'
                                companies.code = rows[i]["id"];
                                companies.name = rows[i]["Nombre"];
                                companies.address = rows[i]["Domicilio"];
                                companies.phones = rows[i]["Tel"];
                                companies.fantasyName = rows[i]["RazonSocial"];
                                companies.emails = rows[i]["Correo"];
                                companies.zipCode = rows[i]["CodigoPostal"];
                                companies.city = rows[i]['Localidad'];


                                companies.identificationValue = rows[i]["NumeroIdentificacion"]
                                try {
                                    companies.vatCondition = await getvatCondition(rows[i]["Contribuyente"]);
                                    companies.identificationType = await getIdetificationType(rows[i]["TipoIdentificacion"])
                                } catch (error) {
                                    continue;
                                }
                                
                                if (req.session) {
                                    let user = new User();
                                    user._id = req.session.user;
                                    companies.creationUser = user;
                                }
                                companies.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
                                companies.operationType = 'C';

                                await updateExcel(companies).then(r => {
                                    if (r) {
                                        array.push([i + 2, 0, 200, 'save'])
                                    }
                                }).catch(e => {
                                    if (e) {
                                        array.push([i + 2, 0, 500, 'err'])
                                    }
                                })
                        }
                        for (let z = 0; z < array.length; z++) {
                            let element =
                            {
                                status: array[z][2],
                                message: array[z][3],
                                code: array[z][1],
                                filaExcel: array[z][0]
                            }
                            arraySend.push(element)
                        }

                        return res.send(arraySend)
                    }
                }
                return res.send(arraySend)
            }
        )
        async function updateExcel(params) {
            return new Promise((resolve, reject) => {
                params.save()
                    .then(async (result) => {
                        resolve(result)
                    })
                    .catch(async (err) => {
                        reject(err)
                    })

            })
        }
        async function assignGroup(name) {
            // name = 'ZONA ' + name
            let match = {
                'description': name,
                'operationType': { $ne: 'D' }
            };
            return new Promise((resolve, reject) => {
                CompanyGroup.find(match)
                    .then((result) => {
                        if (result.length > 0) {
                            resolve(result[0]._id);
                        } else {
                            resolve(null)
                        }
                    }
                    ).catch((err) => {
                        reject(null);
                    });
            })

        }
        async function getAccount(name) {
            let match = {
                'description': name,
                'operationType': { $ne: 'D' }
            };
            return new Promise((resolve, reject) => {
                Account.find(match)
                    .then((result) => {
                        if (result.length > 0) {
                            resolve(result[0]._id);
                        } else {
                            resolve(null)
                        }
                    }
                    ).catch((err) => {
                        reject(null);
                    });
            })
        }
        async function getIdetificationType(name) {
            let match = {
                'name': name,
                'operationType': { $ne: 'D' }
            };
            return new Promise((resolve, reject) => {
                IdentificationType.find(match)
                    .then((result) => {
                        if (result.length > 0) {
                            resolve(result[0]._id);
                        } else {
                            resolve(null)
                        }
                    }
                    ).catch((err) => {
                        reject(null);
                    });
            })
        }
        async function getCountry(name) {
            let match = {
                'name': name,
                'operationType': { $ne: 'D' }
            };
            return new Promise((resolve, reject) => {
                Country.find(match)
                    .then((result) => {
                        if (result.length > 0) {
                            resolve(result[0]._id);
                        } else {
                            resolve(null)
                        }
                    }
                    ).catch((err) => {
                        reject(null);
                    });
            })
        }
        async function getProvince(prov) {
            let match = {
                'name': prov,
                'operationType': { $ne: 'D' }
            };
            let project = {
                '_id': 1,
                'name': 1,
                'country': 1,
                'operationType': 1,
            }
            return new Promise((resolve, reject) => {
                State.find(match)
                    .then((result) => {
                        if (result.length > 0) {
                            resolve(result[0]._id);
                        } else {
                            resolve(null)
                        }
                    }
                    ).catch((err) => {
                        reject(err);
                    });
            })
        };
        async function getvatCondition(params) {
            let match = { 'description': params, 'operationType': { $ne: 'D' } };
            let project = {
                '_id': 1,
                'description': 1,
                'operationType': 1,
            }
            return new Promise((resolve, reject) => {
                VATCondition.find(match)
                    .then((result) => {
                        if (result.length > 0) {
                            resolve(result[0]._id);
                        } else {
                            resolve(null)
                        }
                    }
                    ).catch((err) => {
                        reject(err);
                    });
            })
        }
    }
}

function updateCompany(req, res, next) {

    initConnectionDB(req.session.database);

    let companyId = req.query.id;
    let company = req.body;

    let user = new User();
    user._id = req.session.user;
    company.updateUser = user;
    company.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    company.operationType = 'U';

    if (
        company.name &&
        company.type) {

        Company.findByIdAndUpdate(companyId, company, (err, companyUpdated) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                getCompany(req, res, next, companyUpdated._id);
            }
        });


    } else {
        fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA);
        return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
    }
}

function deleteCompany(req, res, next) {

    initConnectionDB(req.session.database);

    let companyId = req.query.id;

    let user = new User();
    user._id = req.session.user;

    Company.findByIdAndUpdate(companyId,
        {
            $set: {
                updateUser: user,
                updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
                operationType: 'D'
            }
        }, (err, companyUpdated) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                fileController.writeLog(req, res, next, 200, companyUpdated._id);
                return res.status(200).send({ company: companyUpdated });
            }
        });
}

function getQuantityOfCompaniesByType(req, res, next) {

    initConnectionDB(req.session.database);

    let query;
    try {
        query = JSON.parse(req.query.query);
    } catch (err) {
        fileController.writeLog(req, res, next, 500, err);
        return res.status(500).send(constants.ERR_SERVER);
    }
    let type = query.type;
    let startDate = query.startDate;
    let endDate = query.endDate;
    query = [
        {
            $match: {
                $and: [
                    {
                        "type": type
                    }
                    // ,
                    // {
                    //     "entryDate": {
                    //         $gte: new Date(startDate)
                    //     }
                    // },
                    // {
                    //     "entryDate": {
                    //         $lte: new Date(endDate)
                    //     }
                    // }
                ]
            }
        },
        {
            $group: {
                // _id: { type: "$type", month: { $month: "$entryDate" }, year: { $year: "$entryDate" } },
                _id: { type: "$type" },
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                "_id.month": 1
            }
        }
    ];

    Company.aggregate(query)
        .then(function (result) {
            fileController.writeLog(req, res, next, 200, result.length);
            return res.status(200).send({ quantityOfComapaniesByType: result });
        }).catch(err => {
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(err);
        });
}

function getSalesByCompany(req, res, next) {

    const mongoose = require('mongoose');

    initConnectionDB(req.session.database);

    let query;
    try {
        query = JSON.parse(req.query.query);
    } catch (err) {
        fileController.writeLog(req, res, next, 500, err);
        return res.status(500).send(constants.ERR_SERVER);
    }

    let type = query.type;
    let currentAccount = query.currentAccount;
    let modifyStock = query.modifyStock;
    let startDate = query.startDate;
    let endDate = query.endDate;
    let sort = query.sort;
    let limit = query.limit;
    let branch = query.branch;

    let queryAggregate = [];
    queryAggregate.push({
        $lookup:
        {
            from: "companies",
            localField: "company",
            foreignField: "_id",
            as: "company"
        }
    });
    queryAggregate.push({
        $unwind: "$company"
    });
    queryAggregate.push({
        $match: {
            $and: [
                {
                    "endDate": {
                        $gte: new Date(startDate)
                    }
                },
                {
                    "endDate": {
                        $lte: new Date(endDate)
                    }
                },
                {
                    "state": "Cerrado",
                },
                {
                    "operationType": { "$ne": "D" }
                }
            ]
        }
    });
    if (branch && branch !== "") {
        queryAggregate.push({
            $match:
            {
                "branchDestination": mongoose.Types.ObjectId(branch)
            }
        });
    }
    queryAggregate.push({
        $lookup:
        {
            from: "transaction-types",
            localField: "type",
            foreignField: "_id",
            as: "type"
        }
    });
    queryAggregate.push({
        $unwind: "$type"
    });
    queryAggregate.push({
        $match:
        {
            $and:
                [
                    {
                        "type.transactionMovement": type,
                        "type.currentAccount": currentAccount,
                        "type.modifyStock": modifyStock
                    }
                ],
        }
    });
    queryAggregate.push({
        $project: {
            company: "$company",
            count: {
                $cond:
                    [
                        {
                            $and:
                                [
                                    { $eq: ["$type.movement", "Entrada"] }
                                ]
                        }, 1, -1
                    ],
            },
            totalPrice: {
                $cond:
                    [
                        {
                            $and:
                                [
                                    { $eq: ["$type.movement", "Entrada"] }
                                ]
                        }, "$totalPrice", { $multiply: ["$totalPrice", -1] }
                    ],
            },
        }
    });
    queryAggregate.push({
        $group: {
            _id: "$company",
            count: { $sum: "$count" },
            total: { $sum: "$totalPrice" }
        }
    });
    queryAggregate.push({
        $project: {
            company: "$_id",
            count: 1,
            total: 1
        }
    });
    queryAggregate.push({ $sort: sort });

    if (limit && limit != 0) {
        queryAggregate.push({ $limit: limit });
    }

    Transaction.aggregate(queryAggregate).
        then(function (result) {
            fileController.writeLog(req, res, next, 200, result.length);
            return res.status(200).send(result);
        }).catch(err => {
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(err);
        });
}

function getSummaryOfAccounts(req, res, next) {

    initConnectionDB(req.session.database);

    let params = JSON.parse(req.query.query);

    let startDate = params.startDate;
    let endDate = params.endDate;
    let companyType = params.companyType;
    let transactionMovement = params.transactionMovement;
    let invertedView = params.invertedView;
    let dataSelect = params.dataSelect;

    let queryAggregate = [];

    queryAggregate.push({
        $match: {
            $and: [
                {
                    "state": "Cerrado",
                },
                {
                    "operationType": { "$ne": "D" },
                }
            ]
        }
    });

    queryAggregate.push(
        {
            $lookup:
            {
                from: "movements-of-cashes",
                localField: "_id",
                foreignField: "transaction",
                as: "movement-of-cash"
            }
        },
        {
            $unwind: "$movement-of-cash"
        },
        {
            $match: {
                $and: [
                    {
                        "movement-of-cash.operationType": { "$ne": "D" },
                    }
                ]
            }
        }
    );

    if (dataSelect === "transaction") {
        queryAggregate.push({
            $match: {
                $and: [
                    {
                        "endDate": {
                            $gte: new Date(startDate)
                        }
                    },
                    {
                        "endDate": {
                            $lte: new Date(endDate)
                        }
                    }
                ]
            }
        });
    } else {
        queryAggregate.push(
            {
                $match: {
                    $and: [
                        {
                            "movement-of-cash.expirationDate": {
                                $gte: new Date(startDate)
                            }
                        },
                        {
                            "movement-of-cash.expirationDate": {
                                $lte: new Date(endDate)
                            }
                        }
                    ]
                }
            }
        );
    }

    queryAggregate.push(
        { $lookup: { from: "transaction-types", localField: "type", foreignField: "_id", as: "type" } },
        { $unwind: "$type" },
        {
            $match: {
                $and: [
                    {
                        "type.currentAccount": { $ne: "No" },
                        "type.transactionMovement": transactionMovement
                    }
                ]
            }
        },
        {
            $lookup:
            {
                from: "companies",
                localField: "company",
                foreignField: "_id",
                as: "company"
            }
        },
        { $unwind: "$company" },
        {
            $match: {
                $and: [
                    {
                        "company.operationType": { "$ne": "D" },
                        "company.type": companyType,
                    }
                ]
            }
        },
        {
            $lookup:
            {
                from: "payment-methods",
                localField: "movement-of-cash.type",
                foreignField: "_id",
                as: "movement-of-cash.type"
            }
        },
        {
            $unwind: "$movement-of-cash.type"
        },
        {
            $lookup:
            {
                from: "employees",
                localField: "company.employee",
                foreignField: "_id",
                as: "company.employee"
            }
        },
        {
            $unwind:
            {
                path: "$company.employee",
                preserveNullAndEmptyArrays: true
            }
        }
    );

    queryAggregate.push({
        $project:
        {
            companyId: "$company._id",
            companyType: "$company.type",
            companyName: "$company.name",
            identificationValue: "$company.identificationValue",
            companyAddress: "$company.address",
            companyPhones: "$company.phones",
            companyEmails: "$company.emails",
            companyEmployee: "$company.employee.name",
            debe:
            {
                $cond:
                    [
                        {
                            $and:
                                [
                                    { $eq: ["$type.currentAccount", "Si"] },
                                    { $eq: ["$type.movement", "Entrada"] },
                                    { $eq: ["$movement-of-cash.type.isCurrentAccount", true] }
                                ]
                        }, "$movement-of-cash.amountPaid", {
                            $cond:
                                [
                                    {
                                        $and:
                                            [
                                                { $eq: ["$type.currentAccount", "Cobra"] },
                                                { $eq: ["$type.movement", "Salida"] }
                                            ]
                                    }, "$movement-of-cash.amountPaid", 0
                                ],
                        }
                    ]
            },
            haber:
            {
                $cond:
                    [
                        {
                            $and:
                                [
                                    { $eq: ["$type.currentAccount", "Si"] },
                                    { $eq: ["$type.movement", "Salida"] },
                                    { $eq: ["$movement-of-cash.type.isCurrentAccount", true] }
                                ]
                        }, "$movement-of-cash.amountPaid", {
                            $cond:
                                [
                                    {
                                        $and:
                                            [
                                                { $eq: ["$type.currentAccount", "Cobra"] },
                                                { $eq: ["$type.movement", "Entrada"] }
                                            ]
                                    }, "$movement-of-cash.amountPaid", 0
                                ],
                        }
                    ],
            }
        }
    },
        {
            $group: {
                _id: {
                    companyId: "$companyId"
                },
                companyName: {
                    $first: "$companyName"
                },
                companyType: {
                    $first: "$companyType"
                },
                identificationValue: {
                    $first: "$identificationValue"
                },
                companyAddress: {
                    $first: "$companyAddress"
                },
                companyPhones: {
                    $first: "$companyPhones"
                },
                companyEmails: {
                    $first: "$companyEmails"
                },
                companyEmployee: {
                    $first: "$companyEmployee"
                },
                sdebe: { $sum: "$debe" },
                shaber: { $sum: "$haber" }
            }
        },
        {
            $project: {
                _id: 1,
                companyName: 1,
                companyType: 1,
                identificationValue: 1,
                companyAddress: 1,
                companyPhones: 1,
                companyEmails: 1,
                companyEmployee: 1,
                balance: {
                    $cond:
                        [
                            {
                                $or:
                                    [
                                        {
                                            $and: [
                                                { $eq: ["$companyType", "Cliente"] },
                                                { $eq: [invertedView, false] }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { $eq: ["$companyType", "Proveedor"] },
                                                { $eq: [invertedView, true] }
                                            ]
                                        }
                                    ]
                            },
                            { $subtract: ["$sdebe", "$shaber"] },
                            { $subtract: ["$shaber", "$sdebe"] }
                        ]
                }
            }
        });

    Transaction.aggregate(queryAggregate)
        .allowDiskUse(true)
        .then(function (result) {
            fileController.writeLog(req, res, next, 200, result.length);
            return res.status(200).send(result);
        }).catch(err => {
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(err);
        });

}

function getSummaryOfAccountsByCompany(req, res, next) {

    let mongodb = require("mongodb");

    initConnectionDB(req.session.database);

    let queryParams = JSON.parse(req.query.query);

    let detailsPaymentMethod = queryParams.detailsPaymentMethod;
    let company = queryParams.company;
    let startDate = queryParams.startDate;
    let endDate = queryParams.endDate;
    let transactionMovement = queryParams.transactionMovement;
    let invertedView = queryParams.invertedView;
    let transactionTypes = queryParams.transactionTypes;
    let transactionBalance = queryParams.transactionBalance;

    let ObjectID = mongodb.ObjectID;

    let query = [];
    query.push({
        $match: {
            $and: [
                {
                    "state": "Cerrado",
                },
                {
                    "operationType": { "$ne": "D" },
                },
                {
                    "company": { "$oid": company }
                },
                {
                    "endDate": {
                        $gte: { $date: startDate.split(" ")[0] + "T" + startDate.split(" ")[1] }
                    }
                },
                {
                    "endDate": {
                        $lte: { $date: endDate.split(" ")[0] + "T" + endDate.split(" ")[1] }
                    }
                }
            ]
        }
    },
        {
            $lookup:
            {
                from: "transaction-types",
                localField: "type",
                foreignField: "_id",
                as: "type"
            }
        },
        { $unwind: "$type" },
        {
            $match: {
                $and: [
                    {
                        "type.currentAccount": { $ne: "No" },
                        "type.transactionMovement": transactionMovement,
                        "type._id": { $in: transactionTypes }
                    }
                ]
            }
        },
        {
            $lookup:
            {
                from: "movements-of-cashes",
                localField: "_id",
                foreignField: "transaction",
                as: "movement-of-cash"
            }
        },
        {
            $unwind: "$movement-of-cash"
        },
        {
            $match: {
                $and: [
                    {
                        "movement-of-cash.operationType": { "$ne": "D" },
                    }
                ]
            }
        },
        {
            $lookup:
            {
                from: "payment-methods",
                localField: "movement-of-cash.type",
                foreignField: "_id",
                as: "movement-of-cash.type"
            }
        },
        {
            $unwind: "$movement-of-cash.type"
        });


    query.push({
        $sort: {
            "movement-of-cash.expirationDate": 1
        }
    });

    query.push({
        $project:
        {
            transactionId: "$_id",
            transactionStartDate: "$startDate",
            transactionEndDate: "$endDate",
            transactionOrigin: "$origin",
            transactionLetter: "$letter",
            transactionNumber: "$number",
            transactionTotalPrice: "$totalPrice",
            transactionTypeId: "$type._id",
            transactionTypeName: "$type.name",
            transactionTypeLabelPrint: "$type.labelPrint",
            transactionTypeAllowEdit: "$type.allowEdit",
            transactionMovement: "$type.transactionMovement",
            typeCurrentAccount: "$type.currentAccount",
            transactionBalance: "$balance",
            paymentMethodName: "$movement-of-cash.type.name",
            quota: "$movement-of-cash.quota",
            paymentMethodExpirationDate: "$movement-of-cash.expirationDate",
            amountPaid: { $sum: "$movement-of-cash.amountPaid" },
            isCurrentAccount: "$movement-of-cash.type.isCurrentAccount",
            debe:
            {
                $cond:
                    [
                        {
                            $and:
                                [
                                    { $eq: ["$type.currentAccount", "Si"] },
                                    { $eq: ["$type.movement", "Entrada"] },
                                    { $eq: ["$movement-of-cash.type.isCurrentAccount", true] }
                                ]
                        }, "$movement-of-cash.amountPaid", {
                            $cond:
                                [
                                    {
                                        $and:
                                            [
                                                { $eq: ["$type.currentAccount", "Cobra"] },
                                                { $eq: ["$type.movement", "Salida"] }
                                            ]
                                    }, "$movement-of-cash.amountPaid", 0
                                ],
                        }
                    ]
            },
            haber:
            {
                $cond:
                    [
                        {
                            $and:
                                [
                                    { $eq: ["$type.currentAccount", "Si"] },
                                    { $eq: ["$type.movement", "Salida"] },
                                    { $eq: ["$movement-of-cash.type.isCurrentAccount", true] }
                                ]
                        }, "$movement-of-cash.amountPaid", {
                            $cond:
                                [
                                    {
                                        $and:
                                            [
                                                { $eq: ["$type.currentAccount", "Cobra"] },
                                                { $eq: ["$type.movement", "Entrada"] }
                                            ]
                                    }, "$movement-of-cash.amountPaid", 0
                                ],
                        }
                    ],
            }
        }
    });


    if (!detailsPaymentMethod) {
        query.push({
            $group: {
                _id: "$_id",
                transactionTypeName: {
                    $first: "$transactionTypeName"
                },
                transactionMovement: {
                    $first: "$transactionMovement"
                },
                transactionEndDate: {
                    $first: "$transactionEndDate"
                },
                transactionOrigin: {
                    $first: "$transactionOrigin"
                },
                transactionLetter: {
                    $first: "$transactionLetter"
                },
                transactionNumber: {
                    $first: "$transactionNumber"
                },
                transactionBalance: {
                    $first: "$transactionBalance"
                },
                transactionTypeAllowEdit: {
                    $first: "$transactionTypeAllowEdit"
                },
                transactionTotalPrice: {
                    $first: "$transactionTotalPrice"
                },
                debe: {
                    $sum: {
                        $cond:
                            [
                                {
                                    $or:
                                        [
                                            {
                                                $and: [
                                                    { $eq: ["$transactionMovement", "Venta"] },
                                                    { $eq: [invertedView, false] }
                                                ]
                                            },
                                            {
                                                $and: [
                                                    { $eq: ["$transactionMovement", "Compra"] },
                                                    { $eq: [invertedView, true] }
                                                ]
                                            }
                                        ]
                                },
                                "$debe",
                                "$haber"
                            ]
                    }
                },
                haber: {
                    $sum: {
                        $cond:
                            [
                                {
                                    $or:
                                        [
                                            {
                                                $and: [
                                                    { $eq: ["$transactionMovement", "Venta"] },
                                                    { $eq: [invertedView, false] }
                                                ]
                                            },
                                            {
                                                $and: [
                                                    { $eq: ["$transactionMovement", "Compra"] },
                                                    { $eq: [invertedView, true] }
                                                ]
                                            }
                                        ]
                                },
                                "$haber",
                                "$debe"
                            ]
                    }
                },
            }
        });
    }

    query.push({
        $sort: {
            "transactionEndDate": 1
        }
    });
    if (transactionBalance) {
        query.push({
            $match: {
                $and: [
                    {
                        "transactionBalance": transactionBalance
                    }
                ]
            }

        })
    }
    query = EJSON.parse(JSON.stringify(query));

    Transaction.aggregate(query)
        .allowDiskUse(true)
        .then(function (result) {
            fileController.writeLog(req, res, next, 200, result.length);
            return res.status(200).send(result);
        }).catch(err => {
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(err);
        });
}

function initConnectionDB(database) {

    const Model = require('./../models/model');

    let CompanySchema = require('./../models/company');
    Company = new Model('company', {
        schema: CompanySchema,
        connection: database
    });

    let VATConditionSchema = require('./../models/vat-condition');
    VATCondition = new Model('vat-condition', {
        schema: VATConditionSchema,
        connection: database
    });

    let TransactionSchema = require('./../models/transaction');
    Transaction = new Model('transaction', {
        schema: TransactionSchema,
        connection: database
    });

    let companiesGroupschema = require('./../models/company-group');
    CompanyGroup = new Model('company-group', {
        schema: companiesGroupschema,
        connection: database
    });

    let EmployeeSchema = require('./../models/employee');
    Employee = new Model('employee', {
        schema: EmployeeSchema,
        connection: database
    });

    let UserSchema = require('./../models/user');
    User = new Model('user', {
        schema: UserSchema,
        connection: database
    });

    let IdentificationTypeScheme = require('./../models/identification-type');
    IdentificationType = new Model('identification-type', {
        schema: IdentificationTypeScheme,
        connection: database
    });

    let StateScheme = require('./../models/state');
    State = new Model('state', {
        schema: StateScheme,
        connection: database
    });

    let CountryScheme = require('./../models/country');
    Country = new Model('country', {
        schema: CountryScheme,
        connection: database
    });

    let TransportScheme = require('./../models/transport');
    Transport = new Model('transport', {
        schema: TransportScheme,
        connection: database
    });

    let PriceListScheme = require('./../models/price-list');
    PriceList = new Model('price-list', {
        schema: PriceListScheme,
        connection: database
    });

    let AccountSchema = require('./../models/account');
    Account = new Model('account', {
        schema: AccountSchema,
        connection: database
    });
}

module.exports = {
    getCompany,
    getCompanies,
    getCompaniesV2,
    saveCompany,
    updateCompany,
    deleteCompany,
    getQuantityOfCompaniesByType,
    getSalesByCompany,
    getSummaryOfAccounts,
    getSummaryOfAccountsByCompany,
    saveExcel
}