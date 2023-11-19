'use strict'

var express = require('express');
var EmployeeTypeController = require('./../controllers/employee-type.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/employee-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmployeeTypeController.getEmployeeType);
api.get('/employee-types', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmployeeTypeController.getEmployeeTypes);
api.post('/employee-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmployeeTypeController.saveEmployeeType);
api.put('/employee-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmployeeTypeController.updateEmployeeType);
api.delete('/employee-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmployeeTypeController.deleteEmployeeType);

// V2
api.get('/v2/employee-types', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmployeeTypeController.getEmployeeTypesV2);

module.exports = api;