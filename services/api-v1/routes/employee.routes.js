'use strict'

var express = require('express');
var EmployeeController = require('./../controllers/employee.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/employee', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmployeeController.getEmployee);
api.get('/employees', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmployeeController.getEmployees);
api.get('/sales-by-employee', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmployeeController.getSalesByEmployee);
api.post('/employee', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmployeeController.saveEmployee);
api.put('/employee', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmployeeController.updateEmployee);
api.delete('/employee', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmployeeController.deleteEmployee);

// V2
api.get('/v2/employees', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmployeeController.getEmployeesV2);

module.exports = api;