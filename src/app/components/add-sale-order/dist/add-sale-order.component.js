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
exports.AddSaleOrderComponent = void 0;
//Paquetes Angular
var core_1 = require("@angular/core");
//Paquetes de terceros
var ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
var moment = require("moment");
require("moment/locale/es");
//Modelos
var transaction_1 = require("../transaction/transaction");
var transaction_type_1 = require("../transaction-type/transaction-type");
var taxes_1 = require("../tax/taxes");
var article_1 = require("../article/article");
var movement_of_article_1 = require("../movement-of-article/movement-of-article");
var table_1 = require("../table/table");
var printer_1 = require("../printer/printer");
var app_config_1 = require("./../../app.config");
var company_1 = require("../company/company");
//Componentes
var add_movement_of_article_component_1 = require("../movement-of-article/add-movement-of-article/add-movement-of-article.component");
var select_employee_component_1 = require("../employee/select-employee/select-employee.component");
var print_component_1 = require("../print/print/print.component");
var delete_transaction_component_1 = require("../transaction/delete-transaction/delete-transaction.component");
var add_movement_of_cash_component_1 = require("../movement-of-cash/add-movement-of-cash/add-movement-of-cash.component");
var apply_discount_component_1 = require("../apply-discount/apply-discount.component");
//Pipes
var date_format_pipe_1 = require("../../main/pipes/date-format.pipe");
var round_number_pipe_1 = require("../../main/pipes/round-number.pipe");
var article_field_1 = require("../article-field/article-field");
var movement_of_cancellation_component_1 = require("../movement-of-cancellation/movement-of-cancellation.component");
var import_component_1 = require("../import/import.component");
var select_transport_component_1 = require("../transport/select-transport/select-transport.component");
var list_articles_pos_component_1 = require("../article/list-articles-pos/list-articles-pos.component");
var print_transaction_type_component_1 = require("../print/print-transaction-type/print-transaction-type.component");
var cancellation_types_automatic_component_1 = require("../cancellation-type/cancellation-types-automatic/cancellation-types-automatic.component");
var select_table_component_1 = require("app/components/table/select-table/select-table.component");
var send_email_component_1 = require("../send-email/send-email.component");
var add_article_component_1 = require("../article/article/add-article.component");
var select_shipment_method_component_1 = require("../shipment-method/select-shipment-method/select-shipment-method.component");
var select_company_component_1 = require("../company/select-company/select-company.component");
var tax_1 = require("../tax/tax");
var list_categories_pos_component_1 = require("../category/list-categories-pos/list-categories-pos.component");
var translate_me_1 = require("app/main/pipes/translate-me");
var select_price_list_component_1 = require("../price-list/select-price-list/select-price-list.component");
var AddSaleOrderComponent = /** @class */ (function () {
    function AddSaleOrderComponent(activeModal, alertConfig, _transactionService, _movementOfArticleService, _articleStockService, _tableService, _articleService, _router, _route, _modalService, _printerService, _userService, _taxService, _useOfCFDIService, _relationTypeService, _movementOfCancellationService, _cancellationTypeService, _transportService, _accountSeatService, _priceListService, _toastr, _configService, _structureService, _jsonDiffPipe, translatePipe) {
        this.activeModal = activeModal;
        this.alertConfig = alertConfig;
        this._transactionService = _transactionService;
        this._movementOfArticleService = _movementOfArticleService;
        this._articleStockService = _articleStockService;
        this._tableService = _tableService;
        this._articleService = _articleService;
        this._router = _router;
        this._route = _route;
        this._modalService = _modalService;
        this._printerService = _printerService;
        this._userService = _userService;
        this._taxService = _taxService;
        this._useOfCFDIService = _useOfCFDIService;
        this._relationTypeService = _relationTypeService;
        this._movementOfCancellationService = _movementOfCancellationService;
        this._cancellationTypeService = _cancellationTypeService;
        this._transportService = _transportService;
        this._accountSeatService = _accountSeatService;
        this._priceListService = _priceListService;
        this._toastr = _toastr;
        this._configService = _configService;
        this._structureService = _structureService;
        this._jsonDiffPipe = _jsonDiffPipe;
        this.translatePipe = translatePipe;
        this.optional = '';
        this.alertMessage = '';
        this.display = true;
        this.paymentAmount = 0.00;
        this.kitchenArticlesPrinted = 0;
        this.barArticlesPrinted = 0;
        this.voucherArticlesPrinted = 0;
        this.filterArticle = '';
        this.focusEvent = new core_1.EventEmitter();
        this.roundNumber = new round_number_pipe_1.RoundNumberPipe();
        this.areMovementsOfArticlesEmpty = true;
        this.apiURL = app_config_1.Config.apiURL;
        this.userCountry = 'AR';
        this.lastQuotation = 1;
        this.totalTaxesAmount = 0;
        this.totalTaxesBase = 0;
        this.isCancellationAutomatic = false;
        this.increasePrice = 0;
        this.lastIncreasePrice = 0;
        this.companyOld = false;
        this.quantity = 0;
        this.movementsOfCancellations = new Array();
        this.canceledTransactions = {
            typeId: null,
            origin: 0,
            letter: 'X',
            number: 0
        };
        this.initVariables();
        this.processParams();
    }
    AddSaleOrderComponent.prototype.initVariables = function () {
        this.transaction = new transaction_1.Transaction();
        this.transaction.type = new transaction_type_1.TransactionType();
        this.movementsOfArticles = new Array();
        this.printers = new Array();
        this.printersAux = new Array();
        this.barArticlesToPrint = new Array();
        this.kitchenArticlesToPrint = new Array();
        this.voucherArticlesToPrint = new Array();
        this.usesOfCFDI = new Array();
        this.relationTypes = new Array();
        this.currencies = new Array();
        this.cancellationTypes = new Array();
    };
    AddSaleOrderComponent.prototype.processParams = function () {
        var _this = this;
        this._route.queryParams.subscribe(function (params) {
            _this.transactionId = params['transactionId'];
            if (!_this.transactionId) {
                _this.backFinal();
            }
        });
    };
    AddSaleOrderComponent.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pathLocation;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.database = app_config_1.Config.database;
                        return [4 /*yield*/, this._configService.getConfig.subscribe(function (config) {
                                _this.config = config;
                                _this.userCountry = _this.config['country'];
                                if (_this.userCountry === 'MX') {
                                    _this.getUsesOfCFDI().then(function (usesOfCFDI) {
                                        if (usesOfCFDI) {
                                            _this.usesOfCFDI = usesOfCFDI;
                                        }
                                    });
                                    _this.getRelationTypes().then(function (relationTypes) {
                                        if (relationTypes) {
                                            _this.relationTypes = relationTypes;
                                        }
                                    });
                                }
                            })];
                    case 1:
                        _a.sent();
                        pathLocation = this._router.url.split('/');
                        this.userType = pathLocation[1];
                        this.posType = pathLocation[2];
                        this.initComponent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AddSaleOrderComponent.prototype.initComponent = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.loading = true;
                        if (!this.transactionId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getTransaction().then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!transaction) return [3 /*break*/, 7];
                                            this.transaction = transaction;
                                            if (!this.transaction.company && this.transaction.type.company) {
                                                this.transaction.company = this.transaction.type.company;
                                            }
                                            if (this.transaction &&
                                                this.transaction.company &&
                                                this.transaction.company.transport) {
                                                this.transaction.transport = this.transaction.company.transport;
                                            }
                                            if (!(this.transaction.state === transaction_1.TransactionState.Closed ||
                                                this.transaction.state === transaction_1.TransactionState.Canceled ||
                                                this.transaction.CAE)) return [3 /*break*/, 4];
                                            if (!(this.posType === 'resto' && this.transaction.table)) return [3 /*break*/, 2];
                                            this.transaction.table.employee = null;
                                            this.transaction.table.state = table_1.TableState.Available;
                                            return [4 /*yield*/, this.updateTable(this.transaction.table).then(function (table) {
                                                    if (table) {
                                                        _this.transaction.table = table;
                                                        _this.backFinal();
                                                    }
                                                })];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            this.backFinal();
                                            _a.label = 3;
                                        case 3: return [3 /*break*/, 7];
                                        case 4:
                                            this.transactionMovement = '' + this.transaction.type.transactionMovement;
                                            this.filtersTaxClassification = [tax_1.TaxClassification.Withholding, tax_1.TaxClassification.Perception];
                                            this.lastQuotation = this.transaction.quotation;
                                            if (this.userCountry === 'MX' &&
                                                this.transaction.type.defectUseOfCFDI &&
                                                !this.transaction.useOfCFDI) {
                                                this.transaction.useOfCFDI = this.transaction.type.defectUseOfCFDI;
                                            }
                                            return [4 /*yield*/, this.getCancellationTypes().then(function (cancellationTypes) {
                                                    if (cancellationTypes) {
                                                        _this.cancellationTypes = cancellationTypes;
                                                        _this.showButtonInformCancellation = true;
                                                        _this.showButtonCancelation = true;
                                                    }
                                                    else {
                                                        _this.showButtonCancelation = false;
                                                    }
                                                })];
                                        case 5:
                                            _a.sent();
                                            return [4 /*yield*/, this.getMovementsOfCancellations().then(function (movementsOfCancellations) {
                                                    if (movementsOfCancellations && movementsOfCancellations.length > 0) {
                                                        _this.movementsOfCancellations = movementsOfCancellations;
                                                        _this.showButtonCancelation = false;
                                                    }
                                                    else {
                                                        _this.showButtonCancelation = true;
                                                    }
                                                })];
                                        case 6:
                                            _a.sent();
                                            this.getTransports();
                                            this.getMovementsOfTransaction();
                                            _a.label = 7;
                                        case 7: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.loading = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    AddSaleOrderComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        setTimeout(function () {
            if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
                _this.focusEvent.emit(true);
            }
        }, 1000);
    };
    AddSaleOrderComponent.prototype.getPriceList = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._priceListService.getPriceList(id).subscribe(function (result) {
                if (!result.priceList) {
                    resolve(null);
                }
                else {
                    resolve(result.priceList);
                }
            }, function (error) {
                _this.showMessage(error._body, "danger", false);
                resolve(null);
            });
        });
    };
    AddSaleOrderComponent.prototype.getCancellationTypes = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._cancellationTypeService.getCancellationTypes({ "destination._id": 1, "destination.name": 1, "origin._id": 1, "origin.name": 1, "operationType": 1 }, // PROJECT
            { "destination._id": { $oid: _this.transaction.type._id }, "operationType": { "$ne": "D" } }, // MATCH
            { order: 1 }, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
            ).subscribe(function (result) {
                if (result && result.cancellationTypes && result.cancellationTypes.length > 0) {
                    resolve(result.cancellationTypes);
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
    AddSaleOrderComponent.prototype.getMovementsOfCancellations = function () {
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
    AddSaleOrderComponent.prototype.getUsesOfCFDI = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.loading = true;
            _this._useOfCFDIService.getUsesOfCFDI().subscribe(function (result) {
                _this.loading = false;
                if (!result.usesOfCFDI) {
                    resolve(null);
                }
                else {
                    resolve(result.usesOfCFDI);
                }
            }, function (error) {
                _this.loading = false;
                _this.showMessage(error._body, 'danger', false);
                resolve(null);
            });
        });
    };
    AddSaleOrderComponent.prototype.changeUseOfCFDI = function (useOfCFDI) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.transaction.useOfCFDI = useOfCFDI;
                        _a = this;
                        return [4 /*yield*/, this.updateTransaction()];
                    case 1:
                        _a.transaction = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AddSaleOrderComponent.prototype.changeTransport = function (transport) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (transport) {
                            this.transaction.transport = transport;
                        }
                        else {
                            this.transaction.transport = null;
                        }
                        return [4 /*yield*/, this.updateTransaction().then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (transaction) {
                                        this.transaction = transaction;
                                        this.lastQuotation = this.transaction.quotation;
                                    }
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AddSaleOrderComponent.prototype.getRelationTypes = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.loading = true;
            var query = 'sort="description":1';
            _this._relationTypeService.getRelationTypes(query).subscribe(function (result) {
                _this.loading = false;
                if (!result.relationTypes) {
                    resolve(null);
                }
                else {
                    resolve(result.relationTypes);
                }
            }, function (error) {
                _this.loading = false;
                _this.showMessage(error._body, 'danger', false);
                resolve(null);
            });
        });
    };
    AddSaleOrderComponent.prototype.getTransaction = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.loading = true;
            _this._transactionService.getTransaction(_this.transactionId).subscribe(function (result) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.loading = false;
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
                _this.loading = false;
                _this.showMessage(error._body, 'danger', false);
                resolve(null);
            });
        });
    };
    AddSaleOrderComponent.prototype.updateTransaction = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.transaction.exempt = _this.roundNumber.transform(_this.transaction.exempt);
            _this.transaction.discountAmount = _this.roundNumber.transform(_this.transaction.discountAmount, 6);
            _this.transaction.totalPrice = _this.roundNumber.transform(_this.transaction.totalPrice);
            _this._transactionService.updateTransaction(_this.transaction).subscribe(function (result) {
                if (!result.transaction) {
                    if (result.message && result.message !== '')
                        _this.showMessage(result.message, 'info', true);
                    reject(result.message);
                }
                else {
                    resolve(result.transaction);
                }
            }, function (error) {
                _this.showMessage(error._body, 'danger', false);
                reject(error);
            });
        });
    };
    AddSaleOrderComponent.prototype.saveMovementsOfCancellations = function (movementsOfCancellations) {
        var _this = this;
        for (var _i = 0, movementsOfCancellations_1 = movementsOfCancellations; _i < movementsOfCancellations_1.length; _i++) {
            var mov = movementsOfCancellations_1[_i];
            var transOrigin = new transaction_1.Transaction();
            transOrigin._id = mov.transactionOrigin._id;
            var transDestino = new transaction_1.Transaction();
            transDestino._id = mov.transactionDestination._id;
            mov.transactionOrigin = transOrigin;
            mov.transactionDestination = transDestino;
        }
        return new Promise(function (resolve, reject) {
            _this.loading = true;
            _this._movementOfCancellationService.saveMovementsOfCancellations(movementsOfCancellations).subscribe(function (result) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.loading = false;
                    if (!result.movementsOfCancellations) {
                        if (result.message && result.message !== '')
                            this.showMessage(result.message, 'info', true);
                        resolve(null);
                    }
                    else {
                        resolve(result.movementsOfCancellations);
                    }
                    return [2 /*return*/];
                });
            }); }, function (error) {
                _this.loading = false;
                _this.showMessage(error._body, 'danger', false);
                resolve(null);
            });
        });
    };
    AddSaleOrderComponent.prototype.daleteMovementsOfCancellations = function (query) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.loading = true;
            _this._movementOfCancellationService.deleteMovementsOfCancellations(query).subscribe(function (result) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.loading = false;
                    if (!result.movementsOfCancellations) {
                        if (result.message && result.message !== '')
                            this.showMessage(result.message, 'info', true);
                        resolve(null);
                    }
                    else {
                        resolve(result.movementsOfCancellations);
                    }
                    return [2 /*return*/];
                });
            }); }, function (error) {
                _this.loading = false;
                _this.showMessage(error._body, 'danger', false);
                resolve(null);
            });
        });
    };
    AddSaleOrderComponent.prototype.changeCurrency = function (currency) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, currency_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.transaction.currency = currency;
                        if (this.config['currency'] && this.transaction.currency._id !== this.config['currency']._id) {
                            for (_i = 0, _a = this.currencies; _i < _a.length; _i++) {
                                currency_1 = _a[_i];
                                if (currency_1._id !== this.config['currency']._id) {
                                    this.transaction.quotation = currency_1.quotation;
                                }
                            }
                        }
                        else {
                            if (!this.transaction.quotation) {
                                this.transaction.quotation = currency.quotation;
                            }
                        }
                        return [4 /*yield*/, this.updateTransaction().then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (transaction) {
                                        this.transaction = transaction;
                                        this.lastQuotation = this.transaction.quotation;
                                    }
                                    else {
                                        this.hideMessage();
                                        this.getMovementsOfTransaction();
                                    }
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AddSaleOrderComponent.prototype.updateTable = function (table) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.loading = true;
            _this._tableService.updateTable(table).subscribe(function (result) {
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
                _this.loading = false;
                _this.showMessage(error._body, 'danger', false);
                reject(null);
            });
        });
    };
    AddSaleOrderComponent.prototype.getMovementsOfTransaction = function () {
        var _this = this;
        this.hideMessage();
        this.loading = true;
        var query = 'where="transaction":"' + this.transaction._id + '"';
        this._movementOfArticleService.getMovementsOfArticles(query).subscribe(function (result) {
            if (!result.movementsOfArticles) {
                _this.areMovementsOfArticlesEmpty = true;
                _this.movementsOfArticles = new Array();
                _this.lastMovementOfArticle = null;
                _this.updatePrices();
            }
            else {
                _this.areMovementsOfArticlesEmpty = false;
                _this.movementsOfArticles = result.movementsOfArticles;
                _this.lastMovementOfArticle = _this.movementsOfArticles[_this.movementsOfArticles.length - 1];
                _this.containerMovementsOfArticles.nativeElement.scrollTop = _this.containerMovementsOfArticles.nativeElement.scrollHeight;
                _this.updateQuantity();
                _this.updatePrices();
            }
            _this.loading = false;
        }, function (error) {
            _this.showMessage(error._body, 'danger', false);
            _this.loading = false;
        });
    };
    AddSaleOrderComponent.prototype.updateQuantity = function () {
        this.quantity = 0;
        if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
            for (var _i = 0, _a = this.movementsOfArticles; _i < _a.length; _i++) {
                var movementOfArticle = _a[_i];
                if (!movementOfArticle.movementParent) {
                    this.quantity += movementOfArticle.amount;
                }
            }
        }
    };
    AddSaleOrderComponent.prototype.addItem = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var itemData, child, _a, movementOfArticle_1, query, query, movsArticle, _i, child_1, movArticle, stock, _b, movementOfArticle;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(event && event['parent'])) return [3 /*break*/, 32];
                        itemData = event['parent'];
                        child = event['child'];
                        this.showCategories();
                        if (!(itemData && itemData.article && itemData.article._id)) return [3 /*break*/, 30];
                        _a = !itemData.article.containsVariants && !itemData.article.allowMeasure;
                        if (!_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getStructure(itemData.article._id)];
                    case 1:
                        _a = !(_c.sent());
                        _c.label = 2;
                    case 2:
                        if (!_a) return [3 /*break*/, 28];
                        if (!(!itemData.article.isWeigth || this.transaction.type.stockMovement == transaction_type_1.StockMovement.Inventory)) return [3 /*break*/, 7];
                        if (!(this.filterArticle && this.filterArticle !== '' && this.filterArticle.slice(0, 1) === '*')) return [3 /*break*/, 5];
                        if (!this.lastMovementOfArticle) return [3 /*break*/, 4];
                        query = "where=\"_id\":\"" + this.lastMovementOfArticle._id + "\"";
                        return [4 /*yield*/, this.getMovementsOfArticles(query).then(function (movementsOfArticles) {
                                if (movementsOfArticles && movementsOfArticles.length > 0) {
                                    movementOfArticle_1 = movementsOfArticles[0];
                                }
                            })];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        if (!(this.transaction.type.stockMovement == transaction_type_1.StockMovement.Inventory)) return [3 /*break*/, 7];
                        query = "where=\"transaction\":\"" + this.transactionId + "\",\"operationType\":{\"$ne\":\"D\"},\"article\":\"" + itemData.article._id + "\"";
                        return [4 /*yield*/, this.getMovementsOfArticles(query).then(function (movementsOfArticles) {
                                if (movementsOfArticles && movementsOfArticles.length > 0) {
                                    movementOfArticle_1 = movementsOfArticles[0];
                                }
                            })];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        if (!!movementOfArticle_1) return [3 /*break*/, 19];
                        movementOfArticle_1 = itemData;
                        movementOfArticle_1._id = '';
                        movementOfArticle_1.transaction = this.transaction;
                        movementOfArticle_1.modifyStock = this.transaction.type.modifyStock;
                        if (this.transaction.type.stockMovement) {
                            movementOfArticle_1.stockMovement = this.transaction.type.stockMovement.toString();
                        }
                        movementOfArticle_1.printed = 0;
                        if (!(child && child.length === 0)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.isValidMovementOfArticle(movementOfArticle_1)];
                    case 8:
                        if (!_c.sent()) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.saveMovementOfArticle(movementOfArticle_1).then(function (movementOfArticle) {
                                if (movementOfArticle) {
                                    _this.getMovementsOfTransaction();
                                }
                            })];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10: return [3 /*break*/, 18];
                    case 11:
                        movsArticle = new Array();
                        _i = 0, child_1 = child;
                        _c.label = 12;
                    case 12:
                        if (!(_i < child_1.length)) return [3 /*break*/, 16];
                        movArticle = child_1[_i];
                        return [4 /*yield*/, this.getUtilization(movementOfArticle_1.article._id, movArticle.article._id)];
                    case 13:
                        stock = _c.sent();
                        return [4 /*yield*/, this.isValidMovementOfArticle(movArticle, stock)];
                    case 14:
                        if (_c.sent()) {
                            movsArticle.push(movArticle);
                        }
                        _c.label = 15;
                    case 15:
                        _i++;
                        return [3 /*break*/, 12];
                    case 16:
                        if (!(movsArticle.length === child.length)) return [3 /*break*/, 18];
                        return [4 /*yield*/, this.saveMovementOfArticle(movementOfArticle_1).then(function (movementOfArticle) { return __awaiter(_this, void 0, void 0, function () {
                                var _i, child_2, movArticle;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!movementOfArticle) return [3 /*break*/, 2];
                                            movsArticle = new Array();
                                            for (_i = 0, child_2 = child; _i < child_2.length; _i++) {
                                                movArticle = child_2[_i];
                                                movArticle.movementParent = movementOfArticle;
                                                movsArticle.push(movArticle);
                                            }
                                            return [4 /*yield*/, this.saveMovementsOfArticles(movsArticle).then(function (result) {
                                                    if (result) {
                                                        _this.getMovementsOfTransaction();
                                                    }
                                                    else {
                                                        _this.showMessage("No se pudo crear la estructura de producto", 'info', false);
                                                    }
                                                })];
                                        case 1:
                                            _a.sent();
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 17:
                        _c.sent();
                        _c.label = 18;
                    case 18: return [3 /*break*/, 27];
                    case 19:
                        if (this.filterArticle && this.filterArticle !== '' && this.filterArticle.slice(0, 1) === '*') {
                            movementOfArticle_1.amount = itemData.amount;
                            this.filterArticle = '';
                        }
                        else {
                            movementOfArticle_1.amount += 1;
                        }
                        return [4 /*yield*/, this.isValidMovementOfArticle(movementOfArticle_1)];
                    case 20:
                        if (!_c.sent()) return [3 /*break*/, 26];
                        if (!(this.transaction.type.transactionMovement === transaction_type_1.TransactionMovement.Sale)) return [3 /*break*/, 23];
                        _b = this.updateMovementOfArticle;
                        return [4 /*yield*/, this.recalculateSalePrice(movementOfArticle_1)];
                    case 21: return [4 /*yield*/, _b.apply(this, [_c.sent()]).then(function (movementOfArticle) {
                            if (movementOfArticle) {
                                _this.getMovementsOfTransaction();
                            }
                        })];
                    case 22:
                        _c.sent();
                        return [3 /*break*/, 25];
                    case 23: return [4 /*yield*/, this.updateMovementOfArticle(this.recalculateCostPrice(movementOfArticle_1)).then(function (movementOfArticle) {
                            if (movementOfArticle) {
                                _this.getMovementsOfTransaction();
                            }
                        })];
                    case 24:
                        _c.sent();
                        _c.label = 25;
                    case 25: return [3 /*break*/, 27];
                    case 26:
                        movementOfArticle_1.amount -= 1;
                        _c.label = 27;
                    case 27: return [3 /*break*/, 29];
                    case 28:
                        movementOfArticle = void 0;
                        movementOfArticle = itemData;
                        movementOfArticle._id = '';
                        movementOfArticle.transaction = this.transaction;
                        movementOfArticle.modifyStock = this.transaction.type.modifyStock;
                        if (this.transaction.type.stockMovement) {
                            movementOfArticle.stockMovement = this.transaction.type.stockMovement.toString();
                        }
                        movementOfArticle.printed = 0;
                        movementOfArticle.amount = 1;
                        this.openModal("movement_of_article", movementOfArticle);
                        _c.label = 29;
                    case 29: return [3 /*break*/, 31];
                    case 30:
                        this.showToast(null, 'danger', 'Error al agregar el artículo, por favor inténtelo de nuevo.');
                        _c.label = 31;
                    case 31: return [3 /*break*/, 33];
                    case 32:
                        this.showArticles();
                        _c.label = 33;
                    case 33: return [2 /*return*/];
                }
            });
        });
    };
    AddSaleOrderComponent.prototype.getStructure = function (articleId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.loading = true;
            var match = "{\n\t\t\t\"operationType\": { \"$ne\": \"D\" },\n\t\t\t\"parent._id\": { \"$oid\" : \"" + articleId + "\"},\n\t\t\t\"optional\" : true,\n\t\t\t\"child.operationType\": { \"$ne\": \"D\" }\n\t\t  }";
            match = JSON.parse(match);
            var project = {
                "_id": 1,
                "parent._id": 1,
                "parent.description": 1,
                "child._id": 1,
                "child.description": 1,
                "child.operationType": 1,
                "optional": 1,
                "utilization": 1,
                operationType: 1
            };
            var group = {
                _id: null,
                count: { $sum: 1 },
                structures: { $push: "$$ROOT" }
            };
            _this._structureService.getStructures(project, // PROJECT
            match, // MATCH
            {}, // SORT
            group, // GROUP
            0, // LIMIT
            0 // SKIP
            ).subscribe(function (result) {
                _this.loading = false;
                if (result && result[0] && result[0].structures) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            }, function (error) {
                _this.showMessage(error._body, 'danger', false);
                _this.loading = false;
                resolve(false);
            });
        });
    };
    AddSaleOrderComponent.prototype.getUtilization = function (parent, child) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.loading = true;
            var match = "{\n\t\t\t\"operationType\": { \"$ne\": \"D\" },\n\t\t\t\"parent._id\": { \"$oid\" : \"" + parent + "\"},\n\t\t\t\"child._id\" : { \"$oid\" : \"" + child + "\"},\n\t\t\t\"child.operationType\": { \"$ne\": \"D\" },\n\t\t\t\"utilization\" : \"Venta\"\n\t\t  }";
            match = JSON.parse(match);
            var project = {
                "_id": 1,
                "parent._id": 1,
                "parent.description": 1,
                "child._id": 1,
                "child.description": 1,
                "child.operationType": 1,
                "optional": 1,
                "utilization": 1,
                operationType: 1
            };
            var group = {
                _id: null,
                count: { $sum: 1 },
                structures: { $push: "$$ROOT" }
            };
            _this._structureService.getStructures(project, // PROJECT
            match, // MATCH
            {}, // SORT
            group, // GROUP
            0, // LIMIT
            0 // SKIP
            ).subscribe(function (result) {
                _this.loading = false;
                if (result && result[0] && result[0].structures) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            }, function (error) {
                _this.showMessage(error._body, 'danger', false);
                _this.loading = false;
                resolve(false);
            });
        });
    };
    AddSaleOrderComponent.prototype.getMovementsOfArticles = function (query) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.loading = true;
            _this._movementOfArticleService.getMovementsOfArticles(query).subscribe(function (result) {
                _this.loading = false;
                if (!result.movementsOfArticles) {
                    resolve(null);
                }
                else {
                    resolve(result.movementsOfArticles);
                }
            }, function (error) {
                _this.loading = false;
                _this.showMessage(error._body, 'danger', false);
                resolve(null);
            });
        });
    };
    AddSaleOrderComponent.prototype.saveMovementOfArticle = function (movementOfArticle) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.loading = true;
            movementOfArticle.basePrice = _this.roundNumber.transform(movementOfArticle.basePrice);
            movementOfArticle.costPrice = _this.roundNumber.transform(movementOfArticle.costPrice);
            movementOfArticle.salePrice = _this.roundNumber.transform(movementOfArticle.salePrice);
            _this._movementOfArticleService.saveMovementOfArticle(movementOfArticle).subscribe(function (result) {
                _this.loading = false;
                if (!result.movementOfArticle) {
                    if (result.message && result.message !== '')
                        _this.showMessage(result.message, 'info', true);
                    resolve(null);
                }
                else {
                    _this.hideMessage();
                    movementOfArticle = result.movementOfArticle;
                    resolve(movementOfArticle);
                }
            }, function (error) {
                _this.loading = false;
                _this.showMessage(error._body, 'danger', false);
                resolve(null);
            });
        });
    };
    AddSaleOrderComponent.prototype.saveMovementsOfArticles = function (movementsOfArticles) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var movsArticles, _i, movementsOfArticles_1, movArticle;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.loading = true;
                        movsArticles = new Array();
                        _i = 0, movementsOfArticles_1 = movementsOfArticles;
                        _a.label = 1;
                    case 1:
                        if (!(_i < movementsOfArticles_1.length)) return [3 /*break*/, 4];
                        movArticle = movementsOfArticles_1[_i];
                        movArticle.basePrice = 0;
                        movArticle.costPrice = 0;
                        movArticle.salePrice = 0;
                        movArticle.unitPrice = 0;
                        movArticle.status = movement_of_article_1.MovementOfArticleStatus.Ready;
                        return [4 /*yield*/, this.recalculateSalePrice(movArticle)];
                    case 2:
                        if (_a.sent()) {
                            movsArticles.push(movArticle);
                        }
                        else {
                            resolve(false);
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this._movementOfArticleService.saveMovementsOfArticles(movsArticles).subscribe(function (result) {
                            _this.loading = false;
                            if (!result.movementsOfArticles) {
                                if (result.message && result.message !== '')
                                    _this.showMessage(result.message, 'info', true);
                                resolve(false);
                            }
                            else {
                                _this.hideMessage();
                                resolve(true);
                            }
                        }, function (error) {
                            _this.loading = false;
                            _this.showMessage(error._body, 'danger', false);
                            resolve(false);
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    };
    AddSaleOrderComponent.prototype.isValidMovementOfArticle = function (movementOfArticle, verificaStock) {
        if (verificaStock === void 0) { verificaStock = true; }
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var articleStocks, articleStock, realStock, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    if (this.transaction.type &&
                                        this.transaction.type.transactionMovement === transaction_type_1.TransactionMovement.Sale &&
                                        movementOfArticle.article &&
                                        !movementOfArticle.article.allowSale)
                                        throw new Error("El producto " + movementOfArticle.article.description + " (" + movementOfArticle.article.code + ") no esta habilitado para la venta");
                                    if (this.transaction.type &&
                                        this.transaction.type.transactionMovement === transaction_type_1.TransactionMovement.Purchase &&
                                        movementOfArticle.article &&
                                        !movementOfArticle.article.allowPurchase)
                                        throw new Error("El producto " + movementOfArticle.article.description + " (" + movementOfArticle.article.code + ") no esta habilitado para la compra");
                                    if (!(verificaStock &&
                                        movementOfArticle.article &&
                                        this.config['modules'].stock &&
                                        this.transaction.type &&
                                        this.transaction.type.modifyStock &&
                                        (this.transaction.type.stockMovement === transaction_type_1.StockMovement.Outflows || this.transaction.type.stockMovement === transaction_type_1.StockMovement.Transfer) &&
                                        !movementOfArticle.article.allowSaleWithoutStock)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, this.getArticleStock(movementOfArticle)];
                                case 1:
                                    articleStocks = _a.sent();
                                    articleStock = void 0;
                                    if (articleStocks && articleStocks.length > 0)
                                        articleStock = articleStocks[0];
                                    if (!articleStock || (movementOfArticle.amount + movementOfArticle.quantityForStock) > articleStock.realStock) {
                                        if ((this.transaction.type.stockMovement === transaction_type_1.StockMovement.Transfer && movementOfArticle.deposit && movementOfArticle.deposit._id.toString() === this.transaction.depositDestination._id.toString())) {
                                            realStock = 0;
                                            if (articleStock)
                                                realStock = articleStock.realStock;
                                            throw new Error("No tiene el stock suficiente del producto " + movementOfArticle.article.description + " (" + movementOfArticle.article.code + "). Stock Actual: " + realStock);
                                        }
                                    }
                                    _a.label = 2;
                                case 2:
                                    resolve(true);
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_1 = _a.sent();
                                    this.showToast(error_1);
                                    resolve(false);
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    AddSaleOrderComponent.prototype.getArticleStock = function (movementOfArticle) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var depositID;
            var query;
            if (movementOfArticle.article.deposits && movementOfArticle.article.deposits.length > 0) {
                movementOfArticle.article.deposits.forEach(function (element) {
                    if (element.deposit.branch._id === _this.transaction.branchOrigin._id) {
                        depositID = element.deposit._id;
                    }
                });
            }
            if (depositID) {
                query = "where= \"article\": \"" + movementOfArticle.article._id + "\",\n                        \"branch\": \"" + _this.transaction.branchOrigin._id + "\",\n                        \"deposit\": \"" + depositID + "\"";
            }
            else {
                query = "where= \"article\": \"" + movementOfArticle.article._id + "\",\n                        \"branch\": \"" + _this.transaction.branchOrigin._id + "\",\n                        \"deposit\": \"" + _this.transaction.depositOrigin._id + "\"";
            }
            _this._articleStockService.getArticleStocks(query).subscribe(function (result) {
                if (result.articleStocks)
                    resolve(result.articleStocks);
                else
                    reject(result);
            }, function (error) { return reject(error); });
        });
    };
    AddSaleOrderComponent.prototype.recalculateCostPrice = function (movementOfArticle) {
        var quotation = 1;
        if (this.transaction.quotation) {
            quotation = this.transaction.quotation;
        }
        movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.unitPrice + movementOfArticle.transactionDiscountAmount);
        if (movementOfArticle.article &&
            movementOfArticle.article.currency &&
            this.config['currency'] &&
            this.config['currency']._id !== movementOfArticle.article.currency._id) {
            movementOfArticle.unitPrice = this.roundNumber.transform((movementOfArticle.unitPrice / this.lastQuotation) * quotation);
        }
        movementOfArticle.transactionDiscountAmount = this.roundNumber.transform((movementOfArticle.unitPrice * this.transaction.discountPercent / 100), 6);
        movementOfArticle.unitPrice -= this.roundNumber.transform(movementOfArticle.transactionDiscountAmount);
        movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
        movementOfArticle.markupPrice = 0.00;
        movementOfArticle.markupPercentage = 0.00;
        var taxedAmount = movementOfArticle.basePrice;
        movementOfArticle.costPrice = 0;
        var fields = new Array();
        if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
            for (var _i = 0, _a = movementOfArticle.otherFields; _i < _a.length; _i++) {
                var field = _a[_i];
                if (field.articleField.datatype === article_field_1.ArticleFieldType.Percentage || field.articleField.datatype === article_field_1.ArticleFieldType.Number) {
                    if (field.articleField.datatype === article_field_1.ArticleFieldType.Percentage) {
                        field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value) / 100));
                    }
                    else if (field.articleField.datatype === article_field_1.ArticleFieldType.Number) {
                        field.amount = parseFloat(field.value);
                    }
                    if (field.articleField.modifyVAT) {
                        taxedAmount += field.amount;
                    }
                    else {
                        movementOfArticle.costPrice += field.amount;
                    }
                }
                fields.push(field);
            }
        }
        movementOfArticle.otherFields = fields;
        if (this.transaction.type.requestTaxes) {
            if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
                var taxes = new Array();
                for (var _b = 0, _c = movementOfArticle.taxes; _b < _c.length; _b++) {
                    var articleTax = _c[_b];
                    if (articleTax.tax.taxBase === tax_1.TaxBase.Neto) {
                        articleTax.taxBase = this.roundNumber.transform(taxedAmount);
                    }
                    else {
                        articleTax.taxBase = 0;
                    }
                    if (articleTax.percentage === 0) {
                        for (var _d = 0, _e = movementOfArticle.article.taxes; _d < _e.length; _d++) {
                            var artTax = _e[_d];
                            if (artTax.tax._id === articleTax.tax._id) {
                                articleTax.taxAmount = this.roundNumber.transform(artTax.taxAmount * movementOfArticle.amount);
                            }
                        }
                    }
                    else {
                        articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
                    }
                    taxes.push(articleTax);
                    movementOfArticle.costPrice += this.roundNumber.transform(articleTax.taxAmount);
                }
                movementOfArticle.taxes = taxes;
            }
        }
        movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
        movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice);
        movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.costPrice + movementOfArticle.roundingAmount);
        return movementOfArticle;
    };
    AddSaleOrderComponent.prototype.recalculateSalePrice = function (movementOfArticle) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var quotation, fields, _i, _a, field, increasePrice_1, increasePrice_2, taxes, impInt, _b, _c, taxAux, _d, _e, taxAux, tax, _f, _g, artTax;
            var _this = this;
            return __generator(this, function (_h) {
                this.loading = true;
                quotation = 1;
                if (this.transaction.quotation) {
                    quotation = this.transaction.quotation;
                }
                if (movementOfArticle.article) {
                    movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.article.basePrice * movementOfArticle.amount);
                    if (movementOfArticle.article.currency &&
                        this.config['currency'] &&
                        this.config['currency']._id !== movementOfArticle.article.currency._id) {
                        movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice * quotation);
                    }
                }
                fields = new Array();
                if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
                    for (_i = 0, _a = movementOfArticle.otherFields; _i < _a.length; _i++) {
                        field = _a[_i];
                        if (field.articleField.datatype === article_field_1.ArticleFieldType.Percentage || field.articleField.datatype === article_field_1.ArticleFieldType.Number) {
                            if (field.articleField.datatype === article_field_1.ArticleFieldType.Percentage) {
                                field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value) / 100));
                            }
                            else if (field.articleField.datatype === article_field_1.ArticleFieldType.Number) {
                                field.amount = parseFloat(field.value);
                            }
                        }
                        fields.push(field);
                    }
                }
                movementOfArticle.otherFields = fields;
                if (movementOfArticle.article) {
                    movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.article.costPrice * movementOfArticle.amount);
                    if (movementOfArticle.article.currency &&
                        this.config['currency'] &&
                        this.config['currency']._id !== movementOfArticle.article.currency._id) {
                        movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice * quotation);
                    }
                }
                movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.unitPrice + movementOfArticle.transactionDiscountAmount + movementOfArticle.discountAmount);
                if (movementOfArticle.article &&
                    movementOfArticle.article.currency &&
                    this.config['currency'] &&
                    this.config['currency']._id !== movementOfArticle.article.currency._id) {
                    movementOfArticle.unitPrice = this.roundNumber.transform((movementOfArticle.unitPrice / this.lastQuotation) * quotation);
                }
                if (movementOfArticle.article && this.priceList) {
                    increasePrice_1 = 0;
                    if (this.priceList.allowSpecialRules && this.priceList.rules && this.priceList.rules.length > 0) {
                        this.priceList.rules.forEach(function (rule) {
                            if (rule) {
                                if (rule.category && movementOfArticle.category && rule.make && movementOfArticle.make && rule.category._id === movementOfArticle.category._id && rule.make._id === movementOfArticle.make._id) {
                                    increasePrice_1 = _this.roundNumber.transform(rule.percentage + _this.priceList.percentage);
                                }
                                if (rule.make && movementOfArticle.make && rule.category == null && rule.make._id === movementOfArticle.make._id) {
                                    increasePrice_1 = _this.roundNumber.transform(rule.percentage + _this.priceList.percentage);
                                }
                                if (rule.category && movementOfArticle.category && rule.make == null && rule.category._id === movementOfArticle.category._id) {
                                    increasePrice_1 = _this.roundNumber.transform(rule.percentage + _this.priceList.percentage);
                                }
                            }
                        });
                        if (increasePrice_1 === 0) {
                            increasePrice_1 = this.roundNumber.transform(this.priceList.percentage);
                        }
                    }
                    else {
                        increasePrice_1 = this.roundNumber.transform(this.priceList.percentage);
                    }
                    if (this.priceList.exceptions && this.priceList.exceptions.length > 0) {
                        this.priceList.exceptions.forEach(function (exception) {
                            if (exception) {
                                if (exception.article._id === movementOfArticle.article._id) {
                                    increasePrice_1 = _this.roundNumber.transform(exception.percentage);
                                }
                            }
                        });
                    }
                    if (increasePrice_1 != 0) {
                        movementOfArticle.unitPrice = this.roundNumber.transform((movementOfArticle.unitPrice * 100) / (100 + increasePrice_1));
                    }
                }
                if (movementOfArticle.article && this.newPriceList) {
                    increasePrice_2 = 0;
                    if (this.newPriceList.allowSpecialRules && this.newPriceList.rules && this.newPriceList.rules.length > 0) {
                        this.newPriceList.rules.forEach(function (rule) {
                            if (rule) {
                                if (rule.category && movementOfArticle.category && rule.make && movementOfArticle.make && rule.category._id === movementOfArticle.category._id && rule.make._id === movementOfArticle.make._id) {
                                    increasePrice_2 = _this.roundNumber.transform(rule.percentage + _this.newPriceList.percentage);
                                }
                                if (rule.make && movementOfArticle.make && rule.category == null && rule.make._id === movementOfArticle.make._id) {
                                    increasePrice_2 = _this.roundNumber.transform(rule.percentage + _this.newPriceList.percentage);
                                }
                                if (rule.category && movementOfArticle.category && rule.make == null && rule.category._id === movementOfArticle.category._id) {
                                    increasePrice_2 = _this.roundNumber.transform(rule.percentage + _this.newPriceList.percentage);
                                }
                            }
                        });
                        if (increasePrice_2 === 0) {
                            increasePrice_2 = this.roundNumber.transform(this.newPriceList.percentage);
                        }
                    }
                    else {
                        increasePrice_2 = this.roundNumber.transform(this.newPriceList.percentage);
                    }
                    if (this.newPriceList.exceptions && this.newPriceList.exceptions.length > 0) {
                        this.newPriceList.exceptions.forEach(function (exception) {
                            if (exception) {
                                if (exception.article._id === movementOfArticle.article._id) {
                                    increasePrice_2 = _this.roundNumber.transform(exception.percentage);
                                }
                            }
                        });
                    }
                    if (increasePrice_2 != 0) {
                        movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.unitPrice + (movementOfArticle.unitPrice * increasePrice_2 / 100));
                    }
                }
                movementOfArticle.transactionDiscountAmount = this.roundNumber.transform((movementOfArticle.unitPrice * this.transaction.discountPercent / 100), 6);
                movementOfArticle.unitPrice -= this.roundNumber.transform(movementOfArticle.transactionDiscountAmount);
                movementOfArticle.unitPrice -= this.roundNumber.transform(movementOfArticle.discountAmount);
                movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
                movementOfArticle.markupPrice = this.roundNumber.transform(movementOfArticle.salePrice - movementOfArticle.costPrice);
                movementOfArticle.markupPercentage = this.roundNumber.transform((movementOfArticle.markupPrice / movementOfArticle.costPrice * 100), 3);
                if (this.transaction.type.requestTaxes) {
                    taxes = new Array();
                    if (movementOfArticle.taxes) {
                        impInt = 0;
                        if (movementOfArticle.article) {
                            for (_b = 0, _c = movementOfArticle.article.taxes; _b < _c.length; _b++) {
                                taxAux = _c[_b];
                                if (taxAux.percentage === 0) {
                                    impInt = this.roundNumber.transform(taxAux.taxAmount * movementOfArticle.amount, 4);
                                }
                            }
                        }
                        for (_d = 0, _e = movementOfArticle.taxes; _d < _e.length; _d++) {
                            taxAux = _e[_d];
                            tax = new taxes_1.Taxes();
                            tax.tax = taxAux.tax;
                            tax.percentage = this.roundNumber.transform(taxAux.percentage);
                            if (tax.tax.taxBase == tax_1.TaxBase.Neto) {
                                tax.taxBase = this.roundNumber.transform((movementOfArticle.salePrice - impInt) / ((tax.percentage / 100) + 1), 4);
                            }
                            if (taxAux.percentage === 0) {
                                for (_f = 0, _g = movementOfArticle.article.taxes; _f < _g.length; _f++) {
                                    artTax = _g[_f];
                                    if (artTax.tax._id === tax.tax._id) {
                                        tax.taxAmount = this.roundNumber.transform((artTax.taxAmount * movementOfArticle.amount), 4);
                                    }
                                }
                            }
                            else {
                                tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage / 100), 4);
                            }
                            taxes.push(tax);
                        }
                    }
                    movementOfArticle.taxes = taxes;
                }
                this.loading = false;
                //guardamos la lista con la que se calculo el precio
                if (this.transaction.company && this.transaction.company.priceList) {
                    this.transaction.priceList = this.transaction.company.priceList;
                }
                resolve(movementOfArticle);
                return [2 /*return*/];
            });
        }); });
    };
    AddSaleOrderComponent.prototype.getMovementOfArticleByArticle = function (articleId) {
        var movementOfArticle;
        if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
            for (var _i = 0, _a = this.movementsOfArticles; _i < _a.length; _i++) {
                var movementOfArticleAux = _a[_i];
                if (movementOfArticleAux.article && movementOfArticleAux.article._id === articleId) {
                    movementOfArticle = movementOfArticleAux;
                }
            }
        }
        return movementOfArticle;
    };
    AddSaleOrderComponent.prototype.updateMovementOfArticle = function (movementOfArticle) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.loading = true;
                movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice);
                movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice);
                movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.salePrice);
                // LIMPIAR UN POCO LA RELACIÓN
                movementOfArticle.transaction = new transaction_1.Transaction();
                movementOfArticle.transaction._id = this.transaction._id;
                // FIN DE LIMPIADO
                this._movementOfArticleService.updateMovementOfArticle(movementOfArticle).subscribe(function (result) {
                    _this.loading = false;
                    if (!result.movementOfArticle) {
                        if (result.message && result.message !== '')
                            _this.showMessage(result.message, 'info', true);
                        reject(result.message);
                    }
                    else {
                        _this.containerMovementsOfArticles.nativeElement.scrollTop = _this.containerMovementsOfArticles.nativeElement.scrollHeight;
                        resolve(result.movementOfArticle);
                    }
                }, function (error) {
                    _this.loading = false;
                    _this.showMessage(error._body, 'danger', false);
                    reject(error);
                });
                return [2 /*return*/];
            });
        }); });
    };
    AddSaleOrderComponent.prototype.addTransactionTaxes = function (taxes) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.transaction.taxes = taxes;
                this.updatePrices();
                return [2 /*return*/];
            });
        });
    };
    AddSaleOrderComponent.prototype.updatePrices = function (discountPercent) {
        return __awaiter(this, void 0, void 0, function () {
            var totalPriceAux, discountAmountAux, isUpdateValid, _i, _a, movementOfArticle, _b, _c, taxes, oldMovementOfArticle, result, error_2;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.loading = true;
                        totalPriceAux = 0;
                        discountAmountAux = 0;
                        this.transaction.discountPercent = 0;
                        if (discountPercent !== undefined)
                            this.transaction.discountPercent = this.roundNumber.transform(discountPercent, 6);
                        if (this.transaction.company && this.transaction.company.discount > 0 && this.transaction.type.allowCompanyDiscount)
                            this.transaction.discountPercent += this.transaction.company.discount;
                        if (this.transaction.company && this.transaction.company.group && this.transaction.company.group.discount > 0 && this.transaction.type.allowCompanyDiscount)
                            this.transaction.discountPercent += this.transaction.company.group.discount;
                        isUpdateValid = true;
                        if (!(this.movementsOfArticles && this.movementsOfArticles.length > 0)) return [3 /*break*/, 10];
                        _i = 0, _a = this.movementsOfArticles;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 9];
                        movementOfArticle = _a[_i];
                        // BORRAMOS TAXES ID PARA COMPARAR
                        for (_b = 0, _c = movementOfArticle.taxes; _b < _c.length; _b++) {
                            taxes = _c[_b];
                            delete taxes._id;
                        }
                        oldMovementOfArticle = {};
                        oldMovementOfArticle = Object.assign(oldMovementOfArticle, movementOfArticle);
                        if (!!movementOfArticle.movementParent) return [3 /*break*/, 8];
                        this.transaction.discountPercent = this.roundNumber.transform(this.transaction.discountPercent, 6);
                        if (!(this.transaction.type.transactionMovement === transaction_type_1.TransactionMovement.Sale)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.recalculateSalePrice(movementOfArticle)];
                    case 2:
                        movementOfArticle = _d.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        movementOfArticle = this.recalculateCostPrice(movementOfArticle);
                        _d.label = 4;
                    case 4:
                        totalPriceAux += this.roundNumber.transform(movementOfArticle.salePrice);
                        discountAmountAux += this.roundNumber.transform(movementOfArticle.transactionDiscountAmount * movementOfArticle.amount, 6);
                        if (!(this._jsonDiffPipe.transform(oldMovementOfArticle, movementOfArticle) ||
                            (oldMovementOfArticle['taxes'] && oldMovementOfArticle['taxes'].length > 0 &&
                                movementOfArticle['taxes'] && movementOfArticle['taxes'].length > 0 &&
                                oldMovementOfArticle['taxes'][0].taxAmount !== movementOfArticle['taxes'][0].taxAmount))) return [3 /*break*/, 8];
                        _d.label = 5;
                    case 5:
                        _d.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.updateMovementOfArticle(movementOfArticle)];
                    case 6:
                        result = _d.sent();
                        if (!result) {
                            isUpdateValid = false;
                            return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _d.sent();
                        isUpdateValid = false;
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 1];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        isUpdateValid = true;
                        totalPriceAux = 0;
                        this.transaction.discountPercent = 0;
                        discountAmountAux = 0;
                        _d.label = 11;
                    case 11:
                        this.priceList = null;
                        this.newPriceList = null;
                        if (!isUpdateValid) return [3 /*break*/, 16];
                        this.transaction.totalPrice = totalPriceAux;
                        this.transaction.discountAmount = discountAmountAux;
                        if (!this.transaction.type.requestTaxes) return [3 /*break*/, 13];
                        this.loading = false;
                        return [4 /*yield*/, this.updateTaxes()];
                    case 12:
                        _d.sent();
                        return [3 /*break*/, 15];
                    case 13:
                        this.transaction.exempt = this.transaction.totalPrice;
                        return [4 /*yield*/, this.updateTransaction().then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (transaction) {
                                        this.loading = false;
                                        this.transaction = transaction;
                                        this.lastQuotation = this.transaction.quotation;
                                        if (this.isCancellationAutomatic) {
                                            this.openModal('charge');
                                        }
                                    }
                                    else {
                                        this.loading = false;
                                        this.hideMessage();
                                        this.getMovementsOfTransaction();
                                    }
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 14:
                        _d.sent();
                        _d.label = 15;
                    case 15: return [3 /*break*/, 17];
                    case 16:
                        this.loading = false;
                        this.getMovementsOfTransaction(); // EN CASO DE QUE DE ERROR DE ACTUALIZAR ALGÚN PRODUCTO.
                        _d.label = 17;
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    AddSaleOrderComponent.prototype.updateTaxes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var oldTaxes, totalPriceAux, transactionTaxes, transactionTaxesAUX, _i, _a, movementOfArticle, taxBaseTotal, taxAmountTotal, _b, _c, taxesAux, transactionTax, _d, transactionTaxesAUX_1, transactionTaxAux, exists, _e, transactionTaxes_1, transactionTax, _f, transactionTaxes_2, taxes, _g, oldTaxes_1, oldTax;
            var _this = this;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        this.loading = true;
                        oldTaxes = this.transaction.taxes;
                        totalPriceAux = 0;
                        transactionTaxes = new Array();
                        transactionTaxesAUX = new Array();
                        this.transaction.exempt = 0;
                        this.transaction.basePrice = 0;
                        if (this.movementsOfArticles) {
                            for (_i = 0, _a = this.movementsOfArticles; _i < _a.length; _i++) {
                                movementOfArticle = _a[_i];
                                if (movementOfArticle.taxes && movementOfArticle.taxes.length !== 0) {
                                    taxBaseTotal = 0;
                                    taxAmountTotal = 0;
                                    for (_b = 0, _c = movementOfArticle.taxes; _b < _c.length; _b++) {
                                        taxesAux = _c[_b];
                                        transactionTax = new taxes_1.Taxes();
                                        transactionTax.percentage = this.roundNumber.transform(taxesAux.percentage);
                                        transactionTax.tax = taxesAux.tax;
                                        transactionTax.taxBase = this.roundNumber.transform(taxesAux.taxBase, 4);
                                        transactionTax.taxAmount = this.roundNumber.transform(taxesAux.taxAmount, 4);
                                        transactionTaxesAUX.push(transactionTax);
                                        this.transaction.basePrice += this.roundNumber.transform(transactionTax.taxBase);
                                        taxBaseTotal += this.roundNumber.transform(transactionTax.taxBase);
                                        taxAmountTotal += this.roundNumber.transform(transactionTax.taxAmount);
                                    }
                                    if (taxBaseTotal === 0) {
                                        this.transaction.exempt += this.roundNumber.transform(movementOfArticle.salePrice - taxAmountTotal);
                                    }
                                }
                                else {
                                    this.transaction.exempt += this.roundNumber.transform(movementOfArticle.salePrice);
                                }
                                totalPriceAux += this.roundNumber.transform(movementOfArticle.salePrice);
                            }
                        }
                        this.transaction.basePrice = this.roundNumber.transform(this.transaction.basePrice);
                        if (transactionTaxesAUX) {
                            for (_d = 0, transactionTaxesAUX_1 = transactionTaxesAUX; _d < transactionTaxesAUX_1.length; _d++) {
                                transactionTaxAux = transactionTaxesAUX_1[_d];
                                exists = false;
                                for (_e = 0, transactionTaxes_1 = transactionTaxes; _e < transactionTaxes_1.length; _e++) {
                                    transactionTax = transactionTaxes_1[_e];
                                    if (transactionTaxAux.tax._id.toString() === transactionTax.tax._id.toString()) {
                                        transactionTax.taxAmount += this.roundNumber.transform(transactionTaxAux.taxAmount, 4);
                                        transactionTax.taxBase += this.roundNumber.transform(transactionTaxAux.taxBase, 4);
                                        exists = true;
                                    }
                                }
                                if (!exists) {
                                    transactionTaxes.push(transactionTaxAux);
                                }
                            }
                        }
                        this.totalTaxesAmount = 0;
                        this.totalTaxesBase = 0;
                        // REDONDEAMOS IMPUESTO
                        for (_f = 0, transactionTaxes_2 = transactionTaxes; _f < transactionTaxes_2.length; _f++) {
                            taxes = transactionTaxes_2[_f];
                            taxes.taxBase = this.roundNumber.transform(taxes.taxBase);
                            taxes.taxAmount = this.roundNumber.transform(taxes.taxAmount);
                            this.totalTaxesAmount += taxes.taxAmount;
                            this.totalTaxesBase += taxes.taxBase;
                        }
                        this.transaction.taxes = transactionTaxes;
                        if (oldTaxes && oldTaxes.length > 0) {
                            for (_g = 0, oldTaxes_1 = oldTaxes; _g < oldTaxes_1.length; _g++) {
                                oldTax = oldTaxes_1[_g];
                                if (oldTax.tax.classification !== tax_1.TaxClassification.Tax) {
                                    this.transaction.taxes.push(oldTax);
                                    this.totalTaxesAmount += this.roundNumber.transform(oldTax.taxAmount);
                                    // SUMAMOS AL TOTAL DE LA TRANSACCION LOS IMPUESTOS CARGADOS MANUALMENTE COMO PERCEPCIONES Y RETENCIONES
                                    totalPriceAux += oldTax.taxAmount;
                                }
                            }
                        }
                        this.totalTaxesAmount = this.roundNumber.transform(this.totalTaxesAmount);
                        this.transaction.totalPrice = this.roundNumber.transform(totalPriceAux);
                        return [4 /*yield*/, this.updateTransaction().then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (transaction) {
                                        this.loading = false;
                                        this.transaction = transaction;
                                        this.lastQuotation = this.transaction.quotation;
                                        if (this.isCancellationAutomatic) {
                                            this.openModal('charge');
                                        }
                                    }
                                    else {
                                        this.loading = false;
                                        this.hideMessage();
                                        this.getMovementsOfTransaction();
                                    }
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _h.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AddSaleOrderComponent.prototype.validateElectronicTransactionAR = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.showMessage("Validando comprobante con AFIP...", 'info', false);
                        this.loading = true;
                        this.transaction.type.defectEmailTemplate = null;
                        return [4 /*yield*/, this.getMovementsOfCancellations().then(function (movementsOfCancellations) {
                                _this.movementsOfCancellations = movementsOfCancellations;
                            })];
                    case 1:
                        _a.sent();
                        this._transactionService.validateElectronicTransactionAR(this.transaction, this.movementsOfCancellations, this.canceledTransactionsAFIP).subscribe(function (result) {
                            var msn = '';
                            if (result && result.CAE) {
                                _this.transaction.number = result.number;
                                _this.transaction.CAE = result.CAE;
                                _this.transaction.CAEExpirationDate = moment(result.CAEExpirationDate, 'DD/MM/YYYY HH:mm:ss').format("YYYY-MM-DDTHH:mm:ssZ");
                                if (_this.canceledTransactions) {
                                    var name = void 0;
                                    for (var _i = 0, _a = _this.cancellationTypes; _i < _a.length; _i++) {
                                        var canc = _a[_i];
                                        if (canc.origin._id === _this.canceledTransactions.typeId)
                                            name = canc.origin.name;
                                    }
                                    if (name)
                                        _this.transaction.observation += " Corresponde a " + name + " " + _this.canceledTransactions.origin + "-" + _this.canceledTransactions.letter + "-" + _this.canceledTransactions.number;
                                }
                                if (_this.transaction.type.finishState) {
                                    _this.transaction.state = _this.transaction.type.finishState;
                                }
                                else {
                                    _this.transaction.state = transaction_1.TransactionState.Closed;
                                }
                                _this.finish();
                            }
                            else if (result && result.status != 0) {
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
                                    _this.showMessage(msn, 'info', true);
                                    var body = {
                                        transaction: {
                                            origin: _this.transaction.origin,
                                            letter: _this.transaction.letter,
                                            number: _this.transaction.number,
                                            startDate: _this.transaction.startDate,
                                            endDate: _this.transaction.endDate,
                                            expirationDate: _this.transaction.expirationDate,
                                            VATPeriod: _this.transaction.VATPeriod,
                                            state: _this.transaction.state,
                                            basePrice: _this.transaction.basePrice,
                                            exempt: _this.transaction.exempt,
                                            discountAmount: _this.transaction.discountAmount,
                                            discountPercent: _this.transaction.discountPercent,
                                            totalPrice: _this.transaction.totalPrice,
                                            roundingAmount: _this.transaction.roundingAmount,
                                            CAE: _this.transaction.CAE,
                                            CAEExpirationDate: _this.transaction.CAEExpirationDate,
                                            type: _this.transaction.type,
                                            company: _this.transaction.company,
                                            priceList: _this.transaction.priceList
                                        },
                                        config: {
                                            companyIdentificationValue: _this.config['companyIdentificationValue'],
                                            vatCondition: _this.config['companyVatCondition'].code,
                                            database: _this.config['database']
                                        }
                                    };
                                }
                                else if (result.message) {
                                    _this.showMessage(result.message, 'info', true);
                                }
                                else {
                                    if (msn === '') {
                                        msn = "Ha ocurrido un error al intentar validar la factura. Comuníquese con Soporte Técnico.";
                                    }
                                    _this.showMessage(msn, 'info', true);
                                }
                            }
                            else {
                                if (msn === '') {
                                    msn = "Ha ocurrido un error al intentar validar la factura. Comuníquese con Soporte Técnico.";
                                }
                                _this.showMessage(msn, 'info', true);
                            }
                            _this.loading = false;
                        }, function (error) {
                            _this.showMessage("Ha ocurrido un error en el servidor. Comuníquese con Soporte.", 'danger', false);
                            _this.loading = false;
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    AddSaleOrderComponent.prototype.validateElectronicTransactionMX = function () {
        var _this = this;
        this.showMessage("Validando comprobante con SAT...", 'info', false);
        this._transactionService.validateElectronicTransactionMX(this.transaction, this.movementsOfArticles, this.movementsOfCashes).subscribe(function (result) {
            if (result.status === 'err') {
                var msn = '';
                if (result.code && result.code !== '') {
                    msn += "ERROR " + result.code + ": ";
                }
                if (result.message && result.message !== '') {
                    msn += result.message + ". ";
                }
                if (msn === '') {
                    msn = "Ha ocurrido un error al intentar validar la factura. Comuníquese con Soporte Técnico.";
                }
                _this.showMessage(msn, 'info', true);
                var body = {
                    transaction: {
                        origin: _this.transaction.origin,
                        letter: _this.transaction.letter,
                        number: _this.transaction.number,
                        startDate: _this.transaction.startDate,
                        endDate: _this.transaction.endDate,
                        expirationDate: _this.transaction.expirationDate,
                        VATPeriod: _this.transaction.VATPeriod,
                        state: _this.transaction.state,
                        basePrice: _this.transaction.basePrice,
                        exempt: _this.transaction.exempt,
                        discountAmount: _this.transaction.discountAmount,
                        discountPercent: _this.transaction.discountPercent,
                        totalPrice: _this.transaction.totalPrice,
                        roundingAmount: _this.transaction.roundingAmount,
                        CAE: _this.transaction.CAE,
                        CAEExpirationDate: _this.transaction.CAEExpirationDate,
                        type: _this.transaction.type,
                        company: _this.transaction.company,
                        priceList: _this.transaction.priceList
                    },
                    config: {
                        companyIdentificationValue: _this.config['companyIdentificationValue'],
                        vatCondition: _this.config['companyVatCondition'].code,
                        database: _this.config['database']
                    }
                };
            }
            else {
                if (_this.transaction.type.finishState) {
                    _this.transaction.state = _this.transaction.type.finishState;
                }
                else {
                    _this.transaction.state = transaction_1.TransactionState.Closed;
                }
                _this.transaction.stringSAT = result.stringSAT;
                _this.transaction.CFDStamp = result.CFDStamp;
                _this.transaction.SATStamp = result.SATStamp;
                _this.transaction.endDate = result.endDate;
                _this.transaction.UUID = result.UUID;
                _this.finish();
            }
            _this.loading = false;
        }, function (error) {
            _this.showMessage("Ha ocurrido un error en el servidor. Comuníquese con Soporte.", 'danger', false);
            _this.loading = false;
        });
    };
    AddSaleOrderComponent.prototype.openModal = function (op, movementOfArticle, fastPayment) {
        return __awaiter(this, void 0, void 0, function () {
            var modalRef, _a, attachments, _i, _b, printer, labelPrint, _c, model;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.fastPayment = fastPayment;
                        _a = op;
                        switch (_a) {
                            case 'current-account': return [3 /*break*/, 1];
                            case 'add-article': return [3 /*break*/, 2];
                            case 'list-cancellations': return [3 /*break*/, 3];
                            case 'observation': return [3 /*break*/, 4];
                            case 'movement_of_article': return [3 /*break*/, 5];
                            case 'apply_discount': return [3 /*break*/, 6];
                            case 'send-email': return [3 /*break*/, 7];
                            case 'cancel': return [3 /*break*/, 8];
                            case 'add_client': return [3 /*break*/, 9];
                            case 'charge': return [3 /*break*/, 10];
                            case 'cancelation-type-automatic': return [3 /*break*/, 14];
                            case 'printers': return [3 /*break*/, 15];
                            case 'errorMessage': return [3 /*break*/, 17];
                            case 'change-date': return [3 /*break*/, 18];
                            case 'change-optional-afip': return [3 /*break*/, 19];
                            case 'priceList': return [3 /*break*/, 20];
                            case 'change-information-cancellation': return [3 /*break*/, 21];
                            case 'change-quotation': return [3 /*break*/, 22];
                            case 'change-taxes': return [3 /*break*/, 23];
                            case 'change-employee': return [3 /*break*/, 24];
                            case 'print': return [3 /*break*/, 25];
                            case 'printKitchen': return [3 /*break*/, 26];
                            case 'printBar': return [3 /*break*/, 27];
                            case 'printVoucher': return [3 /*break*/, 28];
                            case 'import': return [3 /*break*/, 29];
                            case 'change-transport': return [3 /*break*/, 30];
                            case 'change-shipment-method': return [3 /*break*/, 31];
                            case 'change-table': return [3 /*break*/, 32];
                        }
                        return [3 /*break*/, 33];
                    case 1:
                        if (this.transaction.company && this.transaction.company._id) {
                            window.open("/#/admin/cuentas-corrientes?companyId=" + this.transaction.company._id + "&companyType=" + this.transaction.company.type, '_blank');
                        }
                        return [3 /*break*/, 34];
                    case 2:
                        this.display = false;
                        modalRef = this._modalService.open(add_article_component_1.AddArticleComponent, { size: 'lg', backdrop: 'static' });
                        modalRef.componentInstance.operation = 'add';
                        modalRef.result.then(function (result) {
                            if (result && result.article) {
                                _this.display = true;
                                _this.filterArticle = result.article.code;
                                _this.focusEvent.emit(true);
                            }
                            else {
                                _this.display = true;
                                _this.getMovementsOfArticles();
                            }
                        }, function (reason) {
                            _this.display = true;
                            _this.getMovementsOfTransaction();
                        });
                        return [3 /*break*/, 34];
                    case 3:
                        modalRef = this._modalService.open(movement_of_cancellation_component_1.MovementOfCancellationComponent, { size: 'lg', backdrop: 'static' });
                        modalRef.componentInstance.transactionDestinationId = this.transaction._id;
                        modalRef.componentInstance.selectionView = true;
                        modalRef.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (result)
                                            this.movementsOfCancellations = result.movementsOfCancellations;
                                        if (!(this.movementsOfCancellations && this.movementsOfCancellations.length > 0)) return [3 /*break*/, 2];
                                        this.showButtonCancelation = false;
                                        return [4 /*yield*/, this.daleteMovementsOfCancellations('{"transactionDestination":"' + this.transaction._id + '"}').then(function (movementsOfCancellations) { return __awaiter(_this, void 0, void 0, function () {
                                                var _this = this;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            if (!movementsOfCancellations) return [3 /*break*/, 2];
                                                            return [4 /*yield*/, this.saveMovementsOfCancellations(this.movementsOfCancellations).then(function (movementsOfCancellations) {
                                                                    if (movementsOfCancellations) {
                                                                        _this.focusEvent.emit(true);
                                                                        _this.getMovementsOfTransaction();
                                                                    }
                                                                })];
                                                        case 1:
                                                            _a.sent();
                                                            _a.label = 2;
                                                        case 2: return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); }, function (reason) {
                        });
                        return [3 /*break*/, 34];
                    case 4:
                        modalRef = this._modalService.open(this.contentChangeObservation).result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(result !== 'cancel' && result !== '')) return [3 /*break*/, 2];
                                        if (!this.transaction.observation) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this.updateTransaction().then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    if (transaction) {
                                                        this.transaction = transaction;
                                                        this.lastQuotation = this.transaction.quotation;
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
                        }); }, function (reason) {
                        });
                        return [3 /*break*/, 34];
                    case 5:
                        movementOfArticle.transaction = this.transaction;
                        movementOfArticle.modifyStock = this.transaction.type.modifyStock;
                        if (this.transaction.type.stockMovement) {
                            movementOfArticle.stockMovement = this.transaction.type.stockMovement.toString();
                        }
                        modalRef = this._modalService.open(add_movement_of_article_component_1.AddMovementOfArticleComponent, { size: 'lg', backdrop: 'static' });
                        modalRef.componentInstance.movementOfArticle = movementOfArticle;
                        modalRef.componentInstance.transaction = this.transaction;
                        modalRef.result.then(function (result) {
                            _this.focusEvent.emit(true);
                            _this.getMovementsOfTransaction();
                        }, function (reason) {
                            _this.focusEvent.emit(true);
                            _this.getMovementsOfTransaction();
                        });
                        return [3 /*break*/, 34];
                    case 6:
                        if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
                            modalRef = this._modalService.open(apply_discount_component_1.ApplyDiscountComponent, { size: 'lg', backdrop: 'static' });
                            modalRef.componentInstance.totalPrice = this.transaction.totalPrice;
                            modalRef.componentInstance.amountToApply = this.transaction.discountAmount;
                            modalRef.componentInstance.percentageToApply = this.transaction.discountPercent;
                            modalRef.componentInstance.percentageToApplyCompany = (this.transaction.company && this.transaction.company.discount > 0 && this.transaction.type.allowCompanyDiscount) ? this.transaction.company.discount : 0;
                            modalRef.componentInstance.percentageToApplyCompanyGroup = (this.transaction.company && this.transaction.company.group && this.transaction.company.group.discount > 0 && this.transaction.type.allowCompanyDiscount) ? this.transaction.company.group.discount : 0;
                            modalRef.result.then(function (result) {
                                if (result.discount) {
                                    _this.updatePrices(result.discount.percentageToApply);
                                }
                            }, function (reason) {
                            });
                        }
                        else {
                            this.showMessage("No se ingresaron productos a la transacción.", 'info', true);
                        }
                        return [3 /*break*/, 34];
                    case 7:
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
                                for (_i = 0, _b = this.printers; _i < _b.length; _i++) {
                                    printer = _b[_i];
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
                            // modalRef.componentInstance.body += ` y su XML correspondiente en http://${Config.database}:300/api/print/xml/CFDI-33_Factura_` + this.transaction.number;
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
                                // modalRef.componentInstance.body += ` y su XML correspondiente en http://vps-1883265-x.dattaweb.com:300/api/print/xml/CFDI-33_Factura_` + this.transaction.number;
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
                            _this.backFinal();
                        }, function (reason) {
                            _this.backFinal();
                        });
                        return [3 /*break*/, 34];
                    case 8:
                        modalRef = this._modalService.open(delete_transaction_component_1.DeleteTransactionComponent, { size: 'lg', backdrop: 'static' });
                        modalRef.componentInstance.transactionId = this.transaction._id;
                        modalRef.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(result === 'delete_close')) return [3 /*break*/, 3];
                                        if (!(this.posType === 'resto' && this.transaction.table)) return [3 /*break*/, 2];
                                        this.transaction.table.employee = null;
                                        this.transaction.table.state = table_1.TableState.Available;
                                        return [4 /*yield*/, this.updateTable(this.transaction.table).then(function (table) {
                                                if (table) {
                                                    _this.transaction.table = table;
                                                    _this.backFinal();
                                                }
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        this.backFinal();
                                        _a.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }, function (reason) {
                        });
                        return [3 /*break*/, 34];
                    case 9:
                        modalRef = this._modalService.open(select_company_component_1.SelectCompanyComponent, { size: 'lg', backdrop: 'static' });
                        if (this.transaction.type.transactionMovement === transaction_type_1.TransactionMovement.Purchase) {
                            modalRef.componentInstance.type = company_1.CompanyType.Provider;
                        }
                        else if (this.transaction.type.transactionMovement === transaction_type_1.TransactionMovement.Sale) {
                            modalRef.componentInstance.type = company_1.CompanyType.Client;
                        }
                        modalRef.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c, _d, _e;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        if (!result.company) return [3 /*break*/, 10];
                                        if (this.transaction.type.requestTransport && result.company['transport']) {
                                            this.transaction.transport = result.company['transport'];
                                        }
                                        if (!(!this.transaction.company && result.company.priceList)) return [3 /*break*/, 2];
                                        this.priceList = undefined;
                                        _a = this;
                                        return [4 /*yield*/, this.getPriceList(result.company.priceList._id)];
                                    case 1:
                                        _a.newPriceList = _f.sent();
                                        _f.label = 2;
                                    case 2:
                                        if (!(this.transaction.company && this.transaction.company.priceList && result.company.priceList)) return [3 /*break*/, 5];
                                        _b = this;
                                        return [4 /*yield*/, this.getPriceList(this.transaction.company.priceList._id)];
                                    case 3:
                                        _b.priceList = _f.sent();
                                        _c = this;
                                        return [4 /*yield*/, this.getPriceList(result.company.priceList._id)];
                                    case 4:
                                        _c.newPriceList = _f.sent();
                                        _f.label = 5;
                                    case 5:
                                        if (!(this.transaction.company && !this.transaction.company.priceList && result.company.priceList)) return [3 /*break*/, 7];
                                        this.priceList = undefined;
                                        _d = this;
                                        return [4 /*yield*/, this.getPriceList(result.company.priceList._id)];
                                    case 6:
                                        _d.newPriceList = _f.sent();
                                        _f.label = 7;
                                    case 7:
                                        if (!(result.company.priceList == null && this.transaction.company && this.transaction.company.priceList)) return [3 /*break*/, 9];
                                        _e = this;
                                        return [4 /*yield*/, this.getPriceList(this.transaction.company.priceList._id)];
                                    case 8:
                                        _e.priceList = _f.sent();
                                        this.newPriceList = undefined;
                                        _f.label = 9;
                                    case 9:
                                        this.transaction.company = result.company;
                                        if (this.transaction.company.transport) {
                                            this.transaction.transport = this.transaction.company.transport;
                                        }
                                        else {
                                            this.transaction.transport = null;
                                        }
                                        this.updatePrices();
                                        _f.label = 10;
                                    case 10: return [2 /*return*/];
                                }
                            });
                        }); }, function (reason) {
                        });
                        return [3 /*break*/, 34];
                    case 10:
                        this.typeOfOperationToPrint = "charge";
                        return [4 /*yield*/, this.isValidCharge()];
                    case 11:
                        _c = (_d.sent());
                        if (!_c) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.areValidMovementOfArticle()];
                    case 12:
                        _c = (_d.sent());
                        _d.label = 13;
                    case 13:
                        if (_c) {
                            if (this.transaction.type.requestPaymentMethods ||
                                fastPayment) {
                                modalRef = this._modalService.open(add_movement_of_cash_component_1.AddMovementOfCashComponent, { size: 'lg', backdrop: 'static' });
                                modalRef.componentInstance.transaction = this.transaction;
                                if (fastPayment) {
                                    modalRef.componentInstance.fastPayment = fastPayment;
                                }
                                modalRef.result.then(function (result) {
                                    _this.movementsOfCashes = result.movementsOfCashes;
                                    if (_this.movementsOfCashes) {
                                        if (result.movementOfArticle) {
                                            _this.movementsOfArticles.push(result.movementOfArticle);
                                        }
                                        if (_this.transaction.type.transactionMovement === transaction_type_1.TransactionMovement.Sale) {
                                            if (_this.transaction.type.fixedOrigin && _this.transaction.type.fixedOrigin !== 0) {
                                                _this.transaction.origin = _this.transaction.type.fixedOrigin;
                                            }
                                            _this.assignLetter();
                                            if (_this.transaction.type.electronics) {
                                                if (_this.config['country'] === 'MX') {
                                                    if (!_this.transaction.CFDStamp &&
                                                        !_this.transaction.SATStamp &&
                                                        !_this.transaction.stringSAT) {
                                                        _this.validateElectronicTransactionMX();
                                                    }
                                                    else {
                                                        _this.finish(); //SE FINALIZA POR ERROR EN LA FE
                                                    }
                                                }
                                                else if (_this.config['country'] === 'AR') {
                                                    if (!_this.transaction.CAE) {
                                                        _this.validateElectronicTransactionAR();
                                                    }
                                                    else {
                                                        _this.finish(); //SE FINALIZA POR ERROR EN LA FE
                                                    }
                                                }
                                                else {
                                                    _this.showMessage("Facturación electrónica no esta habilitada para tu país.", "info", true);
                                                }
                                            }
                                            else if (_this.transaction.type.electronics && _this.transaction.CAE) {
                                                _this.finish(); //SE FINALIZA POR ERROR EN LA FE
                                            }
                                            else {
                                                if (_this.transaction.type.fixedLetter !== _this.transaction.letter) {
                                                    _this.assignTransactionNumber();
                                                }
                                                else {
                                                    _this.finish();
                                                }
                                            }
                                        }
                                        else {
                                            _this.finish();
                                        }
                                    }
                                }, function (reason) {
                                });
                            }
                            else {
                                if (this.transaction.type.transactionMovement === transaction_type_1.TransactionMovement.Sale) {
                                    this.assignLetter();
                                    if (this.transaction.type.electronics && !this.transaction.CAE) {
                                        this.validateElectronicTransactionAR();
                                    }
                                    else if (this.transaction.type.electronics && this.transaction.CAE) {
                                        this.finish(); //SE FINALIZA POR ERROR EN LA FE
                                    }
                                    else {
                                        if (this.transaction.type.fixedLetter !== this.transaction.letter) {
                                            this.assignTransactionNumber();
                                        }
                                        else {
                                            this.finish();
                                        }
                                    }
                                }
                                else {
                                    this.finish();
                                }
                            }
                        }
                        return [3 /*break*/, 34];
                    case 14:
                        modalRef = this._modalService.open(cancellation_types_automatic_component_1.CancellationTypeAutomaticComponent, { size: 'lg', backdrop: 'static' });
                        modalRef.componentInstance.transactionId = this.transaction._id;
                        modalRef.result.then(function (result) {
                            if (result && result.transaction) {
                                _this.isCancellationAutomatic = true;
                                _this.initVariables();
                                _this.transactionId = result.transaction._id;
                                _this.initComponent();
                            }
                            else {
                                if (_this.transaction && _this.transaction.type.printable) {
                                    _this.print();
                                }
                                else if (_this.transaction && _this.transaction.type.requestEmailTemplate) {
                                    _this.openModal('send-email');
                                }
                                else {
                                    _this.backFinal();
                                }
                            }
                        }, function (reason) {
                            if (_this.transaction && _this.transaction.type.printable) {
                                _this.print();
                            }
                            else if (_this.transaction && _this.transaction.type.requestEmailTemplate) {
                                _this.openModal('send-email');
                            }
                            else {
                                _this.backFinal();
                            }
                        });
                        return [3 /*break*/, 34];
                    case 15: return [4 /*yield*/, this.getPrinters().then(function (printers) {
                            if (printers) {
                                _this.printers = printers;
                            }
                        })];
                    case 16:
                        _d.sent();
                        if (this.countPrinters() > 1) {
                            modalRef = this._modalService.open(this.contentPrinters, { size: 'lg', backdrop: 'static' }).result.then(function (result) {
                                if (result !== 'cancel' && result !== '') {
                                    _this.distributeImpressions(result);
                                }
                            }, function (reason) {
                            });
                        }
                        else if (this.countPrinters() === 1) {
                            this.distributeImpressions(this.printersAux[0]);
                        }
                        else {
                            this.backFinal();
                        }
                        return [3 /*break*/, 34];
                    case 17:
                        modalRef = this._modalService.open(this.contentMessage, { size: 'lg', backdrop: 'static' }).result.then(function (result) {
                            if (result !== 'cancel' && result !== '') {
                                _this.backFinal();
                            }
                        }, function (reason) {
                        });
                        return [3 /*break*/, 34];
                    case 18:
                        modalRef = this._modalService.open(this.contentChangeDate).result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(result !== 'cancel' && result !== '')) return [3 /*break*/, 2];
                                        if (!(this.transaction.endDate && moment(this.transaction.endDate, 'YYYY-MM-DD').isValid())) return [3 /*break*/, 2];
                                        this.transaction.endDate = moment(this.transaction.endDate, 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ssZ');
                                        this.transaction.VATPeriod = moment(this.transaction.endDate, 'YYYY-MM-DDTHH:mm:ssZ').format('YYYYMM');
                                        this.transaction.expirationDate = this.transaction.endDate;
                                        return [4 /*yield*/, this.updateTransaction().then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    if (transaction) {
                                                        this.transaction = transaction;
                                                        this.lastQuotation = this.transaction.quotation;
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
                        }); }, function (reason) {
                        });
                        return [3 /*break*/, 34];
                    case 19:
                        modalRef = this._modalService.open(this.contentChangeOptionalAFIP).result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(result !== 'cancel' && result !== '')) return [3 /*break*/, 2];
                                        this.transaction.opctionalAFIP = {
                                            id: this.transaction.type.optionalAFIP,
                                            value: result
                                        };
                                        this.optional = result.value;
                                        return [4 /*yield*/, this.updateTransaction().then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    if (transaction) {
                                                        this.transaction = transaction;
                                                        this.lastQuotation = this.transaction.quotation;
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
                        }); }, function (reason) {
                        });
                        return [3 /*break*/, 34];
                    case 20:
                        modalRef = this._modalService.open(select_price_list_component_1.SelectPriceListComponent).result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(result && result.priceList)) return [3 /*break*/, 2];
                                        if (!this.transaction.priceList) {
                                            this.transaction.priceList = result.priceList;
                                            this.newPriceList = result.priceList;
                                        }
                                        else {
                                            if (!this.priceList) {
                                                this.priceList = this.transaction.priceList;
                                            }
                                            this.transaction.priceList = result.priceList;
                                            this.newPriceList = result.priceList;
                                        }
                                        return [4 /*yield*/, this.updateTransaction().then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    if (transaction) {
                                                        this.transaction = transaction;
                                                        this.updatePrices();
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
                        }); }, function (reason) {
                        });
                        return [3 /*break*/, 34];
                    case 21:
                        modalRef = this._modalService.open(this.contentInformCancellation).result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (result !== 'cancel' && result !== '') {
                                    this.checkInformationCancellation();
                                }
                                return [2 /*return*/];
                            });
                        }); }, function (reason) {
                        });
                        return [3 /*break*/, 34];
                    case 22:
                        modalRef = this._modalService.open(this.contentChangeQuotation).result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (result !== 'cancel' && result !== '') {
                                    this.updatePrices();
                                }
                                else {
                                    this.transaction.quotation = this.lastQuotation;
                                }
                                return [2 /*return*/];
                            });
                        }); }, function (reason) {
                            _this.transaction.quotation = _this.lastQuotation;
                        });
                        return [3 /*break*/, 34];
                    case 23:
                        modalRef = this._modalService.open(this.containerTaxes, { size: 'lg', backdrop: 'static' }).result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/];
                            });
                        }); }, function (reason) {
                        });
                        return [3 /*break*/, 34];
                    case 24:
                        modalRef = this._modalService.open(select_employee_component_1.SelectEmployeeComponent);
                        modalRef.componentInstance.requireLogin = false;
                        modalRef.componentInstance.typeEmployee = this.transaction.type.requestEmployee;
                        modalRef.componentInstance.op = "change-employee";
                        modalRef.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!result) return [3 /*break*/, 2];
                                        if (result.employee) {
                                            this.transaction.employeeClosing = result.employee;
                                        }
                                        return [4 /*yield*/, this.updateTransaction().then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                                var _this = this;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            if (!transaction) return [3 /*break*/, 2];
                                                            this.transaction = transaction;
                                                            if (!this.transaction.table) return [3 /*break*/, 2];
                                                            this.transaction.table.employee = result.employee;
                                                            return [4 /*yield*/, this.updateTable(this.transaction.table).then(function (table) {
                                                                    if (table) {
                                                                        _this.transaction.table = table;
                                                                    }
                                                                })];
                                                        case 1:
                                                            _a.sent();
                                                            _a.label = 2;
                                                        case 2: return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); }, function (reason) {
                        });
                        return [3 /*break*/, 34];
                    case 25:
                        if (this.transaction.type.expirationDate && moment(this.transaction.type.expirationDate).diff(moment(), 'days') <= 0) {
                            this.showToast(null, "danger", "El documento esta vencido no se puede imprimir");
                            this.backFinal();
                        }
                        else {
                            if (this.transaction.type.readLayout) {
                                modalRef = this._modalService.open(print_transaction_type_component_1.PrintTransactionTypeComponent);
                                modalRef.componentInstance.transactionId = this.transaction._id;
                                modalRef.result.then(function (result) {
                                }, function (reason) {
                                    _this.backFinal();
                                });
                            }
                            else {
                                modalRef = this._modalService.open(print_component_1.PrintComponent);
                                modalRef.componentInstance.transactionId = this.transaction._id;
                                modalRef.componentInstance.company = this.transaction.company;
                                modalRef.componentInstance.printer = this.printerSelected;
                                modalRef.componentInstance.typePrint = 'invoice';
                                modalRef.result.then(function (result) {
                                }, function (reason) {
                                    _this.backFinal();
                                });
                            }
                        }
                        return [3 /*break*/, 34];
                    case 26:
                        modalRef = this._modalService.open(print_component_1.PrintComponent);
                        modalRef.componentInstance.transactionId = this.transaction._id;
                        modalRef.componentInstance.movementsOfArticles = this.kitchenArticlesToPrint;
                        modalRef.componentInstance.printer = this.printerSelected;
                        modalRef.componentInstance.typePrint = 'kitchen';
                        modalRef.result.then(function (result) {
                        }, function (reason) {
                            _this.updateMovementOfArticlePrintedKitchen();
                        });
                        return [3 /*break*/, 34];
                    case 27:
                        modalRef = this._modalService.open(print_component_1.PrintComponent);
                        modalRef.componentInstance.transactionId = this.transaction._id;
                        modalRef.componentInstance.movementsOfArticles = this.barArticlesToPrint;
                        modalRef.componentInstance.printer = this.printerSelected;
                        modalRef.componentInstance.typePrint = 'bar';
                        modalRef.result.then(function (result) {
                        }, function (reason) {
                            _this.updateMovementOfArticlePrintedBar();
                        });
                        return [3 /*break*/, 34];
                    case 28:
                        modalRef = this._modalService.open(print_component_1.PrintComponent);
                        modalRef.componentInstance.transactionId = this.transaction._id;
                        modalRef.componentInstance.movementsOfArticles = this.voucherArticlesToPrint;
                        modalRef.componentInstance.printer = this.printerSelected;
                        modalRef.componentInstance.typePrint = 'voucher';
                        modalRef.result.then(function (result) {
                        }, function (reason) {
                            _this.updateMovementOfArticlePrintedVoucher();
                        });
                        return [3 /*break*/, 34];
                    case 29:
                        modalRef = this._modalService.open(import_component_1.ImportComponent, { size: 'lg', backdrop: 'static' });
                        modalRef.componentInstance.transaction = this.transaction._id;
                        model = new movement_of_article_1.MovementOfArticle();
                        model.model = "movement-of-article";
                        model.relations = new Array();
                        model.relations.push("article_relation_code");
                        modalRef.componentInstance.model = model;
                        modalRef.result.then(function (result) {
                            _this.focusEvent.emit(true);
                            _this.getMovementsOfTransaction();
                        }, function (reason) {
                            _this.focusEvent.emit(true);
                            _this.getMovementsOfTransaction();
                        });
                        return [3 /*break*/, 34];
                    case 30:
                        modalRef = this._modalService.open(select_transport_component_1.SelectTransportComponent);
                        modalRef.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(result && result.transport)) return [3 /*break*/, 2];
                                        this.transaction.transport = result.transport;
                                        this.transaction.declaredValue = result.declaredValue;
                                        this.transaction.package = result.package;
                                        return [4 /*yield*/, this.updateTransaction().then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    if (transaction) {
                                                        this.transaction = transaction;
                                                        this.lastQuotation = this.transaction.quotation;
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
                        }); }, function (reason) {
                        });
                        return [3 /*break*/, 34];
                    case 31:
                        if (this.transaction.company) {
                            modalRef = this._modalService.open(select_shipment_method_component_1.SelectShipmentMethodComponent, { size: 'lg', backdrop: 'static' });
                            modalRef.componentInstance.company = this.transaction.company;
                            modalRef.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(result && result.shipmentMethod)) return [3 /*break*/, 2];
                                            this.transaction.shipmentMethod = result.shipmentMethod;
                                            this.transaction.deliveryAddress = result.address;
                                            return [4 /*yield*/, this.updateTransaction().then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        if (transaction) {
                                                            this.transaction = transaction;
                                                            this.lastQuotation = this.transaction.quotation;
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
                            }); }, function (reason) {
                            });
                        }
                        else {
                            this.showToast(null, "info", "Debe seleccionar una empresa.");
                        }
                        return [3 /*break*/, 34];
                    case 32:
                        modalRef = this._modalService.open(select_table_component_1.SelectTableComponent);
                        modalRef.componentInstance.roomId = this.transaction.table.room;
                        modalRef.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(result && result.table)) return [3 /*break*/, 4];
                                        result.table.employee = this.transaction.table.employee;
                                        result.table.lastTransaction = this.transaction._id;
                                        this.transaction.table.state = table_1.TableState.Available;
                                        this.transaction.table.employee = null;
                                        this.transaction.table.lastTransaction = null;
                                        return [4 /*yield*/, this.updateTable(this.transaction.table)];
                                    case 1:
                                        _a.sent();
                                        this.transaction.table = result.table;
                                        this.transaction.table.state = table_1.TableState.Busy;
                                        return [4 /*yield*/, this.updateTable(this.transaction.table)];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, this.updateTransaction().then(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    if (transaction) {
                                                        this.transaction = transaction;
                                                        this.lastQuotation = this.transaction.quotation;
                                                        this.transaction.table.state = table_1.TableState.Busy;
                                                    }
                                                    return [2 /*return*/];
                                                });
                                            }); })];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }, function (reason) {
                        });
                        return [3 /*break*/, 34];
                    case 33:
                        ;
                        _d.label = 34;
                    case 34:
                        ;
                        return [2 /*return*/];
                }
            });
        });
    };
    AddSaleOrderComponent.prototype.updateArticlesCostPrice = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var unitPrice, countArticle, _i, _a, mov, error_3;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 5, , 6]);
                                    unitPrice = 0;
                                    countArticle = 0;
                                    _i = 0, _a = this.movementsOfArticles;
                                    _b.label = 1;
                                case 1:
                                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                                    mov = _a[_i];
                                    if (!(mov && mov.article && mov.article._id)) return [3 /*break*/, 3];
                                    if (this.transaction.quotation > 1)
                                        unitPrice = this.roundNumber.transform((mov.basePrice / mov.amount) / this.transaction.quotation);
                                    else
                                        unitPrice = this.roundNumber.transform(mov.basePrice / mov.amount);
                                    unitPrice = this.roundNumber.transform(unitPrice + mov.transactionDiscountAmount);
                                    if (!(unitPrice !== mov.article.basePrice)) return [3 /*break*/, 3];
                                    return [4 /*yield*/, this.updateArticleCostPrice(mov.article, unitPrice)];
                                case 2:
                                    if (_b.sent())
                                        countArticle++;
                                    _b.label = 3;
                                case 3:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 4:
                                    resolve(countArticle);
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_3 = _b.sent();
                                    reject(error_3);
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    AddSaleOrderComponent.prototype.updateArticleCostPrice = function (article, basePrice) {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var taxedAmount, _i, _a, field, _b, _c, articleTax, error_4;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _d.trys.push([0, 3, , 4]);
                                    if (!(basePrice && article)) return [3 /*break*/, 2];
                                    taxedAmount = 0;
                                    article.costPrice = 0;
                                    article.basePrice = basePrice;
                                    taxedAmount = basePrice;
                                    if (article.otherFields && article.otherFields.length > 0) {
                                        for (_i = 0, _a = article.otherFields; _i < _a.length; _i++) {
                                            field = _a[_i];
                                            if (field.articleField.datatype === article_field_1.ArticleFieldType.Percentage) {
                                                field.amount = this.roundNumber.transform((basePrice * parseFloat(field.value) / 100));
                                            }
                                            else if (field.articleField.datatype === article_field_1.ArticleFieldType.Number) {
                                                field.amount = parseFloat(field.value);
                                            }
                                            if (field.articleField.modifyVAT) {
                                                taxedAmount += field.amount;
                                            }
                                            else {
                                                if (field.amount) {
                                                    article.costPrice += field.amount;
                                                }
                                            }
                                        }
                                    }
                                    if (article.taxes && article.taxes.length > 0) {
                                        for (_b = 0, _c = article.taxes; _b < _c.length; _b++) {
                                            articleTax = _c[_b];
                                            if (articleTax.tax.percentage && articleTax.tax.percentage != 0) {
                                                articleTax.taxBase = this.roundNumber.transform(taxedAmount);
                                                articleTax.taxAmount = this.roundNumber.transform((taxedAmount * articleTax.percentage / 100));
                                            }
                                            article.costPrice += (articleTax.taxAmount);
                                        }
                                    }
                                    article.costPrice += taxedAmount;
                                    if (!(taxedAmount === 0 && article.salePrice !== 0)) {
                                        article.markupPrice = this.roundNumber.transform((article.costPrice * article.markupPercentage / 100));
                                        article.salePrice = article.costPrice + article.markupPrice;
                                    }
                                    return [4 /*yield*/, this._articleService.updateArticle(article, null).toPromise()
                                            .then(function (result) {
                                            if (result && !result.article && result.message)
                                                throw new Error(result.message);
                                        })];
                                case 1:
                                    _d.sent();
                                    _d.label = 2;
                                case 2:
                                    resolve(true);
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_4 = _d.sent();
                                    reject(error_4);
                                    return [3 /*break*/, 4];
                                case 4:
                                    ;
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    AddSaleOrderComponent.prototype.isValidCharge = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var error_5;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    if (this.movementsOfArticles && this.movementsOfArticles.length <= 0)
                                        throw new Error('No existen productos en la transacción');
                                    return [4 /*yield*/, this.areValidMovementOfArticle()];
                                case 1:
                                    _a.sent();
                                    if (this.transaction.type.requestPaymentMethods &&
                                        this.fastPayment &&
                                        this.fastPayment.isCurrentAccount &&
                                        !this.transaction.company)
                                        throw new Error("Debe seleccionar una empresa para poder efectuarse un pago con el m\u00E9todo " + this.fastPayment.name);
                                    if (this.transaction.type.requestPaymentMethods &&
                                        this.fastPayment &&
                                        this.fastPayment.isCurrentAccount &&
                                        this.transaction.company &&
                                        !this.transaction.company.allowCurrentAccount)
                                        throw new Error("La empresa seleccionada no esta habilitada para cobrar con el m\u00E9todo " + this.fastPayment.name);
                                    if (this.transaction.type.transactionMovement === transaction_type_1.TransactionMovement.Purchase &&
                                        !this.transaction.company)
                                        throw new Error("Debe seleccionar un proveedor para la transacci\u00F3n");
                                    if (this.transaction.type.transactionMovement === transaction_type_1.TransactionMovement.Sale &&
                                        !this.transaction.company && this.transaction.type.requestCompany)
                                        throw new Error("Debe seleccionar un cliente para la transacci\u00F3n");
                                    if (this.transaction.type.electronics &&
                                        this.transaction.totalPrice >= 26228 &&
                                        !this.transaction.company &&
                                        this.config['country'] === 'AR')
                                        throw new Error("Debe indentificar al cliente para transacciones electr\u00F3nicos con monto mayor a $5.000,00");
                                    if (this.transaction.type.electronics &&
                                        this.transaction.company && (!this.transaction.company.identificationType ||
                                        !this.transaction.company.identificationValue ||
                                        this.transaction.company.identificationValue === ''))
                                        throw new Error("El cliente ingresado no tiene n\u00FAmero de identificaci\u00F3n");
                                    if (this.transaction.type.fixedOrigin &&
                                        this.transaction.type.fixedOrigin === 0 &&
                                        this.transaction.type.electronics &&
                                        this.config['country'] === 'MX')
                                        throw new Error("Debe configurar un punto de venta para transacciones electr\u00F3nicos. Lo puede hacer en /Configuraci\u00F3n/Tipos de Transacci\u00F3n");
                                    resolve(true);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_5 = _a.sent();
                                    this.showToast(error_5);
                                    resolve(false);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    AddSaleOrderComponent.prototype.getPrinters = function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.loading = true;
                this._printerService.getPrinters().subscribe(function (result) {
                    _this.loading = false;
                    if (!result.printers) {
                        if (result.message && result.message !== '')
                            _this.showMessage(result.message, 'info', true);
                        resolve(null);
                    }
                    else {
                        resolve(result.printers);
                    }
                }, function (error) {
                    _this.loading = false;
                    _this.showMessage(error._body, 'danger', false);
                    resolve(null);
                });
                return [2 /*return*/];
            });
        }); });
    };
    AddSaleOrderComponent.prototype.areValidMovementOfArticle = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var isValid, _i, _a, movementOfArticle, error_6;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 5, , 6]);
                                    isValid = true;
                                    _i = 0, _a = this.movementsOfArticles;
                                    _b.label = 1;
                                case 1:
                                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                                    movementOfArticle = _a[_i];
                                    if (!isValid) return [3 /*break*/, 3];
                                    return [4 /*yield*/, this.isValidMovementOfArticle(movementOfArticle)];
                                case 2:
                                    isValid = _b.sent();
                                    _b.label = 3;
                                case 3:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 4:
                                    resolve(isValid);
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_6 = _b.sent();
                                    resolve(false);
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    AddSaleOrderComponent.prototype.finish = function () {
        return __awaiter(this, void 0, void 0, function () {
            var count, result, _a, table, _b, cancellationTypesAutomatic, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 16, , 17]);
                        this.loading = true;
                        if (!this.movementsOfArticles || this.movementsOfArticles.length === 0)
                            throw new Error('No se encontraron productos en la transacción');
                        if (!this.transaction.type.updatePrice) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.updateArticlesCostPrice()];
                    case 1:
                        count = _c.sent();
                        if (count === 1) {
                            this.showToast(null, "info", "Se actualizó : 1 producto");
                        }
                        else {
                            if (count > 1) {
                                this.showToast(null, "info", "Se actualizaron : " + count + " productos");
                            }
                        }
                        _c.label = 2;
                    case 2:
                        if (!this.transaction.type.posKitchen) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.changeArticlesStatusToPending()];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        if (!(this.config['modules'].stock &&
                            this.transaction.type.modifyStock)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.areValidMovementOfArticle()];
                    case 5:
                        if (!_c.sent()) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.updateStockByTransaction()];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7: return [4 /*yield*/, this._transactionService.updateBalance(this.transaction).toPromise()];
                    case 8:
                        result = _c.sent();
                        if (result.status !== 200)
                            throw result;
                        this.transaction.balance = result.result.balance;
                        if (!this.transaction.endDate) {
                            this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
                        }
                        if (this.transaction.type.transactionMovement !== transaction_type_1.TransactionMovement.Purchase || !this.transaction.VATPeriod) {
                            this.transaction.VATPeriod = moment(this.transaction.endDate, 'YYYY-MM-DDTHH:mm:ssZ').format('YYYYMM');
                        }
                        this.transaction.expirationDate = this.transaction.endDate;
                        if (this.transaction.type.finishState) {
                            this.transaction.state = this.transaction.type.finishState;
                        }
                        else {
                            this.transaction.state = transaction_1.TransactionState.Closed;
                        }
                        _a = this;
                        return [4 /*yield*/, this.updateTransaction()];
                    case 9:
                        _a.transaction = _c.sent();
                        if (!this.transaction.table) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.getTable((this.transaction.table._id) ? this.transaction.table._id : this.transaction.table.toString())];
                    case 10:
                        table = _c.sent();
                        if (this.transaction.type.finishCharge) {
                            table.employee = null;
                            table.state = table_1.TableState.Available;
                        }
                        else {
                            table.state = table_1.TableState.Pending;
                        }
                        _b = this.transaction;
                        return [4 /*yield*/, this.updateTable(table)];
                    case 11:
                        _b.table = _c.sent();
                        _c.label = 12;
                    case 12:
                        if (!this.transaction.type.allowAccounting) return [3 /*break*/, 14];
                        return [4 /*yield*/, this._accountSeatService.addAccountSeatByTransaction(this.transaction._id)];
                    case 13:
                        _c.sent();
                        _c.label = 14;
                    case 14: return [4 /*yield*/, this.getCancellationTypesAutomatic()];
                    case 15:
                        cancellationTypesAutomatic = _c.sent();
                        if (!cancellationTypesAutomatic || cancellationTypesAutomatic.length == 0) {
                            if (this.transaction && this.transaction.type.printable) {
                                this.print();
                            }
                            else if (this.transaction && this.transaction.type.requestEmailTemplate) {
                                this.openModal('send-email');
                            }
                            else {
                                this.backFinal();
                            }
                        }
                        else {
                            this.openModal('cancelation-type-automatic');
                        }
                        this.loading = false;
                        return [3 /*break*/, 17];
                    case 16:
                        error_7 = _c.sent();
                        this.showToast(error_7);
                        return [3 /*break*/, 17];
                    case 17:
                        ;
                        return [2 /*return*/];
                }
            });
        });
    };
    AddSaleOrderComponent.prototype.changeArticlesStatusToPending = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _i, _a, mov, error_8;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 5, , 6]);
                                    _i = 0, _a = this.movementsOfArticles;
                                    _b.label = 1;
                                case 1:
                                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                                    mov = _a[_i];
                                    if (!mov.article.posKitchen) return [3 /*break*/, 3];
                                    mov.status = movement_of_article_1.MovementOfArticleStatus.Pending;
                                    return [4 /*yield*/, this.updateMovementOfArticle(mov)];
                                case 2:
                                    _b.sent();
                                    _b.label = 3;
                                case 3:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 4:
                                    resolve(true);
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_8 = _b.sent();
                                    reject(error_8);
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    AddSaleOrderComponent.prototype.print = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPrinters().then(function (printers) {
                            if (printers) {
                                _this.printers = printers;
                            }
                        })];
                    case 1:
                        _a.sent();
                        if (this.transaction.type.defectPrinter) {
                            this.printerSelected = this.transaction.type.defectPrinter;
                            this.distributeImpressions(this.transaction.type.defectPrinter);
                        }
                        else {
                            this.openModal('printers');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AddSaleOrderComponent.prototype.updateStockByTransaction = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.loading = true;
            _this._articleStockService.updateStockByTransaction(_this.transaction).subscribe(function (result) {
                _this.loading = false;
                if (result.status === 200) {
                    resolve(true);
                }
                else {
                    _this.showToast(result);
                    resolve(false);
                }
            }, function (error) {
                _this.loading = false;
                _this.showToast(error);
                resolve(false);
            });
        });
    };
    AddSaleOrderComponent.prototype.getCancellationTypesAutomatic = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.loading = true;
            _this._cancellationTypeService.getCancellationTypes({
                "origin._id": 1,
                "origin.operationType": 1,
                "destination._id": 1,
                "destination.name": 1,
                "destination.operationType": 1,
                "operationType": 1,
                "requestAutomatic": 1
            }, // PROJECT
            {
                "origin._id": { $oid: _this.transaction.type._id },
                "requestAutomatic": true,
                "operationType": { "$ne": "D" },
                "destination.operationType": { "$ne": "D" },
                "origin.operationType": { "$ne": "D" }
            }, // MATCH
            {}, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
            ).subscribe(function (result) {
                _this.loading = false;
                if (result && result.cancellationTypes && result.cancellationTypes.length > 0) {
                    resolve(result.cancellationTypes);
                }
                else {
                    resolve(null);
                }
            }, function (error) {
                _this.loading = false;
                _this.showMessage(error._body, 'danger', false);
                resolve(null);
            });
        });
    };
    AddSaleOrderComponent.prototype.asignOrderNumber = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.transaction.type && _this.transaction.type.order && _this.transaction.type.order >= 1) {
                _this._transactionService.setOrderNumber(_this.transaction).subscribe(function (result) {
                    _this.loading = false;
                    resolve(true);
                }, function (error) {
                    if (error) {
                        reject(false);
                    }
                });
            }
            else {
                resolve(true);
            }
        });
    };
    AddSaleOrderComponent.prototype.close = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, movementOfArticle;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.transaction.type.orderNumber > 0 && !this.transaction.orderNumber)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.asignOrderNumber()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        if (op === 'charge') {
                            this.isCharge = true;
                        }
                        else {
                            this.isCharge = false;
                        }
                        if (this.transaction.type.posKitchen) {
                            this.typeOfOperationToPrint = 'item';
                            if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
                                for (_i = 0, _a = this.movementsOfArticles; _i < _a.length; _i++) {
                                    movementOfArticle = _a[_i];
                                    if (movementOfArticle.article && movementOfArticle.article.printIn === article_1.ArticlePrintIn.Bar && movementOfArticle.printed < movementOfArticle.amount) {
                                        this.barArticlesToPrint.push(movementOfArticle);
                                    }
                                    if (movementOfArticle.article && movementOfArticle.article.printIn === article_1.ArticlePrintIn.Kitchen && movementOfArticle.printed < movementOfArticle.amount) {
                                        this.kitchenArticlesToPrint.push(movementOfArticle);
                                    }
                                    if (movementOfArticle.article && movementOfArticle.article.printIn === article_1.ArticlePrintIn.Voucher && movementOfArticle.printed < movementOfArticle.amount) {
                                        this.voucherArticlesToPrint.push(movementOfArticle);
                                    }
                                }
                            }
                        }
                        if (this.barArticlesToPrint && this.barArticlesToPrint.length !== 0) {
                            this.typeOfOperationToPrint = "bar";
                            this.distributeImpressions();
                        }
                        else if (this.kitchenArticlesToPrint && this.kitchenArticlesToPrint.length !== 0) {
                            this.typeOfOperationToPrint = "kitchen";
                            this.distributeImpressions();
                        }
                        else if (this.voucherArticlesToPrint && this.voucherArticlesToPrint.length !== 0) {
                            this.typeOfOperationToPrint = "voucher";
                            this.distributeImpressions();
                        }
                        else {
                            if (this.isCharge) {
                                this.openModal('charge');
                            }
                            else {
                                this.backFinal();
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AddSaleOrderComponent.prototype.backFinal = function () {
        var _this = this;
        this._route.queryParams.subscribe(function (params) {
            if (params['returnURL']) {
                if (params['automaticCreation']) {
                    if (_this.transaction.state === transaction_1.TransactionState.Closed) {
                        var route = params['returnURL'].split('?')[0];
                        var paramsFromRoute = params['returnURL'].split('?')[1];
                        if (paramsFromRoute && paramsFromRoute !== '') {
                            paramsFromRoute = _this.removeParam(paramsFromRoute, 'automaticCreation');
                            route += '?' + paramsFromRoute + '&automaticCreation=' + params['automaticCreation'];
                        }
                        else {
                            route += '?' + 'automaticCreation=' + params['automaticCreation'];
                        }
                        _this._router.navigateByUrl(route);
                    }
                    else {
                        _this._router.navigateByUrl(_this.removeParam(params['returnURL'], 'automaticCreation'));
                    }
                }
                else {
                    _this._router.navigateByUrl(params['returnURL']);
                }
            }
        });
    };
    AddSaleOrderComponent.prototype.removeParam = function (sourceURL, key) {
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
    AddSaleOrderComponent.prototype.getTable = function (tableId) {
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
                    _this.hideMessage();
                    resolve(result.table);
                }
            }, function (error) {
                _this.showMessage(error._body, 'danger', false);
                _this.loading = false;
                resolve(null);
            });
        });
    };
    AddSaleOrderComponent.prototype.getTaxVAT = function (movementOfArticle) {
        return __awaiter(this, void 0, void 0, function () {
            var taxes, tax;
            var _this = this;
            return __generator(this, function (_a) {
                this.loading = true;
                taxes = new Array();
                tax = new taxes_1.Taxes();
                tax.percentage = 21.00;
                tax.taxBase = this.roundNumber.transform((movementOfArticle.salePrice / ((tax.percentage / 100) + 1)));
                tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage / 100));
                this._taxService.getTaxes('where="name":"IVA"').subscribe(function (result) { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.loading = false;
                                if (!!result.taxes) return [3 /*break*/, 1];
                                this.showMessage("Debe configurar el impuesto IVA para el realizar el recargo de la tarjeta", 'info', true);
                                return [3 /*break*/, 3];
                            case 1:
                                this.hideMessage();
                                tax.tax = result.taxes[0];
                                taxes.push(tax);
                                movementOfArticle.taxes = taxes;
                                return [4 /*yield*/, this.saveMovementOfArticle(movementOfArticle).then(function (movementOfArticle) {
                                        if (movementOfArticle) {
                                            _this.focusEvent.emit(true);
                                            _this.getMovementsOfTransaction();
                                        }
                                    })];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                }); }, function (error) {
                    _this.loading = false;
                    _this.showMessage(error._body, 'danger', false);
                });
                return [2 /*return*/];
            });
        });
    };
    AddSaleOrderComponent.prototype.updateMovementOfArticlePrintedBar = function () {
        var _this = this;
        this.loading = true;
        this.barArticlesToPrint[this.barArticlesPrinted].printed = this.barArticlesToPrint[this.barArticlesPrinted].amount;
        this._movementOfArticleService.updateMovementOfArticle(this.barArticlesToPrint[this.barArticlesPrinted]).subscribe(function (result) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.loading = false;
                if (!result.movementOfArticle) {
                    if (result.message && result.message !== '')
                        this.showMessage(result.message, 'info', true);
                }
                else {
                    this.barArticlesPrinted++;
                    if (this.barArticlesPrinted < this.barArticlesToPrint.length) {
                        this.updateMovementOfArticlePrintedBar();
                    }
                    else {
                        if (this.kitchenArticlesToPrint.length > 0) {
                            this.typeOfOperationToPrint = 'kitchen';
                            this.distributeImpressions(null);
                        }
                        else if (this.voucherArticlesToPrint.length > 0) {
                            this.typeOfOperationToPrint = 'voucher';
                            this.distributeImpressions(null);
                        }
                        else {
                            if (this.isCharge) {
                                this.openModal('charge');
                            }
                            else {
                                this.backFinal();
                            }
                        }
                    }
                }
                return [2 /*return*/];
            });
        }); }, function (error) {
            _this.loading = false;
            _this.showMessage(error._body, 'danger', false);
        });
    };
    AddSaleOrderComponent.prototype.updateMovementOfArticlePrintedKitchen = function () {
        var _this = this;
        this.loading = true;
        this.kitchenArticlesToPrint[this.kitchenArticlesPrinted].printed = this.kitchenArticlesToPrint[this.kitchenArticlesPrinted].amount;
        this._movementOfArticleService.updateMovementOfArticle(this.kitchenArticlesToPrint[this.kitchenArticlesPrinted]).subscribe(function (result) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!result.movementOfArticle) {
                    if (result.message && result.message !== '')
                        this.showMessage(result.message, 'info', true);
                }
                else {
                    this.kitchenArticlesPrinted++;
                    if (this.kitchenArticlesPrinted < this.kitchenArticlesToPrint.length) {
                        this.updateMovementOfArticlePrintedKitchen();
                    }
                    else {
                        if (this.voucherArticlesToPrint.length > 0) {
                            this.typeOfOperationToPrint = 'voucher';
                            this.distributeImpressions(null);
                        }
                        else {
                            if (this.isCharge) {
                                this.openModal('charge');
                            }
                            else {
                                this.backFinal();
                            }
                        }
                    }
                }
                this.loading = false;
                return [2 /*return*/];
            });
        }); }, function (error) {
            _this.showMessage(error._body, 'danger', false);
            _this.loading = false;
        });
    };
    AddSaleOrderComponent.prototype.updateMovementOfArticlePrintedVoucher = function () {
        var _this = this;
        this.loading = true;
        this.voucherArticlesToPrint[this.voucherArticlesPrinted].printed = this.voucherArticlesToPrint[this.voucherArticlesPrinted].amount;
        this._movementOfArticleService.updateMovementOfArticle(this.voucherArticlesToPrint[this.voucherArticlesPrinted]).subscribe(function (result) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!result.movementOfArticle) {
                    if (result.message && result.message !== '')
                        this.showMessage(result.message, 'info', true);
                }
                else {
                    this.voucherArticlesPrinted++;
                    if (this.voucherArticlesPrinted < this.voucherArticlesToPrint.length) {
                        this.updateMovementOfArticlePrintedVoucher();
                    }
                    else {
                        if (this.isCharge) {
                            this.openModal('charge');
                        }
                        else {
                            this.backFinal();
                        }
                    }
                }
                this.loading = false;
                return [2 /*return*/];
            });
        }); }, function (error) {
            _this.showMessage(error._body, 'danger', false);
            _this.loading = false;
        });
    };
    AddSaleOrderComponent.prototype.countPrinters = function () {
        var numberOfPrinters = 0;
        this.printersAux = new Array();
        if (this.printers != undefined) {
            for (var _i = 0, _a = this.printers; _i < _a.length; _i++) {
                var printer = _a[_i];
                if (this.typeOfOperationToPrint === 'charge' && printer.printIn === printer_1.PrinterPrintIn.Counter) {
                    this.printersAux.push(printer);
                    numberOfPrinters++;
                }
                else if (this.typeOfOperationToPrint === 'bill' && printer.printIn === printer_1.PrinterPrintIn.Counter) {
                    this.printersAux.push(printer);
                    numberOfPrinters++;
                }
                else if (this.typeOfOperationToPrint === 'bar' && printer.printIn === printer_1.PrinterPrintIn.Bar) {
                    this.printersAux.push(printer);
                    numberOfPrinters++;
                }
                else if (this.typeOfOperationToPrint === 'kitchen' && printer.printIn === printer_1.PrinterPrintIn.Kitchen) {
                    this.printersAux.push(printer);
                    numberOfPrinters++;
                }
                else if (this.typeOfOperationToPrint === 'voucher' && printer.printIn === printer_1.PrinterPrintIn.Voucher) {
                    this.printersAux.push(printer);
                    numberOfPrinters++;
                }
            }
        }
        else {
            numberOfPrinters = 0;
        }
        return numberOfPrinters;
    };
    AddSaleOrderComponent.prototype.distributeImpressions = function (printer) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.printerSelected = printer;
                        return [4 /*yield*/, this.getUser().then(function (user) { return __awaiter(_this, void 0, void 0, function () {
                                var _i, _a, element;
                                var _this = this;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (!user) return [3 /*break*/, 4];
                                            if (!(user.printers && user.printers.length > 0)) return [3 /*break*/, 1];
                                            for (_i = 0, _a = user.printers; _i < _a.length; _i++) {
                                                element = _a[_i];
                                                if (element && element.printer && element.printer.printIn === printer_1.PrinterPrintIn.Bar && this.typeOfOperationToPrint === 'bar') {
                                                    this.printerSelected = element.printer;
                                                }
                                                if (element && element.printer && element.printer.printIn === printer_1.PrinterPrintIn.Counter && (this.typeOfOperationToPrint === 'charge' || this.typeOfOperationToPrint === 'bill')) {
                                                    this.printerSelected = element.printer;
                                                }
                                                if (element && element.printer && element.printer.printIn === printer_1.PrinterPrintIn.Kitchen && this.typeOfOperationToPrint === 'kitchen') {
                                                    this.printerSelected = element.printer;
                                                }
                                                if (element && element.printer && element.printer.printIn === printer_1.PrinterPrintIn.Voucher && this.typeOfOperationToPrint === 'voucher') {
                                                    this.printerSelected = element.printer;
                                                }
                                            }
                                            return [3 /*break*/, 3];
                                        case 1:
                                            if (!!this.printerSelected) return [3 /*break*/, 3];
                                            return [4 /*yield*/, this.getPrinters().then(function (printers) {
                                                    if (printers) {
                                                        _this.printers = printers;
                                                        for (var _i = 0, _a = _this.printers; _i < _a.length; _i++) {
                                                            var element = _a[_i];
                                                            if (element && element.printIn === printer_1.PrinterPrintIn.Bar && _this.typeOfOperationToPrint === 'bar') {
                                                                _this.printerSelected = element;
                                                            }
                                                            if (element && element.printIn === printer_1.PrinterPrintIn.Kitchen && _this.typeOfOperationToPrint === 'kitchen') {
                                                                _this.printerSelected = element;
                                                            }
                                                            if (element && element.printIn === printer_1.PrinterPrintIn.Voucher && _this.typeOfOperationToPrint === 'voucher') {
                                                                _this.printerSelected = element;
                                                            }
                                                            if (element && element.printIn === printer_1.PrinterPrintIn.Counter && (_this.typeOfOperationToPrint === 'charge' || _this.typeOfOperationToPrint === 'bill')) {
                                                                _this.printerSelected = element;
                                                            }
                                                        }
                                                    }
                                                })];
                                        case 2:
                                            _b.sent();
                                            _b.label = 3;
                                        case 3: return [3 /*break*/, 5];
                                        case 4:
                                            this.showToast(null, "info", "Debe iniciar sesión");
                                            _b.label = 5;
                                        case 5:
                                            switch (this.typeOfOperationToPrint) {
                                                case 'charge':
                                                    if (printer.type === printer_1.PrinterType.PDF) {
                                                        this.openModal("print");
                                                    }
                                                    break;
                                                case 'kitchen':
                                                    this.openModal("printKitchen");
                                                    break;
                                                case 'bar':
                                                    this.openModal("printBar");
                                                    break;
                                                case 'voucher':
                                                    this.openModal("printVoucher");
                                                    break;
                                                default:
                                                    this.showMessage("No se reconoce la operación de impresión.", 'danger', false);
                                                    break;
                                            }
                                            return [2 /*return*/];
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
    AddSaleOrderComponent.prototype.getUser = function () {
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
    AddSaleOrderComponent.prototype.assignLetter = function () {
        if (this.transaction.type.fixedLetter && this.transaction.type.fixedLetter !== '') {
            this.transaction.letter = this.transaction.type.fixedLetter.toUpperCase();
        }
        else {
            if (this.config['country'] === 'AR') {
                if (this.config['companyVatCondition'] && this.config['companyVatCondition'].description === "Responsable Inscripto") {
                    if (this.transaction.company &&
                        this.transaction.company.vatCondition) {
                        this.transaction.letter = this.transaction.company.vatCondition.transactionLetter;
                    }
                    else {
                        this.transaction.letter = "B";
                    }
                }
                else if (this.config['companyVatCondition'] && this.config['companyVatCondition'].description === "Monotributista") {
                    this.transaction.letter = "C";
                }
                else {
                    this.transaction.letter = "X";
                }
            }
        }
        this.loading = true;
    };
    AddSaleOrderComponent.prototype.getTransports = function () {
        var _this = this;
        this.loading = true;
        this._transportService.getTransports({ name: 1, operationType: 1 }, // PROJECT
        { operationType: { $ne: "D" } }, // MATCH
        { name: 1 }, // SORT
        {}, // GROUP
        0, // LIMIT
        0 // SKIP
        ).subscribe(function (result) {
            if (result && result.transports && result.transports.length > 0) {
                _this.transports = result.transports;
            }
            _this.loading = false;
        }, function (error) {
            _this.showMessage(error._body, 'danger', false);
            _this.loading = false;
        });
    };
    AddSaleOrderComponent.prototype.assignTransactionNumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            var _this = this;
            return __generator(this, function (_a) {
                this.loading = true;
                query = "where= \"type\":\"" + this.transaction.type._id + "\",\n                    \"origin\":" + this.transaction.origin + ",\n                    \"letter\":\"" + this.transaction.letter + "\",\n                    \"_id\":{\"$ne\":\"" + this.transaction._id + "\"}\n                    &sort=\"number\":-1\n                    &limit=1";
                this._transactionService.getTransactions(query).subscribe(function (result) { return __awaiter(_this, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                this.loading = false;
                                if (!result.transactions) {
                                    this.transaction.number = 1;
                                }
                                else {
                                    this.transaction.number = result.transactions[0].number + 1;
                                }
                                _a = this;
                                return [4 /*yield*/, this.updateTransaction()];
                            case 1:
                                _a.transaction = _b.sent();
                                this.finish();
                                return [2 /*return*/];
                        }
                    });
                }); }, function (error) {
                    _this.loading = false;
                    _this.showMessage(error._body, 'danger', false);
                });
                return [2 /*return*/];
            });
        });
    };
    AddSaleOrderComponent.prototype.checkInformationCancellation = function () {
        var _this = this;
        if (this.canceledTransactions && this.canceledTransactions.typeId) {
            this.loading = true;
            var query = "where= \"type\":\"" + this.canceledTransactions.typeId + "\",\n            \"origin\":" + this.canceledTransactions.origin + ",\n            \"letter\":\"" + this.canceledTransactions.letter + "\",\n            \"company\":\"" + this.transaction.company._id + "\",\n            \"operationType\":{\"$ne\":\"D\"}\n            &limit=1";
            this._transactionService.getTransactions(query).subscribe(function (result) {
                _this.loading = false;
                if (!result.transactions) {
                    _this.canceledTransactionsAFIP = null;
                    _this.showMessage('Debe informar un comprobante válido', 'info', false);
                }
                else {
                    var code = void 0;
                    for (var _i = 0, _a = result.transactions[0].type.codes; _i < _a.length; _i++) {
                        var cod = _a[_i];
                        if (cod.letter === _this.canceledTransactions.letter) {
                            code = cod.code;
                        }
                    }
                    if (code) {
                        _this.canceledTransactionsAFIP = {
                            Tipo: code,
                            PtoVta: _this.canceledTransactions.origin,
                            Nro: _this.canceledTransactions.number
                        };
                    }
                }
            }, function (error) {
                _this.canceledTransactionsAFIP = null;
                _this.loading = false;
                _this.showMessage(error._body, 'danger', false);
            });
        }
        else {
            this.showMessage('Debe informar todos los campos del comprobante a informar', 'info', true);
        }
    };
    AddSaleOrderComponent.prototype.setPrintBill = function () {
        if (this.movementsOfArticles && this.movementsOfArticles.length !== 0) {
            this.typeOfOperationToPrint = 'bill';
            this.openModal('printers');
        }
        else {
            this.showMessage("No existen productos en el pedido.", 'info', true);
            this.loading = false;
        }
    };
    AddSaleOrderComponent.prototype.filterArticles = function () {
        this.listArticlesComponent.filterArticle = this.filterArticle;
        if (this.filterArticle && this.filterArticle !== '' && this.filterArticle.slice(0, 1) === '*') {
            this.listArticlesComponent.filterItem(this.lastMovementOfArticle.article, this.categorySelected);
        }
        else {
            this.listArticlesComponent.filterItem(null, this.categorySelected);
        }
        if (!this.filterArticle || this.filterArticle === '') {
            this.showCategories();
        }
    };
    AddSaleOrderComponent.prototype.showCategories = function () {
        this.categorySelected = null;
        if (!(this.filterArticle && this.filterArticle !== '' && this.filterArticle.slice(0, 1) === '*')) {
            this.filterArticle = '';
        }
        this.listCategoriesComponent.areCategoriesVisible = true;
        this.listArticlesComponent.areArticlesVisible = false;
        this.listArticlesComponent.filterArticle = this.filterArticle;
        if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
            this.listCategoriesComponent.ngOnInit();
            this.focusEvent.emit(true);
        }
    };
    AddSaleOrderComponent.prototype.showArticles = function (category) {
        if (category) {
            this.categorySelected = category;
            this.listArticlesComponent.filterItem(null, this.categorySelected);
            this.listArticlesComponent.hideMessage();
        }
        this.listCategoriesComponent.areCategoriesVisible = false;
        this.listArticlesComponent.areArticlesVisible = true;
        if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
            this.focusEvent.emit(true);
        }
    };
    AddSaleOrderComponent.prototype.showMessage = function (message, type, dismissible) {
        this.alertMessage = message;
        this.alertConfig.type = type;
        this.alertConfig.dismissible = dismissible;
    };
    AddSaleOrderComponent.prototype.hideMessage = function () {
        this.alertMessage = '';
    };
    AddSaleOrderComponent.prototype.showToast = function (result, type, title, message) {
        if (result) {
            if (result.status === 0) {
                type = 'info';
                title = 'el servicio se encuentra en mantenimiento, inténtelo nuevamente en unos minutos';
            }
            else if (result.status === 200) {
                type = 'success';
                title = result.message;
            }
            else if (result.status >= 500) {
                type = 'danger';
                title = (result.error && result.error.message) ? result.error.message : result.message;
            }
            else {
                type = 'info';
                title = (result.error && result.error.message) ? result.error.message : result.message;
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
    AddSaleOrderComponent.prototype.padNumber = function (n, length) {
        var n = n.toString();
        while (n.length < length)
            n = "0" + n;
        return n;
    };
    __decorate([
        core_1.ViewChild('contentPrinters', { static: true })
    ], AddSaleOrderComponent.prototype, "contentPrinters");
    __decorate([
        core_1.ViewChild('contentMessage', { static: true })
    ], AddSaleOrderComponent.prototype, "contentMessage");
    __decorate([
        core_1.ViewChild('contentChangeDate', { static: true })
    ], AddSaleOrderComponent.prototype, "contentChangeDate");
    __decorate([
        core_1.ViewChild('contentOptionalAFIP', { static: true })
    ], AddSaleOrderComponent.prototype, "contentChangeOptionalAFIP");
    __decorate([
        core_1.ViewChild('contentChangeObservation', { static: true })
    ], AddSaleOrderComponent.prototype, "contentChangeObservation");
    __decorate([
        core_1.ViewChild('contentChangeQuotation', { static: true })
    ], AddSaleOrderComponent.prototype, "contentChangeQuotation");
    __decorate([
        core_1.ViewChild('contentInformCancellation', { static: true })
    ], AddSaleOrderComponent.prototype, "contentInformCancellation");
    __decorate([
        core_1.ViewChild('containerMovementsOfArticles', { static: true })
    ], AddSaleOrderComponent.prototype, "containerMovementsOfArticles");
    __decorate([
        core_1.ViewChild('containerTaxes', { static: true })
    ], AddSaleOrderComponent.prototype, "containerTaxes");
    __decorate([
        core_1.ViewChild(list_articles_pos_component_1.ListArticlesPosComponent, { static: false })
    ], AddSaleOrderComponent.prototype, "listArticlesComponent");
    __decorate([
        core_1.ViewChild(list_categories_pos_component_1.ListCategoriesPosComponent, { static: false })
    ], AddSaleOrderComponent.prototype, "listCategoriesComponent");
    AddSaleOrderComponent = __decorate([
        core_1.Component({
            selector: 'app-add-sale-order',
            templateUrl: './add-sale-order.component.html',
            styleUrls: ['./add-sale-order.component.scss'],
            providers: [ng_bootstrap_1.NgbAlertConfig, date_format_pipe_1.DateFormatPipe, round_number_pipe_1.RoundNumberPipe, translate_me_1.TranslateMePipe],
            encapsulation: core_1.ViewEncapsulation.None
        })
    ], AddSaleOrderComponent);
    return AddSaleOrderComponent;
}());
exports.AddSaleOrderComponent = AddSaleOrderComponent;
