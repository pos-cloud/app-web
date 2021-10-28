"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.PointOfSaleComponent = void 0;
var core_1 = require("@angular/core");
var ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
var moment = require("moment");
require("moment/locale/es");
var room_1 = require("../room/room");
var printer_1 = require("../printer/printer");
var transaction_1 = require("../transaction/transaction");
var transaction_type_1 = require("../transaction-type/transaction-type");
var add_transaction_component_1 = require("../transaction/add-transaction/add-transaction.component");
var print_component_1 = require("../print/print/print.component");
var delete_transaction_component_1 = require("../transaction/delete-transaction/delete-transaction.component");
var add_movement_of_cash_component_1 = require("../movement-of-cash/add-movement-of-cash/add-movement-of-cash.component");
var select_employee_component_1 = require("../employee/select-employee/select-employee.component");
var view_transaction_component_1 = require("../transaction/view-transaction/view-transaction.component");
var cash_box_component_1 = require("../cash-box/cash-box/cash-box.component");
var app_config_1 = require("./../../app.config");
var cash_box_1 = require("./../../components/cash-box/cash-box");
var company_1 = require("./../../components/company/company");
var table_1 = require("./../../components/table/table");
var select_branch_component_1 = require("../branch/select-branch/select-branch.component");
var select_origin_component_1 = require("../origin/select-origin/select-origin.component");
var select_deposit_component_1 = require("../deposit/select-deposit/select-deposit.component");
var print_transaction_type_component_1 = require("../print/print-transaction-type/print-transaction-type.component");
var rxjs_1 = require("rxjs");
var select_company_component_1 = require("../company/select-company/select-company.component");
var claim_1 = require("./../../layout/claim/claim");
var send_email_component_1 = require("../send-email/send-email.component");
var translate_me_1 = require("./../../main/pipes/translate-me");
var PointOfSaleComponent = /** @class */ (function () {
    function PointOfSaleComponent(alertConfig, _roomService, _transactionService, _transactionTypeService, _printerService, _depositService, _branchService, _router, _route, _modalService, _currencyService, _cashBoxService, _tableService, _authService, _originService, _configService, _userService, _claimService, _emailService, translatePipe, _toastr, _movementOfCashService, _movementOfCancellationService) {
        this.alertConfig = alertConfig;
        this._roomService = _roomService;
        this._transactionService = _transactionService;
        this._transactionTypeService = _transactionTypeService;
        this._printerService = _printerService;
        this._depositService = _depositService;
        this._branchService = _branchService;
        this._router = _router;
        this._route = _route;
        this._modalService = _modalService;
        this._currencyService = _currencyService;
        this._cashBoxService = _cashBoxService;
        this._tableService = _tableService;
        this._authService = _authService;
        this._originService = _originService;
        this._configService = _configService;
        this._userService = _userService;
        this._claimService = _claimService;
        this._emailService = _emailService;
        this.translatePipe = translatePipe;
        this._toastr = _toastr;
        this._movementOfCashService = _movementOfCashService;
        this._movementOfCancellationService = _movementOfCancellationService;
        this.rooms = new Array();
        this.transactions = new Array();
        this.validTransactionStates = [
            transaction_1.TransactionState.Delivered.toString(),
            transaction_1.TransactionState.Open.toString(),
            transaction_1.TransactionState.Pending.toString(),
            transaction_1.TransactionState.Sent.toString(),
            transaction_1.TransactionState.Preparing.toString(),
            transaction_1.TransactionState.Packing.toString(),
            transaction_1.TransactionState.Outstanding.toString(),
            transaction_1.TransactionState.PaymentDeclined.toString(),
            transaction_1.TransactionState.PaymentConfirmed.toString()
        ];
        this.transactionMovement = transaction_type_1.TransactionMovement.Sale;
        this.orderTerm = ['startDate'];
        this.alertMessage = '';
        this.areFiltersVisible = false;
        this.loading = false;
        this.itemsPerPage = 10;
        this.eventRefreshCurrentAccount = new core_1.EventEmitter();
        this.subscription = new rxjs_1.Subscription();
        this.roomSelected = new room_1.Room();
        this.transactionTypes = new Array();
        this.originsToFilter = new Array();
    }
    PointOfSaleComponent.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pathLocation;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pathLocation = this._router.url.split('/');
                        this.userType = pathLocation[1].split('?')[0];
                        this.posType = pathLocation[2].split('?')[0];
                        return [4 /*yield*/, this._configService.getConfig.subscribe(function (config) {
                                _this.config = config;
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._authService.getIdentity.subscribe(function (identity) {
                                _this.identity = identity;
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.getUser().then(function (user) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (user) {
                                        this.user = user;
                                    }
                                    else {
                                        this.showMessage("Debe volver a iniciar sesión", "danger", false);
                                    }
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 3:
                        _a.sent();
                        this.processParams();
                        this.initInterval();
                        return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.initInterval = function () {
        var _this = this;
        setInterval(function () {
            if (_this.posType === 'delivery' || _this.posType === 'pedidos-web') {
                _this.refresh();
            }
        }, 300000);
    };
    PointOfSaleComponent.prototype.processParams = function () {
        var _this = this;
        var isLoadRefresh = false;
        this._route.queryParams.subscribe(function (params) {
            _this.companyType = params['companyType'];
            _this.transactionTypeId = params['automaticCreation'];
            _this.transactionStates = new Array();
            // RECORRER POS INSERTADOS
            if (params['origins']) {
                for (var _i = 0, _a = params['origins'].split(','); _i < _a.length; _i++) {
                    var origin = _a[_i];
                    _this.originsToFilter.push(parseInt(origin));
                }
            }
            // RECORRER ESTADOS INSERTADOS
            Object.keys(params).map(function (key) {
                if (_this.posType === 'delivery' || _this.posType === 'pedidos-web') {
                    for (var _i = 0, _a = params[key].split(','); _i < _a.length; _i++) {
                        var s = _a[_i];
                        if (_this.validTransactionStates.includes(s)) {
                            _this.transactionStates.push(s);
                        }
                    }
                    isLoadRefresh = true;
                    _this.refresh();
                }
            });
            if (_this.posType === 'delivery' && _this.transactionStates.length === 0) {
                _this.transactionStates.push(transaction_1.TransactionState.Open.toString());
                isLoadRefresh = true;
                _this.refresh();
            }
            if (!isLoadRefresh) {
                _this.refresh();
            }
        });
    };
    PointOfSaleComponent.prototype.getUser = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var identity = JSON.parse(sessionStorage.getItem('user'));
            var user;
            if (identity) {
                _this._userService.getUser(identity._id).subscribe(function (result) {
                    if (result && result.user) {
                        resolve(result.user);
                    }
                    else {
                        _this.showMessage("Debe volver a iniciar sesión", "danger", false);
                    }
                }, function (error) {
                    _this.showMessage(error._body, "danger", false);
                });
            }
        });
    };
    PointOfSaleComponent.prototype.getBranches = function (match) {
        var _this = this;
        if (match === void 0) { match = {}; }
        return new Promise(function (resolve, reject) {
            _this.subscription.add(_this._branchService.getBranches({}, // PROJECT
            match, // MATCH
            { number: 1 }, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
            ).subscribe(function (result) {
                if (result && result.branches) {
                    resolve(result.branches);
                }
                else {
                    resolve(null);
                }
            }, function (error) {
                _this.showMessage(error._body, 'danger', false);
                resolve(null);
            }));
        });
    };
    PointOfSaleComponent.prototype.getUsers = function (match) {
        var _this = this;
        if (match === void 0) { match = {}; }
        return new Promise(function (resolve, reject) {
            _this.subscription.add(_this._userService.getUsersV2({}, // PROJECT
            match, // MATCH
            { name: 1 }, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
            ).subscribe(function (result) {
                if (result && result.users) {
                    resolve(result.users);
                }
                else {
                    resolve(null);
                }
            }, function (error) {
                _this.showMessage(error._body, 'danger', false);
                resolve(null);
            }));
        });
    };
    PointOfSaleComponent.prototype.getDeposits = function (match) {
        var _this = this;
        if (match === void 0) { match = {}; }
        return new Promise(function (resolve, reject) {
            _this.subscription.add(_this._depositService.getDepositsV2({}, // PROJECT
            match, // MATCH
            { name: 1 }, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
            ).subscribe(function (result) {
                if (result.deposits) {
                    resolve(result.deposits);
                }
                else {
                    resolve(null);
                }
            }, function (error) {
                _this.showMessage(error._body, 'danger', false);
                resolve(null);
            }));
        });
    };
    PointOfSaleComponent.prototype.getOrigins = function (match) {
        var _this = this;
        if (match === void 0) { match = {}; }
        return new Promise(function (resolve, reject) {
            _this.subscription.add(_this._originService.getOrigins({}, // PROJECT
            match, // MATCH
            { number: 1 }, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
            ).subscribe(function (result) {
                if (result.origins) {
                    resolve(result.origins);
                }
                else {
                    resolve(null);
                }
            }, function (error) {
                _this.showMessage(error._body, 'danger', false);
                resolve(null);
            }));
        });
    };
    PointOfSaleComponent.prototype.getCurrencies = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.subscription.add(_this._currencyService.getCurrencies('sort="name":1').subscribe(function (result) {
                if (!result.currencies) {
                    resolve(null);
                }
                else {
                    resolve(result.currencies);
                }
            }, function (error) {
                _this.showMessage(error._body, "danger", false);
                resolve(null);
            }));
        });
    };
    PointOfSaleComponent.prototype.getPrinters = function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.subscription.add(this._printerService.getPrinters().subscribe(function (result) {
                    if (!result.printers) {
                        if (result.message && result.message !== '')
                            _this.showMessage(result.message, 'info', true);
                        resolve(null);
                    }
                    else {
                        resolve(result.printers);
                    }
                }, function (error) {
                    _this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }));
                return [2 /*return*/];
            });
        }); });
    };
    PointOfSaleComponent.prototype.getTransactionTypes = function (match) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.loading = true;
            var project = {
                _id: 1,
                defectShipmentMethod: 1,
                fixedLetter: 1,
                currentAccount: 1,
                cashBoxImpact: 1,
                fixedOrigin: 1,
                transactionMovement: 1,
                stockMovement: 1,
                maxOrderNumber: 1,
                requestEmployee: 1,
                requestArticles: 1,
                requestCurrency: 1,
                requestCompany: 1,
                automaticNumbering: 1,
                company: 1,
                automaticCreation: 1,
                requestPaymentMethods: 1,
                readLayout: 1,
                defectPrinter: 1,
                name: 1,
                labelPrint: 1,
                electronics: 1,
                "defectEmailTemplate._id": 1,
                "defectEmailTemplate.design": 1,
                printable: 1,
                requestEmailTemplate: 1,
                allowAPP: 1,
                order: 1,
                cashOpening: 1,
                cashClosing: 1,
                level: 1,
                branch: 1,
                defectOrders: 1,
                operationType: 1,
                finishCharge: 1
            };
            match["operationType"] = { "$ne": "D" };
            if (_this.user && _this.user.permission && _this.user.permission.transactionTypes && _this.user.permission.transactionTypes.length > 0) {
                var transactionTypes = [];
                _this.user.permission.transactionTypes.forEach(function (element) {
                    transactionTypes.push({ "$oid": element });
                });
                match['_id'] = { "$in": transactionTypes };
            }
            _this.subscription.add(_this._transactionTypeService.getAll({
                project: project,
                match: match,
                sort: { order: 1 }
            }).subscribe(function (result) {
                _this.loading = false;
                if (result.status === 200) {
                    resolve(result.result);
                }
                else {
                    resolve(null);
                    _this.showToast(result);
                }
            }, function (error) {
                _this.showToast(error);
                resolve(null);
            }));
        });
    };
    PointOfSaleComponent.prototype.getRooms = function () {
        var _this = this;
        this.loading = true;
        this.subscription.add(this._roomService.getRooms().subscribe(function (result) {
            if (!result.rooms) {
                if (result.message && result.message !== '')
                    _this.showMessage(result.message, 'info', true);
                _this.loading = false;
            }
            else {
                _this.hideMessage();
                _this.loading = false;
                _this.rooms = result.rooms;
                if (_this.roomSelected._id === undefined) {
                    _this.roomSelected = _this.rooms[0];
                }
                else {
                    for (var _i = 0, _a = _this.rooms; _i < _a.length; _i++) {
                        var room = _a[_i];
                        if (_this.roomSelected._id === room._id) {
                            _this.roomSelected = room;
                        }
                    }
                }
            }
        }, function (error) {
            _this.showMessage(error._body, 'danger', false);
            _this.loading = false;
        }));
    };
    PointOfSaleComponent.prototype.syncMeli = function () {
        var _this = this;
        this.loading = true;
        this._transactionService.syncMeli().subscribe(function (result) {
            _this.showToast(result);
            _this.loading = false;
            _this.refresh();
        }, function (error) {
            _this.showToast(error);
            _this.loading = false;
            _this.refresh();
        });
    };
    PointOfSaleComponent.prototype.syncWoocommerce = function () {
        var _this = this;
        this.loading = true;
        this._transactionService.syncWoocommerce().subscribe(function (result) {
            _this.showToast(null, 'success', 'Finalizó la sincronización de woocommerce.');
            _this.loading = false;
            _this.refresh();
        }, function (error) {
            _this.showToast(null, 'success', 'Finalizó la sincronización de woocommerce.');
            _this.loading = false;
            _this.refresh();
        });
    };
    PointOfSaleComponent.prototype.refresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pathLocation, match, match, query_1, query, query_2, match, query_3, match;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pathLocation = this._router.url.split('/');
                        if (this.posType === 'mostrador') {
                            if (pathLocation[3] === 'venta') {
                                this.transactionMovement = transaction_type_1.TransactionMovement.Sale;
                            }
                            else if (pathLocation[3] === 'compra') {
                                this.transactionMovement = transaction_type_1.TransactionMovement.Purchase;
                            }
                            else if (pathLocation[3] === 'stock') {
                                this.transactionMovement = transaction_type_1.TransactionMovement.Stock;
                            }
                            else if (pathLocation[3] === 'fondo') {
                                this.transactionMovement = transaction_type_1.TransactionMovement.Money;
                            }
                            else {
                                this.transactionMovement = transaction_type_1.TransactionMovement.Sale;
                            }
                        }
                        else if (this.posType === "cuentas-corrientes") {
                            if (this.companyType === company_1.CompanyType.Client) {
                                this.transactionMovement = transaction_type_1.TransactionMovement.Sale;
                            }
                            else {
                                this.transactionMovement = transaction_type_1.TransactionMovement.Purchase;
                            }
                        }
                        else {
                            this.transactionMovement = transaction_type_1.TransactionMovement.Sale;
                        }
                        if (!(!this.transaction && this.transactionTypeId && this.transactionTypeId !== '')) return [3 /*break*/, 1];
                        match = {
                            "_id": { "$oid": this.transactionTypeId }
                        };
                        this.getTransactionTypes(match).then(function (transactionTypes) {
                            if (transactionTypes) {
                                _this.addTransaction(transactionTypes[0]);
                            }
                        });
                        return [3 /*break*/, 14];
                    case 1:
                        if (!(this.posType === 'resto')) return [3 /*break*/, 2];
                        this.roomSelected._id = pathLocation[4];
                        this.getRooms();
                        return [3 /*break*/, 14];
                    case 2:
                        if (!(this.posType === "delivery")) return [3 /*break*/, 5];
                        match = {
                            "$or": [
                                { "cashOpening": true }, { "cashClosing": true }
                            ]
                        };
                        return [4 /*yield*/, this.getTransactionTypes(match).then(function (transactionTypes) {
                                if (transactionTypes) {
                                    _this.transactionTypes = transactionTypes;
                                }
                            })];
                    case 3:
                        _a.sent();
                        query_1 = {};
                        if (this.originsToFilter && this.originsToFilter.length > 0) {
                            query_1['origin'] = { $in: this.originsToFilter };
                        }
                        query_1['state'] = { $in: this.transactionStates };
                        query_1['operationType'] = { $ne: 'D' };
                        return [4 /*yield*/, this.getTransactionsV2(query_1).then(function (transactions) {
                                _this.hideMessage();
                                _this.transactions = transactions;
                            })];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 5:
                        if (!(this.posType === 'pedidos-web')) return [3 /*break*/, 7];
                        if (this.transactionStates.length > 0) {
                            query = {
                                state: { $in: this.transactionStates },
                                madein: { $in: ['pedidos-web', 'mercadolibre'] },
                                operationType: { $ne: 'D' },
                                "type.transactionMovement": this.transactionMovement
                            };
                        }
                        else {
                            query = {
                                $or: [
                                    {
                                        $and: [
                                            {
                                                $or: [
                                                    { state: transaction_1.TransactionState.Closed },
                                                    { state: transaction_1.TransactionState.Outstanding }
                                                ]
                                            },
                                            { balance: { $gt: 0 } }
                                        ]
                                    },
                                    { state: transaction_1.TransactionState.PaymentConfirmed },
                                    { state: transaction_1.TransactionState.Delivered },
                                    { state: transaction_1.TransactionState.Sent }
                                ],
                                madein: { $in: ['pedidos-web', 'mercadolibre'] },
                                operationType: { $ne: 'D' },
                                "type.transactionMovement": this.transactionMovement
                            };
                        }
                        return [4 /*yield*/, this.getTransactionsV2(query).then(function (transactions) {
                                _this.hideMessage();
                                _this.transactions = transactions;
                            })];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 7:
                        if (!(this.posType === 'carritos-abandonados')) return [3 /*break*/, 9];
                        query_2 = {
                            state: transaction_1.TransactionState.Open,
                            madein: 'pedidos-web',
                            totalPrice: { $gt: 0 },
                            operationType: { $ne: 'D' },
                            "type.transactionMovement": this.transactionMovement
                        };
                        return [4 /*yield*/, this.getTransactionsV2(query_2).then(function (transactions) {
                                _this.hideMessage();
                                _this.transactions = transactions;
                            })];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 9:
                        if (!(this.posType === 'mostrador')) return [3 /*break*/, 12];
                        match = void 0;
                        if (this.user.branch && this.user.branch._id) {
                            match = {
                                level: { "$lt": this.user.level },
                                "$or": [
                                    { branch: { "$exists": false } },
                                    { branch: null },
                                    { branch: { "$oid": this.user.branch._id } }
                                ],
                                transactionMovement: this.transactionMovement,
                                "allowAPP": false
                            };
                        }
                        else {
                            match = {
                                level: { "$lt": this.user.level },
                                transactionMovement: this.transactionMovement,
                                "allowAPP": false
                            };
                        }
                        return [4 /*yield*/, this.getTransactionTypes(match).then(function (transactionTypes) {
                                if (transactionTypes) {
                                    _this.transactionTypes = transactionTypes;
                                }
                            })];
                    case 10:
                        _a.sent();
                        query_3 = {
                            state: { $in: [transaction_1.TransactionState.Open, transaction_1.TransactionState.Pending] },
                            madein: this.posType,
                            "type.transactionMovement": this.transactionMovement
                        };
                        if (this.identity.origin) {
                            query_3['branchOrigin'] = { $oid: this.identity.origin.branch._id };
                        }
                        query_3['type.level'] = { $lt: this.user.level };
                        query_3['operationType'] = { $ne: 'D' };
                        return [4 /*yield*/, this.getTransactionsV2(query_3).then(function (transactions) {
                                _this.hideMessage();
                                _this.transactions = transactions;
                            })];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 12:
                        if (!(this.posType === "cuentas-corrientes")) return [3 /*break*/, 14];
                        match = void 0;
                        if (this.user.branch && this.user.branch._id) {
                            match = {
                                level: { "$lt": this.user.level },
                                "$or": [
                                    { branch: { "$exists": false } },
                                    { branch: null },
                                    { branch: { "$oid": this.user.branch._id } }
                                ],
                                transactionMovement: this.transactionMovement,
                                "allowAPP": false
                            };
                        }
                        else {
                            match = {
                                level: { "$lt": this.user.level },
                                transactionMovement: this.transactionMovement,
                                "allowAPP": false
                            };
                        }
                        return [4 /*yield*/, this.getTransactionTypes(match).then(function (transactionTypes) {
                                if (transactionTypes) {
                                    _this.transactionTypes = transactionTypes;
                                }
                            })];
                    case 13:
                        _a.sent();
                        this.eventRefreshCurrentAccount.emit();
                        _a.label = 14;
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.initTransactionByType = function (op, openPending) {
        if (openPending === void 0) { openPending = false; }
        return __awaiter(this, void 0, void 0, function () {
            var match;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        match = JSON.parse("{\"" + op + "\": true}");
                        return [4 /*yield*/, this.getTransactionTypes(match).then(function (transactionTypes) { return __awaiter(_this, void 0, void 0, function () {
                                var query;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(transactionTypes && transactionTypes.length > 0)) return [3 /*break*/, 4];
                                            if (!openPending) return [3 /*break*/, 2];
                                            query = "where=\"$and\":[{\"state\":{\"$ne\": \"" + transaction_1.TransactionState.Closed + "\"}},{\"state\":{\"$ne\":\"" + transaction_1.TransactionState.Canceled + "\"}},";
                                            if (this.identity.origin) {
                                                query += "{\"branch\":\"" + this.identity.origin.branch._id + "\"},";
                                            }
                                            query += "{\"madein\":\"" + this.posType + "\"},{\"type\":\"" + transactionTypes[0]._id + "\"},{\"$or\":[{\"table\":{\"$exists\":false}},{\"table\":null}]}]&limit=1";
                                            return [4 /*yield*/, this.getTransactions(query).then(function (transactions) {
                                                    if (transactions && transactions.length > 0) {
                                                        _this.transaction = transactions[0];
                                                        _this.tableSelected = _this.transaction.table;
                                                        _this.nextStepTransaction();
                                                    }
                                                    else {
                                                        _this.addTransaction(transactionTypes[0]);
                                                    }
                                                })];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            this.addTransaction(transactionTypes[0]);
                                            _a.label = 3;
                                        case 3: return [3 /*break*/, 5];
                                        case 4:
                                            this.showMessage('Es necesario configurar el tipo de transacción.', 'info', true);
                                            _a.label = 5;
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.addTransaction = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.transaction = new transaction_1.Transaction();
                        this.transaction.type = type;
                        if (this.transaction.type.defectShipmentMethod) {
                            this.transaction.shipmentMethod = this.transaction.type.defectShipmentMethod;
                        }
                        this.transaction.table = this.tableSelected;
                        if (this.transaction.type.fixedLetter && this.transaction.type.fixedLetter !== '') {
                            this.transaction.letter = this.transaction.type.fixedLetter.toUpperCase();
                        }
                        if (this.posType === 'cuentas-corrientes' && this.transaction.type.currentAccount === transaction_type_1.CurrentAccount.Charge) {
                            if (this.transactionMovement === transaction_type_1.TransactionMovement.Sale) {
                                this.totalPrice *= -1;
                            }
                            if (this.totalPrice < 0) {
                                this.totalPrice = 0;
                            }
                            this.transaction.totalPrice = this.totalPrice;
                        }
                        if (!(!type.cashOpening && !type.cashClosing)) return [3 /*break*/, 4];
                        if (!(app_config_1.Config.modules.money && this.transaction.type.cashBoxImpact)) return [3 /*break*/, 2];
                        query = 'where="state":"' + cash_box_1.CashBoxState.Open + '"';
                        if (this.config.cashBox.perUser) {
                            if (this.identity.employee) {
                                query += ',"employee":"' + this.identity.employee._id + '"';
                            }
                        }
                        else if (this.identity.cashBoxType) {
                            query += ',"type":"' + this.identity.cashBoxType._id + '"';
                        }
                        else {
                            query += ',"type":null';
                        }
                        query += '&sort="number":-1&limit=1';
                        return [4 /*yield*/, this.getCashBoxes(query).then(function (cashBoxes) { return __awaiter(_this, void 0, void 0, function () {
                                var match;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!cashBoxes) return [3 /*break*/, 1];
                                            this.transaction.cashBox = cashBoxes[0];
                                            this.nextStepTransaction();
                                            return [3 /*break*/, 3];
                                        case 1:
                                            match = {
                                                "cashOpening": true
                                            };
                                            return [4 /*yield*/, this.getTransactionTypes(match).then(function (transactionTypes) {
                                                    if (transactionTypes && transactionTypes.length > 0) {
                                                        _this.transaction.type = transactionTypes[0];
                                                        _this.openModal('cash-box');
                                                    }
                                                    else {
                                                        _this.showMessage("Debe configurar un tipo de transacción para realizar la apertura de caja.", "info", true);
                                                    }
                                                })];
                                        case 2:
                                            _a.sent();
                                            _a.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.nextStepTransaction();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        this.openModal('cash-box');
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.getCashBoxes = function (query) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._cashBoxService.getCashBoxes(query).subscribe(function (result) {
                if (!result.cashBoxes) {
                    resolve(null);
                }
                else {
                    resolve(result.cashBoxes);
                }
            }, function (error) {
                _this.showMessage(error._body, 'danger', false);
                resolve(null);
            });
        });
    };
    PointOfSaleComponent.prototype.assignBranch = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var originAssigned, depositAssigned, originAssigned, depositAssigned, originAssigned, originAssigned;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(!this.transaction.branchDestination || !this.transaction.branchOrigin)) return [3 /*break*/, 13];
                                    if (!this.identity.origin) return [3 /*break*/, 10];
                                    // PREDOMINIA PUNTO DE VENTA DEL TIPO DE TRANSACCION
                                    if (this.transaction.type.fixedOrigin && this.transaction.type.fixedOrigin !== 0) {
                                        this.transaction.origin = this.transaction.type.fixedOrigin;
                                    }
                                    else {
                                        if (this.transaction.type.transactionMovement !== transaction_type_1.TransactionMovement.Purchase) {
                                            this.transaction.origin = this.identity.origin.number;
                                        }
                                    }
                                    // ASIGNAMOS A LA TRANSACCIÓN LA SUCURSAL DEL PV DEL USUARIO
                                    this.transaction.branchOrigin = this.identity.origin.branch;
                                    this.transaction.branchDestination = this.identity.origin.branch;
                                    if (!(!this.transaction.type.fixedOrigin || this.transaction.type.fixedOrigin === 0 && this.transaction.origin === 0)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, this.assignOrigin()];
                                case 1:
                                    originAssigned = _a.sent();
                                    resolve(originAssigned);
                                    return [3 /*break*/, 3];
                                case 2:
                                    resolve(true);
                                    _a.label = 3;
                                case 3: return [4 /*yield*/, this.assignDeposit()];
                                case 4:
                                    depositAssigned = _a.sent();
                                    if (!depositAssigned) return [3 /*break*/, 8];
                                    if (!(!this.transaction.type.fixedOrigin || this.transaction.type.fixedOrigin === 0 && this.transaction.origin === 0)) return [3 /*break*/, 6];
                                    return [4 /*yield*/, this.assignOrigin()];
                                case 5:
                                    originAssigned = _a.sent();
                                    resolve(originAssigned);
                                    return [3 /*break*/, 7];
                                case 6:
                                    resolve(depositAssigned);
                                    _a.label = 7;
                                case 7: return [3 /*break*/, 9];
                                case 8:
                                    resolve(depositAssigned);
                                    _a.label = 9;
                                case 9: return [3 /*break*/, 12];
                                case 10:
                                    // SI NO TIENE ASIGNADO PV
                                    if (this.transaction.type.fixedOrigin && this.transaction.type.fixedOrigin !== 0) {
                                        this.transaction.origin = this.transaction.type.fixedOrigin;
                                    }
                                    if (!(!this.transaction.branchDestination || !this.transaction.branchOrigin)) return [3 /*break*/, 12];
                                    return [4 /*yield*/, this.getBranches({ operationType: { $ne: 'D' } }).then(function (branches) { return __awaiter(_this, void 0, void 0, function () {
                                            var defaultBranch, originAssigned, depositAssigned, originAssigned;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!(branches && branches.length > 0)) return [3 /*break*/, 11];
                                                        if (!(branches.length > 1)) return [3 /*break*/, 1];
                                                        // SOLICITAR SUCURSAL
                                                        this.openModal('select-branch');
                                                        return [3 /*break*/, 10];
                                                    case 1:
                                                        defaultBranch = branches[0];
                                                        this.transaction.branchOrigin = defaultBranch;
                                                        this.transaction.branchDestination = defaultBranch;
                                                        if (!(!this.transaction.type.fixedOrigin || this.transaction.type.fixedOrigin === 0 && this.transaction.origin === 0)) return [3 /*break*/, 3];
                                                        return [4 /*yield*/, this.assignOrigin()];
                                                    case 2:
                                                        originAssigned = _a.sent();
                                                        resolve(originAssigned);
                                                        return [3 /*break*/, 4];
                                                    case 3:
                                                        resolve(true);
                                                        _a.label = 4;
                                                    case 4: return [4 /*yield*/, this.assignDeposit()];
                                                    case 5:
                                                        depositAssigned = _a.sent();
                                                        if (!depositAssigned) return [3 /*break*/, 9];
                                                        if (!(!this.transaction.type.fixedOrigin || this.transaction.type.fixedOrigin === 0 && this.transaction.origin === 0)) return [3 /*break*/, 7];
                                                        return [4 /*yield*/, this.assignOrigin()];
                                                    case 6:
                                                        originAssigned = _a.sent();
                                                        resolve(originAssigned);
                                                        return [3 /*break*/, 8];
                                                    case 7:
                                                        resolve(depositAssigned);
                                                        _a.label = 8;
                                                    case 8: return [3 /*break*/, 10];
                                                    case 9:
                                                        resolve(depositAssigned);
                                                        _a.label = 10;
                                                    case 10: return [3 /*break*/, 12];
                                                    case 11:
                                                        this.showMessage("Debe crear un sucursal para poder poder crear una transacción", "info", true);
                                                        resolve(false);
                                                        _a.label = 12;
                                                    case 12: return [2 /*return*/];
                                                }
                                            });
                                        }); })];
                                case 11:
                                    _a.sent();
                                    _a.label = 12;
                                case 12: return [3 /*break*/, 23];
                                case 13:
                                    if (!(!this.transaction.depositDestination || !this.transaction.depositOrigin)) return [3 /*break*/, 20];
                                    return [4 /*yield*/, this.assignDeposit()];
                                case 14:
                                    depositAssigned = _a.sent();
                                    if (!depositAssigned) return [3 /*break*/, 18];
                                    if (!(!this.transaction.type.fixedOrigin || this.transaction.type.fixedOrigin === 0 && this.transaction.origin === 0)) return [3 /*break*/, 16];
                                    return [4 /*yield*/, this.assignOrigin()];
                                case 15:
                                    originAssigned = _a.sent();
                                    resolve(originAssigned);
                                    return [3 /*break*/, 17];
                                case 16:
                                    resolve(depositAssigned);
                                    _a.label = 17;
                                case 17: return [3 /*break*/, 19];
                                case 18:
                                    resolve(depositAssigned);
                                    _a.label = 19;
                                case 19: return [3 /*break*/, 23];
                                case 20:
                                    if (!(!this.transaction.type.fixedOrigin || this.transaction.type.fixedOrigin === 0 && this.transaction.origin === 0)) return [3 /*break*/, 22];
                                    return [4 /*yield*/, this.assignOrigin()];
                                case 21:
                                    originAssigned = _a.sent();
                                    resolve(originAssigned);
                                    return [3 /*break*/, 23];
                                case 22:
                                    resolve(true);
                                    _a.label = 23;
                                case 23: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    PointOfSaleComponent.prototype.assignDeposit = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(!this.transaction.depositDestination || !this.transaction.depositOrigin)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, this.getDeposits({ branch: { $oid: this.transaction.branchOrigin._id }, operationType: { $ne: 'D' } }).then(function (deposits) {
                                            if (deposits && deposits.length > 0) {
                                                if (deposits.length === 1) {
                                                    _this.transaction.depositOrigin = deposits[0];
                                                    _this.transaction.depositDestination = deposits[0];
                                                    resolve(true);
                                                }
                                                else {
                                                    var depositDefault_1;
                                                    deposits.forEach(function (element) {
                                                        if (element && element["default"]) {
                                                            depositDefault_1 = element;
                                                        }
                                                    });
                                                    if (depositDefault_1) {
                                                        _this.transaction.depositOrigin = depositDefault_1;
                                                        _this.transaction.depositDestination = depositDefault_1;
                                                        resolve(true);
                                                    }
                                                    else {
                                                        _this.showMessage("Debe asignar un depósito principal para la sucursal " + _this.transaction.branchDestination.name, "info", true);
                                                        resolve(false);
                                                    }
                                                }
                                            }
                                            else {
                                                _this.showMessage("Debe crear un depósito para la sucursal " + _this.transaction.branchDestination.name, "info", true);
                                                resolve(false);
                                            }
                                        })];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    resolve(true);
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    PointOfSaleComponent.prototype.assignOrigin = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(this.transaction.origin === 0)) return [3 /*break*/, 2];
                                    // ASIGNAMOS EL ÚNICO DEPOSITO DE LA LA SUCURSAL
                                    return [4 /*yield*/, this.getOrigins({ branch: { $oid: this.transaction.branchDestination._id }, operationType: { $ne: 'D' } }).then(function (origins) {
                                            if (origins && origins.length > 0) {
                                                if (origins.length > 1) {
                                                    _this.openModal('select-origin');
                                                }
                                                else {
                                                    _this.transaction.origin = origins[0].number;
                                                    resolve(true);
                                                }
                                            }
                                            else {
                                                _this.showMessage("Debe crear un punto de venta defecto para la sucursal " + _this.transaction.branchDestination.name, "info", true);
                                                resolve(false);
                                            }
                                        })];
                                case 1:
                                    // ASIGNAMOS EL ÚNICO DEPOSITO DE LA LA SUCURSAL
                                    _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    resolve(true);
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    PointOfSaleComponent.prototype.nextStepTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, _a, _b, branchAssigned, route, queryParams, error_1;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 11, , 12]);
                        if (!(this.transaction && (!this.transaction._id || this.transaction._id === ""))) return [3 /*break*/, 6];
                        result = void 0;
                        if (!(this.transaction.type.transactionMovement === transaction_type_1.TransactionMovement.Stock &&
                            this.transaction.type.stockMovement === transaction_type_1.StockMovement.Transfer &&
                            (!this.transaction.depositDestination || !this.transaction.depositOrigin))) return [3 /*break*/, 1];
                        this.openModal('transfer');
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.assignBranch()];
                    case 2:
                        result = _c.sent();
                        _c.label = 3;
                    case 3:
                        if (!result) return [3 /*break*/, 6];
                        this.transaction.currency = app_config_1.Config.currency;
                        this.transaction.quotation = 1;
                        _a = this;
                        return [4 /*yield*/, this.saveTransaction()];
                    case 4:
                        _a.transaction = _c.sent();
                        if (!(this.posType === 'resto' && this.tableSelected)) return [3 /*break*/, 6];
                        this.tableSelected.lastTransaction = this.transaction;
                        this.tableSelected.state = table_1.TableState.Busy;
                        _b = this;
                        return [4 /*yield*/, this.updateTable()];
                    case 5:
                        _b.tableSelected = _c.sent();
                        _c.label = 6;
                    case 6:
                        if (!(this.transaction && this.transaction._id && this.transaction._id !== "")) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.updateTransaction(this.transaction).then(function (transaction) {
                                if (transaction) {
                                    _this.transaction = transaction;
                                }
                            })];
                    case 7:
                        _c.sent();
                        if (!(!this.transaction.branchDestination ||
                            !this.transaction.branchOrigin ||
                            !this.transaction.depositDestination ||
                            !this.transaction.depositOrigin)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.assignBranch()];
                    case 8:
                        branchAssigned = _c.sent();
                        if (branchAssigned) {
                            this.nextStepTransaction();
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        if (!this.transaction.employeeClosing &&
                            this.transaction.type.requestEmployee &&
                            this.transaction.type.requestArticles &&
                            (this.posType === 'mostrador' ||
                                (this.posType === 'resto' && this.transaction.table))) {
                            this.openModal('select-employee');
                        }
                        else if (!this.transaction.company &&
                            (this.transaction.type.requestCompany || (this.transaction.type.requestArticles && this.posType === 'cuentas-corrientes')) && !this.transaction.type.company) {
                            if (!this.company) {
                                if (this.transaction.type.company) {
                                    this.transaction.company = this.transaction.type.company;
                                    this.nextStepTransaction();
                                }
                                else {
                                    this.openModal('company');
                                }
                            }
                            else {
                                this.transaction.company = this.company;
                                this.nextStepTransaction();
                            }
                        }
                        else if (this.transaction.type.automaticNumbering && this.transaction.type.requestArticles) {
                            route = '/pos/' + this.posType + '/editar-transaccion';
                            if (this.posType === "cuentas-corrientes") {
                                route = '/pos/mostrador/editar-transaccion';
                            }
                            queryParams = {
                                transactionId: this.transaction._id,
                                returnURL: this.removeParam(this._router.url, 'automaticCreation')
                            };
                            if (this.transaction.type.automaticCreation && this.posType !== 'resto') {
                                queryParams['automaticCreation'] = this.transaction.type._id;
                            }
                            this._router.navigate([route], {
                                queryParams: queryParams
                            });
                        }
                        else {
                            this.openModal('transaction');
                        }
                        _c.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_1 = _c.sent();
                        this.showToast(error_1);
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.removeParam = function (sourceURL, key) {
        var rtn = sourceURL.split("?")[0], param, params_arr = [], queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
        if (queryString !== "") {
            params_arr = queryString.split("&");
            for (var i = params_arr.length - 1; i >= 0; i -= 1) {
                param = params_arr[i].split("=")[0];
                if (param === key) {
                    params_arr.splice(i, 1);
                }
            }
            rtn = rtn + "?" + params_arr.join("&");
        }
        return rtn;
    };
    PointOfSaleComponent.prototype.cancelTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.getTransaction(transaction._id)];
                    case 1:
                        _a.transaction = _b.sent();
                        if (this.transaction) {
                            this.openModal('cancel-transaction');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.viewTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.getTransaction(transaction._id)];
                    case 1:
                        _a.transaction = _b.sent();
                        if (this.transaction) {
                            this.openModal('view-transaction');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.chargeTransaction = function (transaction, state) {
        if (state === void 0) { state = transaction_1.TransactionState.Closed; }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.getTransaction(transaction._id)];
                    case 1:
                        _a.transaction = _b.sent();
                        if (this.transaction) {
                            this.openModal('charge', state);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.changeCompany = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.getTransaction(transaction._id)];
                    case 1:
                        _a.transaction = _b.sent();
                        if (this.transaction) {
                            this.openModal('edit');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.printTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.getTransaction(transaction._id)];
                    case 1:
                        _a.transaction = _b.sent();
                        if (this.transaction) {
                            this.openModal('print');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.openTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.getTransaction(transaction._id)];
                    case 1:
                        _a.transaction = _b.sent();
                        if (this.transaction) {
                            this.nextStepTransaction();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.getTransaction = function (transactionId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._transactionService.getTransaction(transactionId).subscribe(function (result) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!result.transaction) {
                        this.showMessage(result.message, 'danger', false);
                        resolve(null);
                    }
                    else {
                        resolve(result.transaction);
                    }
                    return [2 /*return*/];
                });
            }); }, function (error) {
                _this.showMessage(error._body, 'danger', false);
                resolve(null);
            });
        });
    };
    PointOfSaleComponent.prototype.openModal = function (op, state) {
        if (state === void 0) { state = transaction_1.TransactionState.Closed; }
        return __awaiter(this, void 0, void 0, function () {
            var modalRef, _a, _i, _b, printer, attachments, _c, _d, printer, labelPrint;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = op;
                        switch (_a) {
                            case 'company': return [3 /*break*/, 1];
                            case 'transaction': return [3 /*break*/, 2];
                            case 'charge': return [3 /*break*/, 3];
                            case 'print': return [3 /*break*/, 5];
                            case 'printers': return [3 /*break*/, 9];
                            case 'view-transaction': return [3 /*break*/, 11];
                            case 'cancel-transaction': return [3 /*break*/, 12];
                            case 'open-turn': return [3 /*break*/, 13];
                            case 'close-turn': return [3 /*break*/, 14];
                            case 'cash-box': return [3 /*break*/, 15];
                            case 'select-branch': return [3 /*break*/, 16];
                            case 'select-origin': return [3 /*break*/, 17];
                            case 'select-employee': return [3 /*break*/, 18];
                            case 'transfer': return [3 /*break*/, 19];
                            case 'edit': return [3 /*break*/, 20];
                            case 'send-email': return [3 /*break*/, 21];
                        }
                        return [3 /*break*/, 22];
                    case 1:
                        modalRef = this._modalService.open(select_company_component_1.SelectCompanyComponent, { size: 'lg', backdrop: 'static' });
                        modalRef.componentInstance.type = this.transaction.type.requestCompany;
                        modalRef.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (result.company) {
                                    this.transaction.company = result.company;
                                    this.nextStepTransaction();
                                }
                                else {
                                    this.refresh();
                                }
                                return [2 /*return*/];
                            });
                        }); }, function (reason) {
                            _this.refresh();
                        });
                        return [3 /*break*/, 23];
                    case 2:
                        modalRef = this._modalService.open(add_transaction_component_1.AddTransactionComponent, { size: 'lg', backdrop: 'static' });
                        modalRef.componentInstance.transactionId = this.transaction._id;
                        modalRef.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var route;
                            return __generator(this, function (_a) {
                                if (result) {
                                    this.transaction = result.transaction;
                                    this.movementsOfCashes = result.movementsOfCashes;
                                    if (this.transaction) {
                                        if (this.transaction.type && this.transaction.type.requestArticles) {
                                            route = '/pos/mostrador/editar-transaccion';
                                            this._router.navigate([route], { queryParams: { transactionId: this.transaction._id, returnURL: this._router.url } });
                                        }
                                        else if (this.transaction.type.requestPaymentMethods) {
                                            this.openModal('charge');
                                        }
                                        else {
                                            this.finishTransaction();
                                        }
                                    }
                                    else if (result === "change-company" && !this.transaction.type.company) {
                                        this.openModal('company');
                                    }
                                    else {
                                        this.refresh();
                                    }
                                }
                                return [2 /*return*/];
                            });
                        }); }, function (reason) {
                            _this.refresh();
                        });
                        return [3 /*break*/, 23];
                    case 3: return [4 /*yield*/, this.isValidCharge()];
                    case 4:
                        if (_e.sent()) {
                            modalRef = this._modalService.open(add_movement_of_cash_component_1.AddMovementOfCashComponent, { size: 'lg', backdrop: 'static' });
                            modalRef.componentInstance.transaction = this.transaction;
                            modalRef.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                                var _i, _a, mov;
                                var _this = this;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (!result.movementsOfCashes) return [3 /*break*/, 2];
                                            this.transaction.commissionAmount = 0;
                                            for (_i = 0, _a = result.movementsOfCashes; _i < _a.length; _i++) {
                                                mov = _a[_i];
                                                this.transaction.commissionAmount += mov.commissionAmount;
                                            }
                                            return [4 /*yield*/, this.updateTransaction(this.transaction).then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        if (transaction) {
                                                            this.transaction = transaction;
                                                            this.changeStateOfTransaction(this.transaction, state);
                                                        }
                                                        else {
                                                            this.refresh();
                                                        }
                                                        return [2 /*return*/];
                                                    });
                                                }); })];
                                        case 1:
                                            _b.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            this.refresh();
                                            _b.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }, function (reason) {
                                _this.refresh();
                            });
                        }
                        return [3 /*break*/, 23];
                    case 5:
                        if (!this.transaction.type.readLayout) return [3 /*break*/, 6];
                        modalRef = this._modalService.open(print_transaction_type_component_1.PrintTransactionTypeComponent);
                        modalRef.componentInstance.transactionId = this.transaction._id;
                        modalRef.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/];
                            });
                        }); }, function (reason) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(this.transaction.state === transaction_1.TransactionState.Packing)) return [3 /*break*/, 2];
                                        // PONEMOS LA TRANSACCION EN ESTADO EN ENTREGADO
                                        return [4 /*yield*/, this.getTransaction(this.transaction._id).then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                                var _this = this;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            if (!transaction) return [3 /*break*/, 2];
                                                            transaction.state = transaction_1.TransactionState.Delivered;
                                                            return [4 /*yield*/, this.updateTransaction(transaction).then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                                                    return __generator(this, function (_a) {
                                                                        if (transaction) {
                                                                            this.refresh();
                                                                        }
                                                                        return [2 /*return*/];
                                                                    });
                                                                }); })];
                                                        case 1:
                                                            _a.sent();
                                                            _a.label = 2;
                                                        case 2: return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 1:
                                        // PONEMOS LA TRANSACCION EN ESTADO EN ENTREGADO
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, this.getPrinters().then(function (printers) {
                            _this.printers = printers;
                        })];
                    case 7:
                        _e.sent();
                        modalRef = this._modalService.open(print_component_1.PrintComponent);
                        modalRef.componentInstance.company = this.transaction.company;
                        modalRef.componentInstance.transactionId = this.transaction._id;
                        modalRef.componentInstance.typePrint = 'invoice';
                        if (this.transaction.type.defectPrinter) {
                            modalRef.componentInstance.printer = this.transaction.type.defectPrinter;
                        }
                        else {
                            if (this.printers && this.printers.length > 0) {
                                for (_i = 0, _b = this.printers; _i < _b.length; _i++) {
                                    printer = _b[_i];
                                    if (printer.printIn === printer_1.PrinterPrintIn.Counter) {
                                        modalRef.componentInstance.printer = printer;
                                    }
                                }
                            }
                        }
                        modalRef.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/];
                            });
                        }); }, function (reason) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(this.transaction.state === transaction_1.TransactionState.Packing)) return [3 /*break*/, 2];
                                        // PONEMOS LA TRANSACCION EN ESTADO EN ENTREGADO
                                        return [4 /*yield*/, this.getTransaction(this.transaction._id).then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                                var _this = this;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            if (!transaction) return [3 /*break*/, 2];
                                                            transaction.state = transaction_1.TransactionState.Delivered;
                                                            return [4 /*yield*/, this.updateTransaction(transaction).then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                                                    return __generator(this, function (_a) {
                                                                        if (transaction) {
                                                                            this.refresh();
                                                                        }
                                                                        return [2 /*return*/];
                                                                    });
                                                                }); })];
                                                        case 1:
                                                            _a.sent();
                                                            _a.label = 2;
                                                        case 2: return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 1:
                                        // PONEMOS LA TRANSACCION EN ESTADO EN ENTREGADO
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); });
                        _e.label = 8;
                    case 8: return [3 /*break*/, 23];
                    case 9: return [4 /*yield*/, this.getPrinters().then(function (printers) {
                            _this.printers = printers;
                        })];
                    case 10:
                        _e.sent();
                        if (this.countPrinters() > 1) {
                            modalRef = this._modalService.open(this.contentPrinters, { size: 'lg', backdrop: 'static' }).result.then(function (result) {
                                if (result !== "cancel" && result !== '') {
                                    _this.printerSelected = result;
                                    _this.openModal("print");
                                }
                                else {
                                    if (_this.posType !== 'delivery' && _this.transaction.state === transaction_1.TransactionState.Closed && _this.transaction.type.automaticCreation) {
                                        _this.transactionTypeId = _this.transaction.type._id;
                                        _this.transaction = undefined;
                                    }
                                    _this.refresh();
                                }
                            }, function (reason) {
                                if (_this.posType !== 'delivery' && _this.transaction.state === transaction_1.TransactionState.Closed && _this.transaction.type.automaticCreation) {
                                    _this.transactionTypeId = _this.transaction.type._id;
                                    _this.transaction = undefined;
                                }
                                _this.refresh();
                            });
                        }
                        else if (this.countPrinters() === 1) {
                            this.printerSelected = this.printers[0];
                            this.openModal("print");
                        }
                        return [3 /*break*/, 23];
                    case 11:
                        modalRef = this._modalService.open(view_transaction_component_1.ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
                        modalRef.componentInstance.transactionId = this.transaction._id;
                        return [3 /*break*/, 23];
                    case 12:
                        modalRef = this._modalService.open(delete_transaction_component_1.DeleteTransactionComponent, { size: 'lg', backdrop: 'static' });
                        modalRef.componentInstance.transactionId = this.transaction._id;
                        modalRef.result.then(function (result) {
                            if (result === "delete_close") {
                                _this.refresh();
                            }
                        }, function (reason) {
                        });
                        return [3 /*break*/, 23];
                    case 13:
                        modalRef = this._modalService.open(select_employee_component_1.SelectEmployeeComponent);
                        modalRef.componentInstance.requireLogin = false;
                        modalRef.componentInstance.typeEmployee = this.employeeTypeSelected;
                        modalRef.componentInstance.op = 'open-turn';
                        modalRef.result.then(function (result) {
                            if (result.turn) {
                                _this.showMessage("El turno se ha abierto correctamente", 'success', true);
                            }
                        }, function (reason) {
                        });
                        return [3 /*break*/, 23];
                    case 14:
                        modalRef = this._modalService.open(select_employee_component_1.SelectEmployeeComponent);
                        modalRef.componentInstance.requireLogin = false;
                        modalRef.componentInstance.typeEmployee = this.employeeTypeSelected;
                        modalRef.componentInstance.op = 'close-turn';
                        modalRef.result.then(function (result) {
                            if (result.turn) {
                                _this.showMessage("El turno se ha cerrado correctamente", 'success', true);
                            }
                        }, function (reason) {
                        });
                        return [3 /*break*/, 23];
                    case 15:
                        modalRef = this._modalService.open(cash_box_component_1.CashBoxComponent, { size: 'lg', backdrop: 'static' });
                        modalRef.componentInstance.transactionType = this.transaction.type;
                        modalRef.result.then(function (result) {
                            if (result && result.cashBox) {
                            }
                            else {
                                _this.hideMessage();
                            }
                        }, function (reason) {
                            _this.hideMessage();
                        });
                        return [3 /*break*/, 23];
                    case 16:
                        modalRef = this._modalService.open(select_branch_component_1.SelectBranchComponent);
                        modalRef.result.then(function (result) {
                            if (result && result.branch) {
                                _this.transaction.branchOrigin = result.branch;
                                _this.transaction.branchDestination = result.branch;
                                _this.nextStepTransaction();
                            }
                            else {
                                _this.hideMessage();
                            }
                        }, function (reason) {
                            _this.hideMessage();
                        });
                        return [3 /*break*/, 23];
                    case 17:
                        modalRef = this._modalService.open(select_origin_component_1.SelectOriginComponent);
                        modalRef.componentInstance.branchId = this.transaction.branchDestination._id;
                        modalRef.result.then(function (result) {
                            if (result && result.origin) {
                                _this.transaction.origin = result.origin.number;
                                _this.nextStepTransaction();
                            }
                            else {
                                _this.hideMessage();
                            }
                        }, function (reason) {
                            _this.hideMessage();
                        });
                        return [3 /*break*/, 23];
                    case 18:
                        modalRef = this._modalService.open(select_employee_component_1.SelectEmployeeComponent);
                        modalRef.componentInstance.requireLogin = false;
                        if (this.posType === 'resto' && this.tableSelected) {
                            modalRef.componentInstance.op = 'open-table';
                            modalRef.componentInstance.table = this.tableSelected;
                        }
                        else {
                            modalRef.componentInstance.op = 'select-employee';
                        }
                        modalRef.componentInstance.typeEmployee = this.transaction.type.requestEmployee;
                        modalRef.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!result.employee) return [3 /*break*/, 6];
                                        this.transaction.employeeOpening = result.employee;
                                        this.transaction.employeeClosing = result.employee;
                                        if (!(this.posType === "delivery")) return [3 /*break*/, 2];
                                        this.transaction.state = transaction_1.TransactionState.Sent;
                                        return [4 /*yield*/, this.updateTransaction(this.transaction).then(function (transaction) {
                                                if (transaction) {
                                                    _this.transaction = transaction;
                                                    _this.refresh();
                                                }
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 5];
                                    case 2:
                                        if (!(this.posType === 'resto' && this.tableSelected)) return [3 /*break*/, 4];
                                        this.tableSelected.employee = result.employee;
                                        this.tableSelected.diners = result.diners;
                                        return [4 /*yield*/, this.updateTable().then(function (table) {
                                                if (table) {
                                                    _this.tableSelected = table;
                                                    _this.transaction.diners = _this.tableSelected.diners;
                                                    _this.nextStepTransaction();
                                                }
                                            })];
                                    case 3:
                                        _a.sent();
                                        return [3 /*break*/, 5];
                                    case 4:
                                        this.nextStepTransaction();
                                        _a.label = 5;
                                    case 5: return [3 /*break*/, 7];
                                    case 6:
                                        this.refresh();
                                        _a.label = 7;
                                    case 7: return [2 /*return*/];
                                }
                            });
                        }); }, function (reason) {
                            _this.refresh();
                        });
                        return [3 /*break*/, 23];
                    case 19:
                        modalRef = this._modalService.open(select_deposit_component_1.SelectDepositComponent);
                        modalRef.componentInstance.op = op;
                        modalRef.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var depositOrigin, branchO, depositDestination, branchD;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(result && result.origin && result.destination)) return [3 /*break*/, 5];
                                        return [4 /*yield*/, this.getDeposits({ _id: { $oid: result.origin }, operationType: { $ne: 'D' } })];
                                    case 1:
                                        depositOrigin = _a.sent();
                                        this.transaction.depositOrigin = depositOrigin[0];
                                        return [4 /*yield*/, this.getBranches({ _id: { $oid: depositOrigin[0].branch }, operationType: { $ne: 'D' } })];
                                    case 2:
                                        branchO = _a.sent();
                                        this.transaction.branchOrigin = branchO[0];
                                        return [4 /*yield*/, this.getDeposits({ _id: { $oid: result.destination }, operationType: { $ne: 'D' } })];
                                    case 3:
                                        depositDestination = _a.sent();
                                        return [4 /*yield*/, this.getBranches({ _id: { $oid: depositDestination[0].branch }, operationType: { $ne: 'D' } })];
                                    case 4:
                                        branchD = _a.sent();
                                        this.transaction.branchDestination = branchD[0];
                                        this.transaction.depositDestination = depositDestination[0];
                                        this.nextStepTransaction();
                                        return [3 /*break*/, 6];
                                    case 5:
                                        this.hideMessage();
                                        _a.label = 6;
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); }, function (reason) {
                            _this.hideMessage();
                        });
                        return [3 /*break*/, 23];
                    case 20:
                        modalRef = this._modalService.open(add_transaction_component_1.AddTransactionComponent, { size: 'lg', backdrop: 'static' });
                        modalRef.componentInstance.transactionId = this.transaction._id;
                        modalRef.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (result && result.transaction) {
                                    this.updateTransaction(result.transaction);
                                    this.refresh();
                                }
                                else {
                                    this.refresh();
                                }
                                return [2 /*return*/];
                            });
                        }); }, function (reason) {
                            _this.refresh();
                        });
                        return [3 /*break*/, 23];
                    case 21:
                        attachments = [];
                        if (this.transaction.type.readLayout) {
                            modalRef = this._modalService.open(print_transaction_type_component_1.PrintTransactionTypeComponent);
                            modalRef.componentInstance.transactionId = this.transaction._id;
                            modalRef.componentInstance.source = "mail";
                        }
                        else {
                            modalRef = this._modalService.open(print_component_1.PrintComponent);
                            modalRef.componentInstance.company = this.transaction.company;
                            modalRef.componentInstance.transactionId = this.transaction._id;
                            modalRef.componentInstance.typePrint = 'invoice';
                            modalRef.componentInstance.source = "mail";
                        }
                        if (this.transaction.type.defectPrinter) {
                            modalRef.componentInstance.printer = this.transaction.type.defectPrinter;
                        }
                        else {
                            if (this.printers && this.printers.length > 0) {
                                for (_c = 0, _d = this.printers; _c < _d.length; _c++) {
                                    printer = _d[_c];
                                    if (printer.printIn === printer_1.PrinterPrintIn.Counter) {
                                        modalRef.componentInstance.printer = printer;
                                    }
                                }
                            }
                        }
                        modalRef = this._modalService.open(send_email_component_1.SendEmailComponent, { size: 'lg', backdrop: 'static' });
                        if (this.transaction.company && this.transaction.company.emails) {
                            modalRef.componentInstance.emails = this.transaction.company.emails;
                        }
                        labelPrint = this.transaction.type.name;
                        if (this.transaction.type.labelPrint) {
                            labelPrint = this.transaction.type.labelPrint;
                        }
                        modalRef.componentInstance.subject = labelPrint + " " + this.padNumber(this.transaction.origin, 4) + "-" + this.transaction.letter + "-" + this.padNumber(this.transaction.number, 8);
                        if (this.transaction.type.electronics) {
                            // modalRef.componentInstance.body = `Estimado Cliente: Haciendo click en el siguiente link, podrá descargar el comprobante correspondiente` + `<a href="http://vps-1883265-x.dattaweb.com:300/api/print/invoice/${Config.database}/${this.transaction._id}">Su comprobante</a>`
                            modalRef.componentInstance.body = ' ';
                            attachments.push({
                                filename: this.transaction.origin + "-" + this.transaction.letter + "-" + this.transaction.number + ".pdf",
                                path: "/home/clients/" + app_config_1.Config.database + "/invoice/" + this.transaction._id + ".pdf"
                            });
                        }
                        else {
                            // modalRef.componentInstance.body = `Estimado Cliente: Haciendo click en el siguiente link, podrá descargar el comprobante correspondiente ` + `<a href="http://vps-1883265-x.dattaweb.com:300/api/print/others/${Config.database}/${this.transaction._id}">Su comprobante</a>`
                            modalRef.componentInstance.body = ' ';
                            attachments.push({
                                filename: this.transaction.origin + "-" + this.transaction.letter + "-" + this.transaction.number + ".pdf",
                                path: "/home/clients/" + app_config_1.Config.database + "/others/" + this.transaction._id + ".pdf"
                            });
                        }
                        if (app_config_1.Config.country === 'MX') {
                            // modalRef.componentInstance.body += ` y su XML correspondiente en <a href="http://vps-1883265-x.dattaweb.com:300/api/print/xml/CFDI-33_Factura_` + this.transaction.number + `">Su comprobante</a>`;
                            modalRef.componentInstance.body += ' ';
                            attachments.push({
                                filename: this.transaction.origin + "-" + this.transaction.letter + "-" + this.transaction.number + ".xml",
                                path: "/var/www/html/libs/fe/mx/archs_cfdi/CFDI-33_Factura_" + this.transaction.number + ".xml"
                            });
                        }
                        if (this.transaction.type.defectEmailTemplate) {
                            if (this.transaction.type.electronics) {
                                // modalRef.componentInstance.body = this.transaction.type.defectEmailTemplate.design + `<a href="http://vps-1883265-x.dattaweb.com:300/api/print/invoice/${Config.database}/${this.transaction._id}">Su comprobante</a>`
                                modalRef.componentInstance.body = this.transaction.type.defectEmailTemplate.design;
                                attachments = [];
                                attachments.push({
                                    filename: this.transaction.origin + "-" + this.transaction.letter + "-" + this.transaction.number + ".pdf",
                                    path: "/home/clients/" + app_config_1.Config.database + "/invoice/" + this.transaction._id + ".pdf"
                                });
                            }
                            else {
                                // modalRef.componentInstance.body = this.transaction.type.defectEmailTemplate.design + `<a href="http://vps-1883265-x.dattaweb.com:300/api/print/others/${Config.database}/${this.transaction._id}">Su comprobante</a>`
                                modalRef.componentInstance.body = this.transaction.type.defectEmailTemplate.design;
                                attachments = [];
                                attachments.push({
                                    filename: this.transaction.origin + "-" + this.transaction.letter + "-" + this.transaction.number + ".pdf",
                                    path: "/home/clients/" + app_config_1.Config.database + "/others/" + this.transaction._id + ".pdf"
                                });
                            }
                            if (app_config_1.Config.country === 'MX') {
                                // modalRef.componentInstance.body += ` y su XML correspondiente en <a href="http://vps-1883265-x.dattaweb.com:300/api/print/xml/CFDI-33_Factura_` + this.transaction.number + `">Su comprobante</a>`;
                                modalRef.componentInstance.body += ' ';
                                attachments = [];
                                attachments.push({
                                    filename: this.transaction.origin + "-" + this.transaction.letter + "-" + this.transaction.number + ".xml",
                                    path: "/var/www/html/libs/fe/mx/archs_cfdi/CFDI-33_Factura_" + this.transaction.number + ".xml"
                                });
                            }
                        }
                        modalRef.componentInstance.attachments = attachments;
                        modalRef.result.then(function (result) {
                            _this.refresh();
                        }, function (reason) {
                            _this.refresh();
                        });
                        return [3 /*break*/, 23];
                    case 22:
                        ;
                        _e.label = 23;
                    case 23: return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.padNumber = function (n, length) {
        var n = n.toString();
        while (n.length < length)
            n = "0" + n;
        return n;
    };
    PointOfSaleComponent.prototype.validateElectronicTransactionAR = function (transaction, state) {
        if (state === void 0) { state = transaction_1.TransactionState.Closed; }
        return __awaiter(this, void 0, void 0, function () {
            var movementsOfCancellations;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTransaction(transaction._id)];
                    case 1:
                        transaction = _a.sent();
                        // ACTUALIZAMOS LA FECHA DE LA FACTURA AL DÍA DE HOY
                        transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
                        transaction.VATPeriod = moment(transaction.endDate, 'YYYY-MM-DDTHH:mm:ssZ').format('YYYYMM');
                        transaction.expirationDate = transaction.endDate;
                        return [4 /*yield*/, this.getMovementsOfCancellations().then(function (movementsOfCancellations) {
                                if (movementsOfCancellations) {
                                    movementsOfCancellations = movementsOfCancellations;
                                }
                            })];
                    case 2:
                        _a.sent();
                        if (transaction.type.electronics) {
                            this.showMessage("Validando comprobante con AFIP...", 'info', false);
                            this.loading = true;
                            transaction.type.defectEmailTemplate = null;
                            this._transactionService.validateElectronicTransactionAR(transaction, movementsOfCancellations).subscribe(function (result) { return __awaiter(_this, void 0, void 0, function () {
                                var msn, body;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            msn = '';
                                            if (!(result && result.CAE)) return [3 /*break*/, 2];
                                            transaction.number = result.number;
                                            transaction.CAE = result.CAE;
                                            transaction.CAEExpirationDate = moment(result.CAEExpirationDate, 'DD/MM/YYYY HH:mm:ss').format("YYYY-MM-DDTHH:mm:ssZ");
                                            transaction.state = state;
                                            return [4 /*yield*/, this.updateTransaction(transaction).then(function (transaction) {
                                                    if (transaction) {
                                                        if (_this.transaction && _this.transaction.type.printable) {
                                                            _this.refresh();
                                                            if (_this.transaction.type.defectPrinter) {
                                                                _this.printerSelected = _this.printerSelected;
                                                                _this.openModal("print");
                                                            }
                                                            else {
                                                                _this.openModal("printers");
                                                            }
                                                        }
                                                        else if (_this.transaction && _this.transaction.type.requestEmailTemplate) {
                                                            _this.openModal('send-email');
                                                        }
                                                        else {
                                                            _this.refresh();
                                                        }
                                                    }
                                                })];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            if (result && result.status != 0) {
                                                if (result.status === 'err') {
                                                    if (result.code && result.code !== '') {
                                                        msn += result.code + " - ";
                                                    }
                                                    if (result.message && result.message !== '') {
                                                        msn += result.message + ". ";
                                                    }
                                                    if (result.observationMessage && result.observationMessage !== '') {
                                                        msn += result.observationMessage + ". ";
                                                    }
                                                    if (result.observationMessage2 && result.observationMessage2 !== '') {
                                                        msn += result.observationMessage2 + ". ";
                                                    }
                                                    if (msn === '') {
                                                        msn = "Ha ocurrido un error al intentar validar la factura. Comuníquese con Soporte Técnico.";
                                                    }
                                                    this.showMessage(msn, 'info', true);
                                                    body = {
                                                        transaction: {
                                                            origin: transaction.origin,
                                                            letter: transaction.letter,
                                                            number: transaction.number,
                                                            startDate: transaction.startDate,
                                                            endDate: transaction.endDate,
                                                            expirationDate: transaction.expirationDate,
                                                            VATPeriod: transaction.VATPeriod,
                                                            state: transaction.state,
                                                            basePrice: transaction.basePrice,
                                                            exempt: transaction.exempt,
                                                            discountAmount: transaction.discountAmount,
                                                            discountPercent: transaction.discountPercent,
                                                            totalPrice: transaction.totalPrice,
                                                            roundingAmount: transaction.roundingAmount,
                                                            CAE: transaction.CAE,
                                                            CAEExpirationDate: transaction.CAEExpirationDate,
                                                            type: transaction.type,
                                                            company: transaction.company,
                                                            priceList: transaction.priceList
                                                        },
                                                        config: {
                                                            companyIdentificationValue: this.config['companyIdentificationValue'],
                                                            vatCondition: this.config['companyVatCondition'].code,
                                                            database: this.config['database']
                                                        }
                                                    };
                                                    this.saveClaim('ERROR FE AR ' + moment().format('DD/MM/YYYY HH:mm') + " : " + msn, JSON.stringify(body));
                                                }
                                                else if (result.message) {
                                                    this.showMessage(result.message, 'info', true);
                                                    this.saveClaim('ERROR FE AR ' + moment().format('DD/MM/YYYY HH:mm') + " : " + "ERROR AL CONECTAR ", result.message);
                                                }
                                                else {
                                                    if (msn === '') {
                                                        msn = "Ha ocurrido un error al intentar validar la factura. Comuníquese con Soporte Técnico.";
                                                    }
                                                    this.showMessage(msn, 'info', true);
                                                }
                                            }
                                            else {
                                                if (msn === '') {
                                                    msn = "Ha ocurrido un error al intentar validar la factura. Comuníquese con Soporte Técnico.";
                                                }
                                                this.showMessage(msn, 'info', true);
                                            }
                                            _a.label = 3;
                                        case 3:
                                            this.loading = false;
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, function (error) {
                                _this.showMessage("Ha ocurrido un error en el servidor. Comuníquese con Soporte.", 'danger', false);
                                _this.loading = false;
                            });
                        }
                        else {
                            this.showMessage("Debe configurar el tipo de transacción como electrónica.", 'danger', false);
                            this.loading = false;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.getMovementsOfCancellations = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._movementOfCancellationService.getAll({
                project: {
                    _id: 1,
                    'transactionDestination': 1,
                    'transactionOrigin._id': 1,
                    'transactionOrigin.type.codes': 1,
                    'transactionOrigin.letter': 1,
                    'transactionOrigin.origin': 1,
                    'transactionOrigin.number': 1
                },
                match: { transactionDestination: { $oid: _this.transaction._id } }
            }).subscribe(function (result) {
                if (result.status == 200) {
                    resolve(result.result);
                }
                else {
                    resolve(null);
                }
            }, function (error) {
                _this.showMessage(error._body, 'danger', false);
                resolve(null);
            });
        });
    };
    PointOfSaleComponent.prototype.saveClaim = function (titulo, message) {
        this.loading = true;
        var claim = new claim_1.Claim();
        claim.description = message;
        claim.name = titulo;
        claim.priority = claim_1.ClaimPriority.High;
        claim.type = claim_1.ClaimType.Err;
        claim.listName = 'ERRORES 500';
        this._claimService.saveClaim(claim).subscribe();
    };
    PointOfSaleComponent.prototype.updateTable = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._tableService.updateTable(_this.tableSelected).subscribe(function (result) {
                if (result.table) {
                    resolve(result.table);
                }
                else
                    reject(result);
            }, function (error) { return reject(error); });
        });
    };
    PointOfSaleComponent.prototype.isValidCharge = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var isValid = true;
                        if (isValid &&
                            _this.transaction.type.transactionMovement === transaction_type_1.TransactionMovement.Purchase &&
                            !_this.transaction.company) {
                            isValid = false;
                            _this.showMessage("Debe seleccionar un proveedor para la transacción.", 'info', true);
                        }
                        if (isValid &&
                            _this.transaction.type.electronics &&
                            _this.transaction.totalPrice >= 5000 &&
                            !_this.transaction.company &&
                            app_config_1.Config.country === 'AR') {
                            isValid = false;
                            _this.showMessage("Debe indentificar al cliente para transacciones electrónicos con monto mayor a $5.000,00.", 'info', true);
                        }
                        if (isValid &&
                            _this.transaction.type.electronics &&
                            _this.transaction.company && (!_this.transaction.company.identificationType ||
                            !_this.transaction.company.identificationValue ||
                            _this.transaction.company.identificationValue === '')) {
                            isValid = false;
                            _this.showMessage("El cliente ingresado no tiene número de identificación", 'info', true);
                            _this.loading = false;
                        }
                        if (isValid &&
                            _this.transaction.type.fixedOrigin &&
                            _this.transaction.type.fixedOrigin === 0 &&
                            _this.transaction.type.electronics &&
                            app_config_1.Config.country === 'MX') {
                            isValid = false;
                            _this.showMessage("Debe configurar un punto de venta para transacciones electrónicos. Lo puede hacer en /Configuración/Tipos de Transacción.", 'info', true);
                            _this.loading = false;
                        }
                        resolve(isValid);
                    })];
            });
        });
    };
    PointOfSaleComponent.prototype.finishTransaction = function (state) {
        if (state === void 0) { state = transaction_1.TransactionState.Closed; }
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, movementOfCash, result, print, _b, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        if (!(this.movementsOfCashes && this.movementsOfCashes.length > 0)) return [3 /*break*/, 4];
                        _i = 0, _a = this.movementsOfCashes;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        movementOfCash = _a[_i];
                        if (!(movementOfCash.balanceCanceled > 0)) return [3 /*break*/, 3];
                        movementOfCash.cancelingTransaction = this.transaction;
                        return [4 /*yield*/, this.updateMovementOfCash(movementOfCash)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, this._transactionService.updateBalance(this.transaction).toPromise()];
                    case 5:
                        result = _c.sent();
                        if (result.status !== 200)
                            throw result;
                        this.transaction.balance = result.result.balance;
                        if (this.posType === 'resto' || this.posType === "delivery") {
                            this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
                            this.transaction.VATPeriod = moment().format('YYYYMM');
                        }
                        else {
                            if (!this.transaction.endDate) {
                                this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
                            }
                            if (this.transaction.type.transactionMovement !== transaction_type_1.TransactionMovement.Purchase || !this.transaction.VATPeriod) {
                                this.transaction.VATPeriod = moment(this.transaction.endDate, 'YYYY-MM-DDTHH:mm:ssZ').format('YYYYMM');
                            }
                        }
                        this.transaction.expirationDate = this.transaction.endDate;
                        this.transaction.state = state;
                        print = false;
                        if (this.transaction.type.printable && this.transaction.printed === 0) {
                            this.transaction.printed = 1;
                            print = true;
                        }
                        _b = this;
                        return [4 /*yield*/, this.updateTransaction(this.transaction)];
                    case 6:
                        _b.transaction = _c.sent();
                        if (print) {
                            this.refresh();
                            if (this.transaction.type.defectPrinter) {
                                this.printerSelected = this.printerSelected;
                                this.openModal("print");
                            }
                            else {
                                this.openModal("printers");
                            }
                        }
                        else {
                            if (this.posType !== 'delivery' && this.transaction.state === transaction_1.TransactionState.Closed && this.transaction.type.automaticCreation) {
                                this.transactionTypeId = this.transaction.type._id;
                                this.transaction = undefined;
                            }
                            this.refresh();
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _c.sent();
                        this.showToast(error_2);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.updateMovementOfCash = function (movementOfCash) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._movementOfCashService.updateMovementOfCash(movementOfCash).subscribe(function (result) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (result && result.movementOfCash) {
                        resolve(result.movementOfCash);
                    }
                    else
                        reject(result);
                    return [2 /*return*/];
                });
            }); }, function (error) { return reject(error); });
        });
    };
    PointOfSaleComponent.prototype.getTransactions = function (query) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._transactionService.getTransactions(query).subscribe(function (result) {
                if (!result.transactions) {
                    resolve(new Array());
                }
                else {
                    resolve(result.transactions);
                }
            }, function (error) {
                _this.showMessage(error._body, 'danger', false);
                resolve(new Array());
            });
        });
    };
    PointOfSaleComponent.prototype.getTransactionsV2 = function (match) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.loading = true;
            var project = {
                _id: 1,
                startDate: 1,
                endDate: 1,
                origin: 1,
                number: 1,
                orderNumber: 1,
                observation: 1,
                totalPrice: 1,
                balance: 1,
                state: 1,
                madein: 1,
                operationType: 1,
                taxes: 1,
                CAE: 1,
                "company.name": 1,
                "type._id": 1,
                "type.allowEdit": 1,
                "type.name": 1,
                "type.level": 1,
                "type.transactionMovement": 1,
                "type.electronics": 1,
                "type.paymentMethods": 1,
                "branchOrigin": 1,
                "deliveryAddress.name": 1,
                "deliveryAddress.number": 1,
                "deliveryAddress.floor": 1,
                "deliveryAddress.flat": 1,
                "deliveryAddress.city": 1,
                "deliveryAddress.state": 1,
                "deliveryAddress.observation": 1,
                "shipmentMethod.name": 1,
                "paymentMethodEcommerce": 1
            };
            if (_this.transactionMovement === transaction_type_1.TransactionMovement.Stock) {
                project["type.stockMovement"] = 1;
                project["depositOrigin._id"] = 1;
                project["depositOrigin.name"] = 1;
                project["depositDestination._id"] = 1;
                project["depositDestination.name"] = 1;
            }
            if (_this.transactionMovement !== transaction_type_1.TransactionMovement.Stock) {
                project["company._id"] = 1;
                project["company.name"] = 1;
            }
            if (_this.transactionMovement === transaction_type_1.TransactionMovement.Sale) {
                project["employeeClosing._id"] = 1;
                project["employeeClosing.name"] = 1;
            }
            var sort = { startDate: -1 };
            if (_this.posType === 'pedidos-web' || _this.posType === 'mercadolibre' || _this.posType === 'carritos-abandonados') {
                sort = { orderNumber: -1 };
                _this.orderTerm = ['-orderNumber'];
            }
            if (_this.user && _this.user.permission && _this.user.permission.transactionTypes && _this.user.permission.transactionTypes.length > 0) {
                var transactionTypes = [];
                _this.user.permission.transactionTypes.forEach(function (element) {
                    transactionTypes.push({ "$oid": element });
                });
                match['type._id'] = { "$in": transactionTypes };
            }
            _this.subscription.add(_this._transactionService.getTransactionsV2(project, // PROJECT
            match, // MATCH
            sort, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
            ).subscribe(function (result) {
                _this.loading = false;
                _this.hideMessage();
                resolve(result.transactions);
            }, function (error) {
                _this.showMessage(error._body, 'danger', false);
                _this.loading = false;
                resolve(new Array());
            }));
        });
    };
    PointOfSaleComponent.prototype.updateBalance = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._transactionService.updateBalance(_this.transaction).subscribe(function (result) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!result.transaction) {
                        if (result.message && result.message !== '')
                            this.showMessage(result.message, 'info', true);
                        resolve(null);
                    }
                    else {
                        resolve(result.transaction.balance);
                    }
                    return [2 /*return*/];
                });
            }); }, function (error) {
                _this.showMessage(error._body, 'danger', false);
                reject(null);
            });
        });
    };
    PointOfSaleComponent.prototype.saveTransaction = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            (_this.posType === 'cuentas-corrientes') ? _this.transaction.madein = 'mostrador' : _this.transaction.madein = _this.posType;
            _this._transactionService.saveTransaction(_this.transaction).subscribe(function (result) {
                if (result.transaction) {
                    resolve(result.transaction);
                }
                else
                    reject(result);
            }, function (error) { return reject(error); });
        });
    };
    PointOfSaleComponent.prototype.countPrinters = function () {
        var numberOfPrinters = 0;
        var printersAux = new Array();
        if (this.printers && this.printers.length > 0) {
            for (var _i = 0, _a = this.printers; _i < _a.length; _i++) {
                var printer = _a[_i];
                if (printer.printIn === printer_1.PrinterPrintIn.Counter) {
                    printersAux.push(printer);
                    numberOfPrinters++;
                }
            }
        }
        else {
            numberOfPrinters = 0;
        }
        this.printers = printersAux;
        return numberOfPrinters;
    };
    PointOfSaleComponent.prototype.updateTransaction = function (transaction) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._transactionService.updateTransaction(transaction).subscribe(function (result) {
                if (result.transaction)
                    resolve(result.transaction);
                else
                    reject(result);
            }, function (error) { return reject(error); });
        });
    };
    PointOfSaleComponent.prototype.selectTable = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.getTable(table._id)];
                    case 1:
                        _a.tableSelected = _c.sent();
                        if (!(this.tableSelected.state !== table_1.TableState.Disabled &&
                            this.tableSelected.state !== table_1.TableState.Reserved)) return [3 /*break*/, 10];
                        if (!(this.tableSelected.state === table_1.TableState.Busy ||
                            this.tableSelected.state === table_1.TableState.Pending)) return [3 /*break*/, 8];
                        if (!this.tableSelected.lastTransaction) return [3 /*break*/, 6];
                        _b = this;
                        return [4 /*yield*/, this.getTransaction(this.tableSelected.lastTransaction._id)];
                    case 2:
                        _b.transaction = _c.sent();
                        if (!this.transaction) return [3 /*break*/, 4];
                        this.transaction.state = transaction_1.TransactionState.Open;
                        return [4 /*yield*/, this.updateTransaction(this.transaction).then(function (transaction) {
                                if (transaction) {
                                    _this.transaction = transaction;
                                }
                            })];
                    case 3:
                        _c.sent();
                        this.nextStepTransaction();
                        return [3 /*break*/, 5];
                    case 4:
                        this.hideMessage();
                        this.checkFreeTable();
                        _c.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        this.checkFreeTable();
                        _c.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        this.checkFreeTable();
                        _c.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        this.showMessage("La mesa seleccionada se encuentra " + this.tableSelected.state, 'info', true);
                        _c.label = 11;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.checkFreeTable = function () {
        var _this = this;
        // Consultamos si existen transacciones abiertas por si perdio la relación.
        this.getTransactions("where=\"table\":\"" + this.tableSelected._id + "\",\"state\":\"Abierto\"").then(function (transactions) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (transactions && transactions.length > 0) {
                            this.tableSelected.state = table_1.TableState.Busy;
                            this.tableSelected.lastTransaction = transactions[0];
                        }
                        else {
                            this.tableSelected.state = table_1.TableState.Available;
                        }
                        return [4 /*yield*/, this.updateTable().then(function (table) {
                                if (table && table.state === table_1.TableState.Available) {
                                    _this.initTransactionByType('defectOrders');
                                }
                                else {
                                    _this.selectTable(table);
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    PointOfSaleComponent.prototype.getTable = function (tableId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.loading = true;
            _this._tableService.getTable(tableId).subscribe(function (result) {
                _this.loading = false;
                if (!result.table) {
                    if (result.message && result.message !== '')
                        _this.showMessage(result.message, 'info', true);
                    resolve(null);
                }
                else {
                    resolve(result.table);
                }
            }, function (error) {
                _this.showMessage(error._body, 'danger', false);
                _this.loading = false;
                resolve(null);
            });
        });
    };
    PointOfSaleComponent.prototype.changeStateOfTransaction = function (transaction, state) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, email, oldState, print_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.getTransaction(transaction._id)];
                    case 1:
                        _a.transaction = _b.sent();
                        if (!this.transaction) return [3 /*break*/, 7];
                        oldState = this.transaction.state;
                        this.transaction.state = state;
                        if (!this.transaction.type.allowAPP) return [3 /*break*/, 4];
                        if (!this.transaction.company) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getUsers({ company: { $oid: this.transaction.company._id } })
                                .then(function (users) {
                                if (users && users.length > 0)
                                    email = users[0].email;
                            })];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        if (email && this.transaction.state.toString() === transaction_1.TransactionState.PaymentConfirmed.toString()) {
                            this.transaction.balance = 0;
                            if (this.transaction.type.application.email.statusTransaction.paymentConfirmed.enabled) {
                                this.sendEmail("Pago confirmado en tu Pedido N\u00FAmero " + this.transaction.orderNumber, "Hola " + transaction.company.name + " confirmamos el pago de tu compra.</br><b>Ya estamos preparando tu pedido, te avisamos cuando este en camino.</b>", email);
                            }
                            if (oldState === transaction_1.TransactionState.Delivered)
                                this.transaction.state = transaction_1.TransactionState.Closed;
                        }
                        else if (email && this.transaction.state.toString() === transaction_1.TransactionState.PaymentDeclined.toString()) {
                            this.transaction.balance = 0;
                            if (this.transaction.type.application.email.statusTransaction.paymentDeclined.enabled) {
                                this.sendEmail("Pago rechazado en tu Pedido N\u00FAmero " + this.transaction.orderNumber, "Hola " + transaction.company.name + " rechazamos el pago de tu compra.</br><b>Lamentamos el incoveniente por no poder finalizar la compra. Puedes realizar de nuevo el pedido cuando desees, te esperamos.</b>", email);
                            }
                        }
                        else if (email && this.transaction.state.toString() === transaction_1.TransactionState.Sent.toString()) {
                            if (this.transaction.type.application.email.statusTransaction.sent.enabled) {
                                this.sendEmail("Tu Pedido N\u00FAmero " + this.transaction.orderNumber + " est\u00E1 en camino.", transaction.company.name + " realizamos el env\u00EDo de tu pedido.</br>\n                        <b>Ya se encuentra en camino a\n                        " + this.transaction.deliveryAddress.name + " " + this.transaction.deliveryAddress.number + ",\n                        " + this.transaction.deliveryAddress.city + ",\n                        " + this.transaction.deliveryAddress.state + ".\n                        </b>", email);
                            }
                        }
                        else if (email && this.transaction.state.toString() === transaction_1.TransactionState.Delivered.toString()) {
                            if (this.transaction.type.application.email.statusTransaction.delivered.enabled) {
                                this.sendEmail("Tu Pedido N\u00FAmero " + this.transaction.orderNumber + " ha sido entregado.", transaction.company.name + " hemos entregado tu pedido.</br>\n                  <b>Gracias por elegirnos. \u00A1Te esperamos pronto!</b>", email);
                            }
                            if (this.transaction.balance === 0 && ((this.transaction.type.electronics && this.transaction.CAE) || !this.transaction.type.electronics))
                                this.transaction.state = transaction_1.TransactionState.Closed;
                        }
                        _b.label = 4;
                    case 4:
                        if (!(this.transaction.state === transaction_1.TransactionState.Closed)) return [3 /*break*/, 5];
                        this.finishTransaction();
                        return [3 /*break*/, 7];
                    case 5:
                        print_1 = false;
                        if (this.transaction.type.printable && this.transaction.printed === 0) {
                            this.transaction.printed = 1;
                            print_1 = true;
                        }
                        if (this.transaction.state === transaction_1.TransactionState.Open ||
                            this.transaction.state === transaction_1.TransactionState.Pending ||
                            this.transaction.state === transaction_1.TransactionState.Outstanding ||
                            this.transaction.state === transaction_1.TransactionState.PaymentDeclined ||
                            this.transaction.state === transaction_1.TransactionState.Canceled) {
                            print_1 = false;
                        }
                        return [4 /*yield*/, this.updateTransaction(this.transaction).then(function (transaction) {
                                if (transaction) {
                                    _this.transaction = transaction;
                                    if (print_1) {
                                        _this.refresh();
                                        if (_this.transaction.type.defectPrinter) {
                                            _this.printerSelected = _this.printerSelected;
                                            _this.openModal("print");
                                        }
                                        else {
                                            _this.openModal("printers");
                                        }
                                    }
                                    else {
                                        if (_this.posType !== 'delivery' && _this.transaction.state === transaction_1.TransactionState.Closed && _this.transaction.type.automaticCreation) {
                                            _this.transactionTypeId = _this.transaction.type._id;
                                            _this.transaction = undefined;
                                        }
                                        _this.refresh();
                                    }
                                }
                            })];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    PointOfSaleComponent.prototype.changeRoom = function (room) {
        this.roomSelected = room;
    };
    PointOfSaleComponent.prototype.orderBy = function (term, property) {
        if (this.orderTerm[0] === term) {
            this.orderTerm[0] = "-" + term;
        }
        else {
            this.orderTerm[0] = term;
        }
        this.propertyTerm = property;
    };
    PointOfSaleComponent.prototype.sendEmail = function (title, message, email) {
        return __awaiter(this, void 0, void 0, function () {
            var html;
            var _this = this;
            return __generator(this, function (_a) {
                this.loading = true;
                html = "\n\t\t\t\t\t<div class=\"_3U2q6dcdZCrTrR_42Nxby JWNdg1hee9_Rz6bIGvG1c allowTextSelection\">\n\t\t\t\t\t<div>\n\t\t\t\t\t<style type=\"text/css\" style=\"box-sizing:border-box; margin:0; padding:0\">\n\t\t\t\t\t</style>\n\t\t\t\t\t<div class=\"rps_21ff\">\n\t\t\t\t\t<div style=\"background:#F7F3ED; box-sizing:border-box; color:#000; font-family:'Barlow',sans-serif; font-size:16px; margin:0; overflow-x:hidden; padding:0\">\n\t\t\t\t\t<div class=\"x_container\" style=\"border:1px solid #EDECED; box-sizing:border-box; margin:50px auto; max-width:650px; padding:0; width:100%\">\n\t\t\t\t\t<div class=\"x_reverse\" style=\"box-sizing:border-box; margin:0; padding:0\">\n\t\t\t\t\t\t<a href=\"" + window.location.toString().split("/#")[0] + "\" target=\"_blank\" rel=\"noopener noreferrer\" data-auth=\"NotApplicable\" style=\"box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none\">\n\t\t\t\t\t\t\t<div class=\"x_logo\" style=\"color:white; background-color:#0275D8; background-position:center; background-repeat:no-repeat; background-size:auto 24px; box-sizing:border-box; height:60px; margin:0; padding:15px; font-size: 30px;\">\n\t\t\t\t\t\t\t\t" + this.config["companyFantasyName"] + "\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</a>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"x_main x_password-recovery-main\" style=\"background:#fff; box-sizing:border-box; margin:0; padding:40px 38px; padding-top:14px; text-align:center\">\n\t\t\t\t\t<h2 style=\"box-sizing:border-box; color:#0275D8; font-size:43px; font-weight:bold; line-height:1; margin:12px 0; margin-bottom:10px; padding:0\">\n\t\t\t\t\t\t" + title + "\n\t\t\t\t\t</h2>\n\t\t\t\t\t<div class=\"x_generate-password\" style=\"box-sizing:border-box; display:flex; margin:0 auto; padding-top:20px; padding-bottom:20px;\">\n\t\t\t\t\t<div class=\"x_generate-password__description\" style=\"box-sizing:border-box; font-size:20px; letter-spacing:-0.25; line-height:1.25; margin:0; padding:0; text-align:left;\">\n\t\t\t\t\t<span class=\"x_icon-arrow x_icon-arrow--inline x_icon-arrow--sm\" style=\"background-repeat:no-repeat; background-size:contain; box-sizing:border-box; display:inline-block; height:17px; margin:0; padding:0; width:17px\">\n\t\t\t\t\t</span>\n\t\t\t\t\t<p style=\"box-sizing:border-box; padding:0; width:100%\">\n\t\t\t\t\t\t<span style=\"box-sizing:border-box; padding:0; margin-bottom:30px;\">\n\t\t\t\t\t\t\t" + message + "\n\t\t\t\t\t\t</span>\n          </p>\n          <br>\n\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<hr>\n\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<p style=\"box-sizing:border-box; font-size:12px; font-weight:300; letter-spacing:normal; line-height:1.08; margin:12px 0; margin-top:20px; padding:0\">\n\t\t\t\t\t<span style=\"box-sizing:border-box; margin:0; padding:0\">Si necesitas ayuda no dudes en dirigirte a nuestra \u00E1rea de contacto en\n\t\t\t\t\t</span>\n\t\t\t\t\t<span style=\"box-sizing:border-box; margin:0; padding:0\">Para cualquier consulta puedes escribirnos a\n\t\t\t\t\t</span>\n\t\t\t\t\t<a href=\"mailto:" + this.config["emailAccount"] + "\" target=\"_blank\" rel=\"noopener noreferrer\" data-auth=\"NotApplicable\" style=\"box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none\"> " + this.config["emailAccount"] + "\n\t\t\t\t\t</a>.\n\t\t\t\t\t</span>\n\t\t\t\t\t</p>\n\t\t\t\t\t<p style=\"box-sizing:border-box; font-size:12px; font-weight:300; letter-spacing:normal; line-height:1.08; margin:12px 0; margin-top:20px; padding:0; text-align: center;\">\n\t\t\t\t\t<span style=\"box-sizing:border-box; margin:0; padding:0\">Generado en <a href=\"http://www.poscloud.com.ar\" target=\"_blank\" rel=\"noopener noreferrer\" data-auth=\"NotApplicable\" style=\"box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none\">http://www.poscloud.com.ar</a>, tu Punto de Venta en la NUBE.\n\t\t\t\t\t</span>\n\t\t\t\t\t</p>\n\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t";
                this._emailService.sendEmailClient(title, html, email).subscribe(function (result) {
                    _this.loading = false;
                    if (result.accepted && result.accepted.length > 0) {
                    }
                    else {
                    }
                }, function (error) {
                    _this.loading = false;
                });
                return [2 /*return*/];
            });
        });
    };
    PointOfSaleComponent.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    PointOfSaleComponent.prototype.showMessage = function (message, type, dismissible) {
        this.alertMessage = message;
        this.alertConfig.type = type;
        this.alertConfig.dismissible = dismissible;
    };
    PointOfSaleComponent.prototype.hideMessage = function () {
        this.alertMessage = '';
    };
    PointOfSaleComponent.prototype.showToast = function (result, type, title, message) {
        if (result) {
            if (result.status === 200) {
                type = 'success';
                title = result.message;
            }
            else if (result.status >= 400) {
                type = 'danger';
                title = (result.error && result.error.message) ? result.error.message : result.message;
            }
            else {
                type = 'info';
                title = result.message;
            }
        }
        switch (type) {
            case 'success':
                this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
                break;
            case 'danger':
                this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
                break;
            default:
                this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
                break;
        }
        this.loading = false;
    };
    __decorate([
        core_1.ViewChild('contentPrinters', { static: true })
    ], PointOfSaleComponent.prototype, "contentPrinters");
    __decorate([
        core_1.Output()
    ], PointOfSaleComponent.prototype, "eventRefreshCurrentAccount");
    __decorate([
        core_1.Input()
    ], PointOfSaleComponent.prototype, "company");
    __decorate([
        core_1.Input()
    ], PointOfSaleComponent.prototype, "totalPrice");
    PointOfSaleComponent = __decorate([
        core_1.Component({
            selector: 'app-point-of-sale',
            templateUrl: './point-of-sale.component.html',
            styleUrls: ['./point-of-sale.component.scss'],
            providers: [ng_bootstrap_1.NgbAlertConfig, translate_me_1.TranslateMePipe],
            encapsulation: core_1.ViewEncapsulation.None
        })
    ], PointOfSaleComponent);
    return PointOfSaleComponent;
}());
exports.PointOfSaleComponent = PointOfSaleComponent;
