'use strict'

var express = require('express');
var CompanyController = require('./../controllers/company.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');
var fs = require('fs');
const multer = require('multer');

let storage = multer.diskStorage({
    destination: function (request, file, cb) {
        let path = "/home/clients/";
        if (request.session.database) {
            path += `${request.session.database}/excel`;
        }
        fs.mkdirSync(path, { recursive: true });
        cb(null, path);
    },
    filename: function (req, file, cb) {
        cb('', file.originalname)
    },
});

const upload = multer({
    storage: storage
})


// V1
api.get('/company', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyController.getCompany);
api.get('/companies', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyController.getCompanies);
api.get('/quantity-of-companies-by-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyController.getQuantityOfCompaniesByType);
api.get('/sales-by-company', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyController.getSalesByCompany);
api.get('/summary-of-accounts', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyController.getSummaryOfAccounts);
api.get('/summary-of-accounts-by-company', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyController.getSummaryOfAccountsByCompany);
api.post('/company', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyController.saveCompany);
api.put('/company', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyController.updateCompany);
api.delete('/company', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyController.deleteCompany);
api.post('/company/save-excel', [mdAuth.ensureAuth, mdCheckLicense.ensureLic, upload.single('excel')], CompanyController.saveExcel)

// V2
api.get('/v2/companies', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyController.getCompaniesV2);

module.exports = api;