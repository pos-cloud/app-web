'use strict'

//Paquetes de terceros
const moment = require('moment');
moment.locale('es');
const bcryptjs = require('bcryptjs');
const fileController = require('./file.controller');
const EmailController = require('./email.controller');
const constants = require('./../utilities/constants');
const fs = require('fs');
const _jwt = require('./../services/jwt.services');

//Modelos
let User;
let Employee;
let EmployeeType;
let Company;
let TransactionType;
let VATCondition;
let PaymentMethod;
let Printer;
let Config;
let Database;
let Make;
let Article;
let Category;
let Table;
let Room;
let Tax;
let Permission;
let companyNumber;
let Branch;
let Deposit;
let Origin;
let IdentificationType;
let UnitOfMeasurement;
let vatConditionDefect;
let categoryCompany;
let passwordSoporte;

let dbName;
let userAdmin;
let userSoporte;

async function register(req, res, next) {
	try {
		let { companyName, password, category, email, phone } = req.body;
		let employeeTypeMozo;
		let employeeTypeRepartidor;
		let employeeTypeAdministrator;
		let identificationTypeDNI;
		let tax21;
		let employeeSoporte;
		let employeeAdmin;
		let defectPrinter;
		let defectBranch;
		let roomPrincipal;
		let roomPatio;
		let roomVereda;
		let categoryDefect;
		let makeDefect;
		let unitOfMeasurementDefect;

		initConnectionDB("poscloud");

		if (!companyName) throw { 'status': 400, message: 'Debe ingresar el nombre del negocio (companyName).' };

		if (!password) throw { 'status': 400, message: 'Debe ingresar la contraseña (password).' };

		if (!category) {
			throw { 'status': 400, message: 'Debe ingresar la categoría del negocio (category).'};
		} else {
			categoryCompany = category;
		}
		companyName = companyName.split('/').join('')
			.split('ü').join('u')
			.split('&').join('y')
			.toLocaleLowerCase()
			.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

		dbName = '';
		for (let i = 0; i < companyName.length; i++) {
			let caracter = companyName.charAt(i);
			if (validateCaracterDBName(caracter)) dbName += caracter;
		}

		if (!email) throw { 'status': 400, message: 'Debe ingresar el email del usuario (email)'};

		if (!validateEmail(email)) throw { 'status': 400, message: 'El email " + email + " es incorrecto (email)'};
		email = email.toLocaleLowerCase();

		await existsDatabase(dbName);
		await existsEmail(email);
		await saveDatabase(email);
		const lastCompanyCode = await getLastCompanyCode();

		let company = new Company();
		company.code = lastCompanyCode;
		company.name = companyName;
		company.fantasyName = companyName;
		company.emails = email;
		company.phones = phone;
		company.vatCondition = "5b9ab8adb080e719206f7423";
		company.identificationType = "5db5be9e89f91e73e45b6cb2";
		company.entryDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		company.type = "Cliente";
		company.entryDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		company.category = categoryCompany;
		company.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		company.operationType = 'C';
		company.allowCurrentAccount = true;

		company = await saveCompany(company);
		companyNumber = company.code;

		initConnectionDB(dbName);

		let employeeTypes = [
			{ description: 'Vendedor' },
			{ description: 'Cajero' },
			{ description: 'Administrador' }
		];

		if (categoryCompany === 'gastronomia') {
			employeeTypes.push({ description: 'Mozo' });
			employeeTypes.push({ description: 'Repartidor' });
		}

		for (let e of employeeTypes) {
			let employeeType = new EmployeeType();
			employeeType = Object.assign(employeeType, e);
			employeeType.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
			employeeType.operationType = 'C';

			const result = await saveEmployeeType(employeeType);
			if (e.description === 'Administrador') employeeTypeAdministrator = result;
			if (e.description === 'Mozo') employeeTypeMozo = result;
			if (e.description === 'Repartidor') employeeTypeRepartidor = result;
		}

		let employees = [
			{ name: email.split('@')[0], type: employeeTypeAdministrator },
			{ name: 'Soporte', type: employeeTypeAdministrator }
		];

		if (categoryCompany === 'gastronomia') {
			employees.push({ name: 'Mozo de prueba', type: employeeTypeMozo });
			employees.push({ name: 'Repartidor de prueba', type: employeeTypeRepartidor });
		}
		let code = 0;
		for (let e of employees) {
			let employee = new Employee();
			employee = Object.assign(employee, e);
			employee.code = code;
			employee.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
			employee.operationType = 'C';

			const result = await saveEmployee(employee);
			code++;
			if (e.name === email.split('@')[0]) employeeAdmin = result;
			if (e.name === 'Soporte') employeeSoporte = result;
		}

		let permissionAdmin = new Permission();
		permissionAdmin.collections = [];
		permissionAdmin.name = 'Administrador';
		permissionAdmin.menu = {
			articles: true,
			companies: {
				client: true,
				provider: true
			},
			config: true,
			money: true,
			production: true,
			purchases: true,
			report: true,
			sales: {
				counter: true,
				delivery: true,
				resto: true,
				voucherReader: false,
				webOrders: true
			},
			stock: true,
			gallery: true,
			resto: true
		};
		permissionAdmin.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		permissionAdmin.operationType = 'C';
		const permission = await savePermission(permissionAdmin);

		passwordSoporte = generatePassoword();
		let users = [
			{ name: email.split('@')[0], email: email, employee: employeeAdmin, password },
			{ name: 'soporte', email: 'info@poscloud.com.ar', employee: employeeSoporte, password: passwordSoporte }
		];
		for (let u of users) {
			let user = new User();
			user = Object.assign(user, u);
			user.state = "Habilitado";
			user.level = 99;
			user.tokenExpiration = 9999;
			user.permission = permission;
			user.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
			user.operationType = 'C';

			const result = await saveUser(user);
			if (u.name === email.split('@')[0]) userAdmin = result;
			if (u.name === 'soporte') userSoporte = result;
		}

		let vatConditions = [
			{ code: 1, description: 'Responsable Inscripto', discriminate: true, transactionLetter: 'A' },
			{ code: 2, description: 'Responsable No Inscripto', discriminate: true, transactionLetter: 'A' },
			{ code: 4, description: 'Exento', discriminate: false, transactionLetter: 'B' },
			{ code: 5, description: 'Consumidor Final', discriminate: false, transactionLetter: 'B' },
			{ code: 6, description: 'Monotributista', discriminate: false, transactionLetter: 'B' },
		];
		for (let v of vatConditions) {
			let vatCondition = new VATCondition();
			vatCondition = Object.assign(vatCondition, v);
			vatCondition.creationUser = userAdmin;
			vatCondition.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
			vatCondition.operationType = 'C';

			const result = await saveVATCondition(vatCondition);
			if (v.description === 'Consumidor Final') vatConditionDefect = result;
		}

		let identificationTypes = [{ name: 'CUIT', code: 80 }, { name: 'DNI', code: 96 }];
		code = 0;

		for (let i of identificationTypes) {
			let identificationType = new IdentificationType();
			identificationType = Object.assign(identificationType, i);
			identificationType.creationUser = userAdmin;
			identificationType.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
			identificationType.operationType = 'C';
			const result = await saveIdentificationType(identificationType);
		}

		let companies = [
			{ name: 'Consumidor final', type: 'Cliente'  }
		];

		code = 1;
		for (let c of companies) {
			let company = new Company();
			company = Object.assign(company, c);
			company.code = code;
			company.vatCondition = vatConditionDefect;
			company.identificationValue = '99999999'
			company.allowCurrentAccount = true;
			company.identificationType = identificationTypeDNI;
			company.entryDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
			company.entryDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
			company.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
			company.operationType = 'C';

			await saveCompany(company);
			code++;
		}

		let paymentMethods = [
			{ code: 1, name: 'Efectivo', isCurrentAccount: false, acceptReturned: true, inputAndOuput: false, checkDetail: false, cardDetail: false, allowToFinance: false, cashBoxImpact: true },
			{ code: 2, name: 'Cuenta Corriente', isCurrentAccount: true, acceptReturned: false, inputAndOuput: false, checkDetail: false, cardDetail: false, allowToFinance: false, cashBoxImpact: false },
			{ code: 3, name: 'Tarjeta de Crédito', isCurrentAccount: false, acceptReturned: false, inputAndOuput: false, checkDetail: false, cardDetail: true, allowToFinance: false, cashBoxImpact: false },
			{ code: 4, name: 'Tarjeta de Débito', isCurrentAccount: false, acceptReturned: false, inputAndOuput: false, checkDetail: false, cardDetail: true, allowToFinance: false, cashBoxImpact: false },
			{ code: 5, name: 'Cheque de Terceros', isCurrentAccount: false, acceptReturned: false, inputAndOuput: false, checkDetail: true, cardDetail: false, allowToFinance: false, cashBoxImpact: false },
		];
		for (let p of paymentMethods) {
			let paymentMethod = new PaymentMethod();
			paymentMethod = Object.assign(paymentMethod, p);
			paymentMethod.creationUser = userAdmin;
			paymentMethod.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
			paymentMethod.operationType = 'C';
			await savePaymentMethod(paymentMethod);
		}

		let taxes = [
			{ code: '5', name: 'IVA 21%', taxBase: 'Gravado', percentage: 21, classification: 'Impuesto', type: 'Nacional' },
			{ code: '4', name: 'IVA 10.5%', taxBase: 'Gravado', percentage: 10.5, classification: 'Impuesto', type: 'Nacional' },
			{ code: '04', name: 'Imp. Interno', taxBase: '', percentage: 0, classification: 'Impuesto', type: 'Nacional' },
			{ code: '7', name: 'Percepción IVA', taxBase: 'Gravado', percentage: 0, classification: 'Percepción', type: 'Nacional' },
			{ code: '3', name: 'IVA 0%', taxBase: 'Gravado', percentage: 0, classification: 'Impuesto', type: 'Nacional' },
			{ code: '6', name: 'IVA 27%', taxBase: 'Gravado', percentage: 27, classification: 'Impuesto', type: 'Nacional' }
		];
		for (let t of taxes) {
			let tax = new Tax();
			tax = Object.assign(tax, t);
			tax.creationUser = userAdmin;
			tax.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
			tax.operationType = 'C';
			const result = await saveTax(tax);
			if (t.code === '5') tax21 = result;
		}

		let printers = [
			{ name: 'Factura', pageWidth: 210, pageHigh: 297, printIn: 'Mostrador' },
			{ name: 'Etiqueta', pageWidth: 29, pageHigh: 62, printIn: 'Etiqueta' },
			{ name: 'Cocina', pageWidth: 80, pageHigh: 297, printIn: 'Cocina' },
			{ name: 'Bar', pageWidth: 80, pageHigh: 297, printIn: 'Bar' },
		];
		for (let p of printers) {
			let printer = new Printer();
			printer = Object.assign(printer, p);
			printer.type = "PDF";
			printer.creationUser = userAdmin;
			printer.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
			printer.operationType = 'C';

			const result = await savePrinter(printer);
			if (p.name === 'Factura') defectPrinter = result;
		}

		let transactionTypes = [
			// VENTA
			{ transactionMovement: 'Venta', name: 'Ticket', currentAccount: 'No', requestCompany: '', fixedLetter: 'X', movement: 'Entrada', modifyStock: false, stockMovement: null, requestArticles: true, modifyArticle: false, requestTaxes: true, requestPaymentMethods: false, defectOrders: false, electronics: false, resetNumber: false, showPrices: true, printable: true, defectPrinter: defectPrinter, tax: false, cashBoxImpact: false, cashOpening: false, cashClosing: false, allowDelete: true, codes: [] },
			{ transactionMovement: 'Venta', name: 'eFactura', currentAccount: 'Si', requestCompany: '', fixedLetter: '', movement: 'Entrada', modifyStock: true, stockMovement: 'Salida', requestArticles: true, modifyArticle: false, requestTaxes: true, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: true, printable: true, defectPrinter: defectPrinter, tax: true, cashBoxImpact: true, cashOpening: false, cashClosing: false, allowDelete: true, codes: [{ 'code': 1, 'letter': 'A' }, { 'code': 6, 'letter': 'B' }, { 'code': 11, 'letter': 'C' }] },
			{ transactionMovement: 'Venta', name: 'eNota de Crédito', currentAccount: 'Si', requestCompany: '', fixedLetter: '', movement: 'Salida', modifyStock: true, stockMovement: 'Entrada', requestArticles: true, modifyArticle: false, requestTaxes: true, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: true, printable: true, defectPrinter: defectPrinter, tax: true, cashBoxImpact: true, cashOpening: false, cashClosing: false, allowDelete: true, codes: [{ 'code': 3, 'letter': 'A' }, { 'code': 8, 'letter': 'B' }, { 'code': 13, 'letter': 'C' }] },
			{ transactionMovement: 'Venta', name: 'eNota de Débito', currentAccount: 'Si', requestCompany: '', fixedLetter: '', movement: 'Entrada', modifyStock: true, stockMovement: 'Salida', requestArticles: true, modifyArticle: false, requestTaxes: true, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: true, printable: true, defectPrinter: defectPrinter, tax: true, cashBoxImpact: true, cashOpening: false, cashClosing: false, allowDelete: true, codes: [{ 'code': 2, 'letter': 'A' }, { 'code': 7, 'letter': 'B' }, { 'code': 12, 'letter': 'C' }] },
			{ transactionMovement: 'Venta', name: 'Cobro', currentAccount: 'Cobra', requestCompany: 'Cliente', fixedLetter: 'X', movement: 'Entrada', modifyStock: false, stockMovement: null, requestArticles: false, modifyArticle: false, requestTaxes: false, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: false, printable: true, defectPrinter: defectPrinter, tax: false, cashBoxImpact: true, cashOpening: false, cashClosing: false, allowDelete: true, codes: [] },
			//{ transactionMovement: 'Venta', name: 'Ajuste de saldo (+)', currentAccount: 'Si', requestCompany: 'Cliente', fixedLetter: 'X', movement: 'Salida', modifyStock: false, stockMovement: null, requestArticles: false, modifyArticle: false, requestTaxes: false, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: false, printable: true, defectPrinter: defectPrinter, tax: false, cashBoxImpact: false, cashOpening: false, cashClosing: false, allowDelete: true, codes: [] },
			//{ transactionMovement: 'Venta', name: 'Ajuste de saldo (-)', currentAccount: 'Si', requestCompany: 'Cliente', fixedLetter: 'X', movement: 'Entrada', modifyStock: false, stockMovement: null, requestArticles: false, modifyArticle: false, requestTaxes: false, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: false, printable: true, defectPrinter: defectPrinter, tax: false, cashBoxImpact: false, cashOpening: false, cashClosing: false, allowDelete: true, codes: [] },
			// COMPRA
			{ transactionMovement: 'Compra', name: 'Factura', currentAccount: 'Si', requestCompany: 'Proveedor', fixedLetter: '', movement: 'Salida', modifyStock: true, stockMovement: 'Entrada', requestArticles: true, modifyArticle: false, requestTaxes: true, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: true, printable: false, defectPrinter: defectPrinter, tax: true, cashBoxImpact: true, cashOpening: false, cashClosing: false, allowDelete: true, codes: [{ 'code': 1, 'letter': 'A' }, { 'code': 6, 'letter': 'B' }, { 'code': 11, 'letter': 'C' }] },
			{ transactionMovement: 'Compra', name: 'Orden de Compra', currentAccount: 'No', requestCompany: 'Proveedor', fixedLetter: 'X', movement: 'Salida', modifyStock: false, stockMovement: null, requestArticles: true, modifyArticle: false, requestTaxes: true, requestPaymentMethods: false, defectOrders: false, electronics: false, resetNumber: false, showPrices: true, printable: false, defectPrinter: defectPrinter, tax: false, cashBoxImpact: false, cashOpening: false, cashClosing: false, allowDelete: true, codes: [] },
			{ transactionMovement: 'Compra', name: 'Nota de Crédito', currentAccount: 'Si', requestCompany: 'Proveedor', fixedLetter: '', movement: 'Entrada', modifyStock: true, stockMovement: 'Salida', requestArticles: true, modifyArticle: false, requestTaxes: true, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: true, printable: false, defectPrinter: defectPrinter, tax: true, cashBoxImpact: true, cashOpening: false, cashClosing: false, allowDelete: true, codes: [{ 'code': 3, 'letter': 'A' }, { 'code': 8, 'letter': 'B' }, { 'code': 13, 'letter': 'C' }] },
			{ transactionMovement: 'Compra', name: 'Nota de Débito', currentAccount: 'Si', requestCompany: 'Proveedor', fixedLetter: '', movement: 'Salida', modifyStock: true, stockMovement: 'Entrada', requestArticles: true, modifyArticle: false, requestTaxes: true, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: true, printable: false, defectPrinter: defectPrinter, tax: true, cashBoxImpact: true, cashOpening: false, cashClosing: false, allowDelete: true, codes: [{ 'code': 2, 'letter': 'A' }, { 'code': 7, 'letter': 'B' }, { 'code': 12, 'letter': 'C' }] },
			{ transactionMovement: 'Compra', name: 'Pago', currentAccount: 'Cobra', requestCompany: 'Proveedor', fixedLetter: 'X', movement: 'Salida', modifyStock: false, stockMovement: null, requestArticles: false, modifyArticle: false, requestTaxes: false, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: false, printable: false, defectPrinter: defectPrinter, tax: false, cashBoxImpact: true, cashOpening: false, cashClosing: false, allowDelete: true, codes: [] },
			//{ transactionMovement: 'Compra', name: 'Ajuste de saldo (+)', currentAccount: 'Si', requestCompany: 'Proveedor', fixedLetter: 'X', movement: 'Entrada', modifyStock: false, stockMovement: null, requestArticles: false, modifyArticle: false, requestTaxes: false, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: false, printable: false, defectPrinter: defectPrinter, tax: false, cashBoxImpact: false, cashOpening: false, cashClosing: false, allowDelete: true, codes: [] },
			//{ transactionMovement: 'Compra', name: 'Ajuste de saldo (-)', currentAccount: 'Si', requestCompany: 'Proveedor', fixedLetter: 'X', movement: 'Salida', modifyStock: false, stockMovement: null, requestArticles: false, modifyArticle: false, requestTaxes: false, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: false, printable: false, defectPrinter: defectPrinter, tax: false, cashBoxImpact: false, cashOpening: false, cashClosing: false, allowDelete: true, codes: [] },
			// INVENTARIO
			{ transactionMovement: 'Stock', name: 'Inventario', currentAccount: 'No', requestCompany: '', fixedLetter: 'X', movement: null, modifyStock: true, stockMovement: 'Inventario', requestArticles: true, modifyArticle: false, requestTaxes: false, requestPaymentMethods: false, defectOrders: false, electronics: false, resetNumber: false, showPrices: true, printable: false, defectPrinter: defectPrinter, tax: false, cashBoxImpact: false, cashOpening: false, cashClosing: false, allowDelete: true, codes: [] },
			{ transactionMovement: 'Stock', name: 'Entrada de Producto', currentAccount: 'No', requestCompany: '', fixedLetter: 'X', movement: null, modifyStock: true, stockMovement: 'Entrada', requestArticles: true, modifyArticle: false, requestTaxes: false, requestPaymentMethods: false, defectOrders: false, electronics: false, resetNumber: false, showPrices: true, printable: false, defectPrinter: defectPrinter, tax: false, cashBoxImpact: false, cashOpening: false, cashClosing: false, allowDelete: true, codes: [] },
			{ transactionMovement: 'Stock', name: 'Salida de Producto', currentAccount: 'No', requestCompany: '', fixedLetter: 'X', movement: null, modifyStock: true, stockMovement: 'Salida', requestArticles: true, modifyArticle: false, requestTaxes: false, requestPaymentMethods: false, defectOrders: false, electronics: false, resetNumber: false, showPrices: true, printable: false, defectPrinter: defectPrinter, tax: false, cashBoxImpact: false, cashOpening: false, cashClosing: false, allowDelete: true, codes: [] },
			{ transactionMovement: 'Stock', name: 'Transferencia', currentAccount: 'No', requestCompany: '', fixedLetter: 'X', movement: null, modifyStock: true, stockMovement: 'Transferencia', requestArticles: true, modifyArticle: false, requestTaxes: false, requestPaymentMethods: false, defectOrders: false, electronics: false, resetNumber: false, showPrices: true, printable: false, defectPrinter: defectPrinter, tax: false, cashBoxImpact: false, cashOpening: false, cashClosing: false, allowDelete: true, codes: [] },
			// CAJA
			{ transactionMovement: 'Fondos', name: 'Apertura de Caja', currentAccount: 'No', requestCompany: '', fixedLetter: 'X', movement: 'Entrada', modifyStock: false, stockMovement: null, requestArticles: false, modifyArticle: false, requestTaxes: false, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: false, printable: false, defectPrinter: defectPrinter, tax: false, cashBoxImpact: true, cashOpening: true, cashClosing: false, allowDelete: true, codes: [] },
			{ transactionMovement: 'Fondos', name: 'Cierre de Caja', currentAccount: 'No', requestCompany: '', fixedLetter: 'X', movement: 'Salida', modifyStock: false, stockMovement: null, requestArticles: false, modifyArticle: false, requestTaxes: false, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: false, printable: false, defectPrinter: defectPrinter, tax: false, cashBoxImpact: true, cashOpening: false, cashClosing: true, allowDelete: true, codes: [] },
			{ transactionMovement: 'Fondos', name: 'Ingreso', currentAccount: 'No', requestCompany: '', fixedLetter: 'X', movement: 'Entrada', modifyStock: false, stockMovement: null, requestArticles: false, modifyArticle: false, requestTaxes: false, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: false, printable: false, defectPrinter: defectPrinter, tax: false, cashBoxImpact: true, cashOpening: false, cashClosing: false, allowDelete: true, codes: [] },
			{ transactionMovement: 'Fondos', name: 'Retiro', currentAccount: 'No', requestCompany: '', fixedLetter: 'X', movement: 'Salida', modifyStock: false, stockMovement: null, requestArticles: false, modifyArticle: false, requestTaxes: false, requestPaymentMethods: true, defectOrders: false, electronics: false, resetNumber: false, showPrices: false, printable: false, defectPrinter: defectPrinter, tax: false, cashBoxImpact: true, cashOpening: false, cashClosing: false, allowDelete: true, codes: [] },
		];
		if (categoryCompany === 'gastronomia') {
			transactionTypes.push({ transactionMovement: 'Venta', name: 'Resto', currentAccount: 'Si', requestCompany: '', fixedLetter: 'X', movement: 'Entrada', modifyStock: true, stockMovement: 'Salida', requestArticles: true, modifyArticle: false, requestTaxes: true, requestPaymentMethods: true, defectOrders: true, electronics: false, resetNumber: false, showPrices: true, printable: true, defectPrinter: defectPrinter, tax: false, cashBoxImpact: true, cashOpening: false, cashClosing: false, allowDelete: true, codes: [] },);
		}
		for (let t of transactionTypes) {
			let transactionType = new TransactionType();
			transactionType = Object.assign(transactionType, t);
			transactionType.creationUser = userAdmin;
			transactionType.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
			transactionType.operationType = 'C';
			await saveTransactionType(transactionType);
		}

		let branch = new Branch();
		branch.number = 1;
		branch.name = 'Principal';
		branch.default = true;
		branch.creationUser = userAdmin;
		branch.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		branch.operationType = 'C';
		defectBranch = await saveBranch(branch);

		let deposit = new Deposit();
		deposit.branch = defectBranch;
		deposit.name = "Principal";
		deposit.capacity = 99;
		deposit.default = true;
		deposit.creationUser = userAdmin;
		deposit.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		deposit.operationType = 'C';
		await saveDeposit(deposit);

		let origin = new Origin();
		origin.branch = defectBranch;
		origin.number = 0;
		origin.creationUser = userAdmin;
		origin.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		origin.operationType = 'C';
		await saveOrigin(origin);

		if (categoryCompany === 'gastronomia') {
			let rooms = [
				{ description: 'Principal' },
				{ description: 'Patio' },
				{ description: 'Vereda' },
			];
			for (let r of rooms) {
				let room = new Room();
				room = Object.assign(room, r);
				room.creationUser = userAdmin;
				room.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
				room.operationType = 'C';

				const result = await saveRoom(room);
				if (r.description === 'Principal') roomPrincipal = result;
				if (r.description === 'Patio') roomPatio = result;
				if (r.description === 'Vereda') roomVereda = result;
			}
		}

		if (categoryCompany === 'gastronomia') {
			let tables = [
				{ description: 'P1', room: roomPrincipal },
				{ description: 'Patio', room: roomPatio },
				{ description: 'Vereda', roomVereda },
			];
			for (let t of tables) {
				let table = new Table();
				table = Object.assign(table, t);
				table.state = "Disponible";
				table.chair = 2;
				table.creationUser = userAdmin;
				table.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
				table.operationType = 'C';
				await saveTable(table);
			}
		}

		categoryDefect = new Category();
		categoryDefect.order = 1;
		categoryDefect.description = 'Gaseosas';
		categoryDefect.creationUser = userAdmin;
		categoryDefect.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		categoryDefect.operationType = 'C';
		categoryDefect = await saveCategory(categoryDefect);

		let make = new Make();
		make.description = 'Coca Cola';
		make.creationUser = userAdmin;
		make.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		make.operationType = 'C';
		makeDefect = await saveMake(make);

		let unitsOfMeasurements = [
			{ code: '9', abbreviation: 'Doc', name: 'docena' },
			{ code: '14', abbreviation: 'g', name: 'gramos' },
			{ code: '1', abbreviation: 'kg', name: 'kilogramos' },
			{ code: '17', abbreviation: 'km', name: 'kilómetros' },
			{ code: '5', abbreviation: 'lt', name: 'litros' },
			{ code: '2', abbreviation: 'm', name: 'metros' },
			{ code: '3', abbreviation: 'm2', name: 'metros cuadrados' },
			{ code: '4', abbreviation: 'm3', name: 'metros cúbicos' },
			{ code: '96', abbreviation: 'pk', name: 'packs' },
			{ code: '7', abbreviation: 'u', name: 'unidades' }
		];
		for (let u of unitsOfMeasurements) {
			let unitOfMeasurement = new UnitOfMeasurement();
			unitOfMeasurement = Object.assign(unitOfMeasurement, u);
			unitOfMeasurement.creationUser = userAdmin;
			unitOfMeasurement.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
			unitOfMeasurement.operationType = 'C';
			const result = await saveUnitOfMeasurement(unitOfMeasurement);
			if (u.name === 'unidades') unitOfMeasurementDefect = result;
		}

		let article = new Article();
		article.type = 'Final';
		article.containsVariants = false;
		article.code = '0000000001';
		article.barcode = '7790895000430';
		article.description = 'Coca 1.5 Lts';
		article.posDescription = 'Coca 1.5 Lts';
		article.unitOfMeasurement = unitOfMeasurementDefect;
		article.basePrice = 50;
		article.taxes = [{
			tax: tax21,
			percentage: 21,
			taxBase: 0,
			taxAmount: 10.5
		}];
		article.costPrice = 60.5;
		article.markupPercentage = 100;
		article.markupPrice = 60.5;
		article.salePrice = 121;
		article.make = makeDefect;
		article.category = categoryDefect;
		article.allowPurchase = true;
		article.allowSale = true;
		article.allowSaleWithoutStock = true;
		article.printIn = 'Mostrador';
		article.creationUser = userAdmin;
		article.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		article.operationType = 'C';
		await saveArticle(article);

		let config = new Config();
		config.numberCompany = pad(companyNumber, 6);
		const token = await generateTokenLicense(req, res, next);
		config.license = token.license;
		config.licensePaymentDueDate = token.licensePaymentDueDate;
		config.expirationLicenseDate = token.expirationLicenseDate;
		config.modules = token.modules;
		config.companyName = companyName;
		config.companyPhone = phone;
		config.emailAccount = email;
		config.creationUser = userAdmin;
		config.timezone = 'UTC-03:00';
		config.country = 'AR';
		config.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		config.operationType = 'C';
		await saveConfig(config);

		sendEmailToSales(req, res, next);
		//return res.status(200).send({ url: 'http://www.' + dbName + '.poscloud.com.ar' });
		return res.status(200).send({ password: passwordSoporte, user: userSoporte.name, db: dbName });
	} catch (error) {
		fileController.writeLog(req, res, next, error.status || 500, error);
		return res.status(error.status || 500).send({ message: error.message });
	}
}

function validateEmail(valor) {
	if (/^(?:[^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*|"[^\n"]+")@(?:[^<>()[\].,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,63}$/i.test(valor)) {
		return true;
	} else {
		return false;
	}
}

function validateCaracterDBName(valor) {
	if (/^[A-Z]+$/i.test(valor)) {
		return true;
	} else {
		return false;
	}
}

function existsDatabase(database) {
	return new Promise((resolve, reject) => {
		try {
			const where = JSON.parse('{"name": "' + database + '"}');
			Database.find(where)
				.exec((err, databases) => {
					if (err) throw err;
					else if (databases && databases.length > 0) reject({ 'status': 409, message: 'El Nombre de negocio ya se encuentra registrado.'});
					resolve();
				});
		} catch (err) { reject(err); }
	});
}

function existsEmail(email) {
	return new Promise((resolve, reject) => {
		try {
			const where = JSON.parse('{"email": "' + email + '"}');
			Database.find(where)
				.exec((err, databases) => {
					if (err) reject(err);
					else if (databases && (databases.length > 0)) reject({ 'status': 409, message: 'El email " + email + " ya se encuentra registrado.'});
					resolve();
				});
		} catch (err) {
			reject(err);
		}
	});
}

async function saveDatabase(email) {
	return new Promise(async (resolve, reject) => {
		try {
			let database = new Database();
			database.name = dbName;
			database.email = email;
			database.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
			database.operationType = 'C';

			await mkdirpath(constants.DOWNLOADS_PATH);
			await mkdirpath(constants.DOWNLOADS_PATH + database.name);
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/certificados');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/CITI');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/certificados/keys');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/certificados/xml');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/logs');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/CITI/ventas');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/CITI/compras');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/invoice');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/others');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/kitchen');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/bar');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/voucher');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/cash-box');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/images');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/images/article');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/images/category');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/images/company');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/images/make');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/backups');
			await mkdirpath(constants.DOWNLOADS_PATH + database.name + '/resource');

			database.save((error, databaseSaved) => {
				if (error) throw error
				else resolve(databaseSaved);
			});
		} catch (error) { reject(error) };
	});
}

function getLastCompanyCode() {
	return new Promise((resolve, reject) => {
		Company.find()
			.limit(1)
			.select("code")
			.sort({ "code": -1 })
			.exec((err, result) => {
				if (err) {
					reject(err);
				} else {
					if (!result) {
						companyNumber = 1;
					} else if (result.length === 0) {
						companyNumber = 1;
					} else {
						companyNumber = result[0].code + 1;
					}
					resolve(companyNumber);
				}
			});
	});
}

function saveIdentificationType(identificationType) {
	return new Promise((resolve, reject) => {
		identificationType.save((err, identificationTypeSave) => {
			if (err) {
				reject(err);
			} else {
				resolve(identificationTypeSave);
			}
		});
	});
}

function saveCompany(company) {
	return new Promise((resolve, reject) => {
		company.save((err, companySaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(companySaved);
			}
		});
	});
}

function saveCompany(company) {
	return new Promise((resolve, reject) => {
		company.save((err, companySaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(companySaved);
			}
		});
	});
}

function saveEmployeeType(employeeType) {
	return new Promise((resolve, reject) => {
		employeeType.save((err, employeeTypeSaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(employeeTypeSaved);
			}
		});
	});
}

function saveEmployee(employee) {
	return new Promise((resolve, reject) => {
		employee.save((err, employeeSaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(employeeSaved);
			}
		});
	});
}

function saveUser(user) {

	return new Promise((resolve, reject) => {
		//Encriptar la contraseña
		let bcryptjs_SALT_ROUNDS = 12;
		bcryptjs.hash(user.password, bcryptjs_SALT_ROUNDS)
			.then(function (hashedPassword) {
				//Asignar la contraseña encriptada
				user.password = hashedPassword;
				//Guardar el usuario
				user.save((err, userSaved) => {
					if (err) {
						reject(err);
					} else {
						resolve(userSaved);
					}
				});
			})
			.catch(function (err) {
				reject(err);
			});
	});
}

function generatePassoword() {

	let longitude = 8;
	let characters = "abcdefghijkmnpqrtuvwxyzABCDEFGHIJKLMNPQRTUVWXYZ2346789";
	let password = "";
	for (let i = 0; i < longitude; i++) password += characters.charAt(Math.floor(Math.random() * characters.length));
	return password;
}

function saveVATCondition(vatCondition) {
	return new Promise((resolve, reject) => {
		vatCondition.save((err, vatConditionSaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(vatConditionSaved);
			}
		});
	});
}

function saveTax(tax) {
	return new Promise((resolve, reject) => {
		tax.save((err, taxSaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(taxSaved);
			}
		});
	});
}

function savePaymentMethod(paymentMethod) {
	return new Promise((resolve, reject) => {
		paymentMethod.save((err, paymentMethodSaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(paymentMethodSaved);
			}
		});
	});
}

function savePrinter(printer) {
	return new Promise((resolve, reject) => {
		printer.save((err, printer) => {
			if (err) {
				reject(err);
			} else {
				resolve(printer);
			}
		});
	});
}

function saveTransactionType(transactionType) {
	return new Promise((resolve, reject) => {
		transactionType.save((err, transactionTypeSaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(transactionTypeSaved);
			}
		});
	});
}

async function saveBranch(branch) {
	return new Promise((resolve, reject) => {
		branch.save((err, branchSave) => {
			if (err) {
				reject(err);
			} else {
				resolve(branchSave);
			}
		});
	});
}

async function saveDeposit(deposit) {
	return new Promise((resolve, reject) => {
		deposit.save((err, depositSave) => {
			if (err) {
				reject(err);
			} else {
				resolve(depositSave);
			}
		});
	})
}

async function saveOrigin(origin) {
	return new Promise((resolve, reject) => {
		origin.save((err, originSave) => {
			if (err) {
				reject(err);
			} else {
				resolve(originSave)
			}
		});
	})
}

async function generateTokenLicense(req, res, next) {

	return new Promise(async (resolve, reject) => {
		let params = req.body;
		let counter = true;
		let resto = false;
		let delivery = false;
		let purchase = true;
		let stock = true;
		let numberOfBranches = 1;
		let app = false;
		let kitchen = false;
		let prod = false;
		let woocommerce = false;
		let mercadolibre = false;
		let accounting = false;
		let gallery = false;
		let demo = true;

		if (categoryCompany === 'gastronomia') {
			resto = true;
			delivery = true;
			kitchen = true;
		}

		if (params.counter) counter = true;
		if (params.resto) resto = true;
		if (params.delivery) delivery = true;
		if (params.purchase) purchase = true;
		if (params.stock) stock = true;
		if (params.numberOfBranches) numberOfBranches = params.numberOfBranches;
		if (params.app) app = true;
		if (params.kitchen) kitchen = true;
		if (params.prod) prod = true;
		if (params.woocommerce) woocommerce = true;
		if (params.mercadolibre) mercadolibre = true;
		if (params.accounting) accounting = true;
		if (params.gallery) gallery = true;

		let query = `
		companyNumber=${companyNumber}&
		counter=${counter}&
		resto=${resto}&
		delivery=${delivery}&
		purchase=${purchase}&
		stock=${stock}&
		kitchen=${kitchen}&
		prod=${prod}&
		woocommerce=${woocommerce}&
		mercadolibre=${mercadolibre}&
		accounting=${accounting}&
		numberOfBranches=${numberOfBranches}&
		gallery=${gallery}&
		app=${app}&
		demo=${demo}&
		days=10
		`;

		req.params.params = query;

		await _jwt.generateLicense(req, res, next).then(
			result => {
				resolve(result);
			}
		).catch(
			err => {
				reject(err);
			}
		);
	});
}

function saveConfig(config) {
	return new Promise((resolve, reject) => {
		config.save((err, configSaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(configSaved);
			}
		});
	});
}

function savePermission(permission) {
	return new Promise((resolve, reject) => {
		permission.save((err, permissionSaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(permissionSaved);
			}
		});
	});
}

function saveRoom(room) {
	return new Promise((resolve, reject) => {
		room.save((err, roomSaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(roomSaved);
			}
		});
	});
}

function saveTable(table) {
	return new Promise((resolve, reject) => {
		table.save((err, tableSaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(tableSaved);
			}
		});
	});
}

function saveCategory(category) {
	return new Promise((resolve, reject) => {
		category.save((err, categorySaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(categorySaved);
			}
		});
	});
}

function saveMake(make) {
	return new Promise((resolve, reject) => {
		make.save((err, makeSaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(makeSaved);
			}
		});
	});
}

function saveUnitOfMeasurement(unitOfMeasurement) {
	return new Promise((resolve, reject) => {
		unitOfMeasurement.save((err, unitOfMeasurementSaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(unitOfMeasurementSaved);
			}
		});
	});
}

function saveArticle(article) {
	return new Promise((resolve, reject) => {
		article.save((err, articleSaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(articleSaved);
			}
		});
	});
}

async function sendEmailToSales(req, res, next) {
	return new Promise(async (resolve, reject) => {
		let message = `<div class="_3U2q6dcdZCrTrR_42Nxby JWNdg1hee9_Rz6bIGvG1c allowTextSelection">
						<div>
						<style type="text/css" style="box-sizing:border-box; margin:0; padding:0">
						</style>
						<div class="rps_21ff">
						<div style="background:#F7F3ED; box-sizing:border-box; color:#000; font-family:"Barlow",sans-serif; font-size:16px; margin:0; overflow-x:hidden; padding:0">
						<div class="x_container" style="border:1px solid #EDECED; box-sizing:border-box; margin:50px auto; max-width:650px; padding:0; width:100%">
						<div class="x_reverse" style="box-sizing:border-box; margin:0; padding:0">
							<a href="http://poscloud.com.ar/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none">
								<div class="x_logo" style="color:white; background-color:#0275D8; background-position:center; background-repeat:no-repeat; background-size:auto 24px; box-sizing:border-box; height:60px; margin:0; padding:15px; font-size: 30px;">
									POS Cloud
								</div>
							</a>
						</div>
						<div class="x_main x_password-recovery-main" style="background:#fff; box-sizing:border-box; margin:0; padding:40px 38px; padding-top:14px; text-align:center">
						<h2 style="box-sizing:border-box; color:#0275D8; font-size:43px; font-weight:bold; line-height:1; margin:12px 0; margin-bottom:10px; padding:0">
							Registro Finalizado
						</h2>
						<h4 style="box-sizing:border-box; font-size:24px; font-weight:400; letter-spacing:-0.3; line-height:1.17; margin:0; padding:0">
							Gracias por confiar en nosotros.
						</h4>
						<div class="x_generate-password" style="box-sizing:border-box; display:flex; margin:0 auto; padding-top:20px; padding-bottom:20px;">
						<div class="x_generate-password__description" style="box-sizing:border-box; font-size:20px; letter-spacing:-0.25; line-height:1.25; margin:0; padding:0; text-align:left;">
						<span class="x_icon-arrow x_icon-arrow--inline x_icon-arrow--sm" style="background-repeat:no-repeat; background-size:contain; box-sizing:border-box; display:inline-block; height:17px; margin:0; padding:0; width:17px">
						</span>
						<p style="box-sizing:border-box; padding:0; width:100%">
							<span style="box-sizing:border-box; padding:0; margin-bottom:30px;">
								El registro se realizó con éxito, a continuación te indicaremos como utilizar el sistema.
							</span>
						</p>
						</div>
						</div>
						<hr>
						<p style="box-sizing:border-box; margin:12px; padding:0; width:100%; padding-bottom:20px; font-size:24px; font-weight:400;">
							<span style="box-sizing:border-box; margin:0; padding:0">
								Datos para ingresar al sistema:
							</span>
						</p>
						<p style="box-sizing:border-box; margin:12px; padding:0; width:100%; padding-bottom:20px; font-size:15px; font-weight:400;">
							<span style="box-sizing:border-box; margin:0; padding:0">
								Link: <a href="http://www.${dbName}.poscloud.com.ar">http://www.${dbName}.poscloud.com.ar</a>
							</span>
							<br>
							<span style="box-sizing:border-box; margin:0; padding:0">
								Usuario: ${userSoporte.name}
							</span>
							<span style="box-sizing:border-box; margin:0; padding:0">
								Password: ${passwordSoporte}
							</span>
						</p>
						<div class="x_generate-password" style="box-sizing:border-box; display:flex; margin:0 auto; padding-top:20px; padding-bottom:20px;">
						<div class="x_generate-password__description" style="box-sizing:border-box; font-size:15px; letter-spacing:-0.25; line-height:1.25; margin:0; padding:0; text-align:left;">
							Se ha activado la licencia gratuita por 10 días para la utilización del sistema. Luego un miembro del equipo se comunicará para ofrecerle una extensión de la licencia mensual en caso de seguir operando con el sistema.
						</div>
						</div>
						</div>
						</div>
						<p style="box-sizing:border-box; font-size:14px; font-weight:300; letter-spacing:normal; line-height:1.08; margin:12px 0; margin-top:20px; padding:0">
						<span style="box-sizing:border-box; margin:0; padding:0">Si necesitas ayuda no dudes en dirigirte a nuestra área de contacto en
						</span>
						<a href="http://poscloud.com.ar/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none"> http://poscloud.com.ar/
						</a>.
						<span style="box-sizing:border-box; margin:0; padding:0">Para cualquier consulta puedes escribirnos a
						</span>
						<a href="mailto:info@poscloud.com.ar" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none"> info@poscloud.com.ar
						</a>.
						</span>
						</p>
						<p style="box-sizing:border-box; font-size:14px; font-weight:300; letter-spacing:normal; line-height:1.08; margin:12px 0; margin-top:20px; padding:0; text-align: center;">
						</p>
						</div>
						</div>
						</div>
						</div>
						</div>`;

		await EmailController.sendEmail(req, res, next, 'Nuevo Registro', message, null, userSoporte.email).then(
			result => {
				resolve(result);
			}
		).catch(
			err => {
				reject(err);
			}
		);
	});
}

function pad(n, length) {
	n = n.toString();
	while (n.length < length)
		n = "0" + n;
	return n;
}

function mkdirpath(dirPath) {
	return new Promise((resolve, reject) => {
		try {
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath);
			}
			resolve();
		} catch (error) { reject(error); }
	});
}

function initConnectionDB(database) {
	let EmployeeTypeSchema = require('./../models/employee-type');
	const Model = require('./../models/model');
	EmployeeType = new Model('employee-type', {
		schema: EmployeeTypeSchema,
		connection: database
	});

	let DatabaseSchema = require('./../models/database');
	Database = new Model('database', {
		schema: DatabaseSchema,
		connection: database
	});

	let EmployeeSchema = require('./../models/employee');
	Employee = new Model('employee', {
		schema: EmployeeSchema,
		connection: database
	});

	let ConfigSchema = require('./../models/config');
	Config = new Model('config', {
		schema: ConfigSchema,
		connection: database
	});

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

	let PrinterSchema = require('./../models/printer');
	Printer = new Model('printer', {
		schema: PrinterSchema,
		connection: database
	});

	let PaymentMethodSchema = require('./../models/payment-method');
	PaymentMethod = new Model('payment-method', {
		schema: PaymentMethodSchema,
		connection: database
	});

	let TransactionTypeSchema = require('./../models/transaction-type');
	TransactionType = new Model('transaction-type', {
		schema: TransactionTypeSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

	let MakeSchema = require('./../models/make');
	Make = new Model('make', {
		schema: MakeSchema,
		connection: database
	});

	let CategorySchema = require('./../models/category');
	Category = new Model('category', {
		schema: CategorySchema,
		connection: database
	});

	let ArticleSchema = require('./../models/article');
	Article = new Model('article', {
		schema: ArticleSchema,
		connection: database
	});

	let TaxSchema = require('./../models/tax');
	Tax = new Model('tax', {
		schema: TaxSchema,
		connection: database
	});

	let TableSchema = require('./../models/table');
	Table = new Model('table', {
		schema: TableSchema,
		connection: database
	});

	let RoomSchema = require('./../models/room');
	Room = new Model('room', {
		schema: RoomSchema,
		connection: database
	});

	let BranchSchema = require('./../models/branch');
	Branch = new Model('branch', {
		schema: BranchSchema,
		connection: database
	});

	let DepositSchema = require('./../models/deposit');
	Deposit = new Model('deposit', {
		schema: DepositSchema,
		connection: database
	});

	let OriginSchema = require('./../models/origin');
	Origin = new Model('origin', {
		schema: OriginSchema,
		connection: database
	});

	let IdentificationTypeScheme = require('./../models/identification-type');
	IdentificationType = new Model('identification-type', {
		schema: IdentificationTypeScheme,
		connection: database
	});

	let UnitOfMeasurementSchema = require('./../models/unit-of-measurement');
	UnitOfMeasurement = new Model('unit-of-measurement', {
		schema: UnitOfMeasurementSchema,
		connection: database
	});

	let PermissionSchema = require('./../models/permission');
	Permission = new Model('permission', {
		schema: PermissionSchema,
		connection: database
	});
}

module.exports = {
	register
}