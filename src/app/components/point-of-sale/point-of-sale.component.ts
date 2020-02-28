import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, Input, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { Room } from './../../models/room';
import { Printer, PrinterPrintIn } from './../../models/printer';
import { Transaction, TransactionState } from './../../models/transaction';
import { TransactionType, TransactionMovement, StockMovement } from './../../models/transaction-type';

import { RoomService } from './../../services/room.service';
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { PrinterService } from './../../services/printer.service';

import { AddTransactionComponent } from './../add-transaction/add-transaction.component';
import { PrintComponent } from '../print/print/print.component';
import { DeleteTransactionComponent } from './../delete-transaction/delete-transaction.component';
import { AddMovementOfCashComponent } from './../add-movement-of-cash/add-movement-of-cash.component';
import { SelectEmployeeComponent } from './../select-employee/select-employee.component';
import { ViewTransactionComponent } from './../../components/view-transaction/view-transaction.component';
import { CashBoxComponent } from '../cash-box/cash-box.component';
import { EmployeeType } from 'app/models/employee-type';
import { EmployeeTypeService } from 'app/services/employee-type.service';
import { Currency } from 'app/models/currency';
import { CurrencyService } from 'app/services/currency.service';
import { Config } from 'app/app.config';
import { CashBox, CashBoxState } from 'app/models/cash-box';
import { CashBoxService } from 'app/services/cash-box.service';
import { Company, CompanyType } from 'app/models/company';
import { Table, TableState } from 'app/models/table';
import { TableService } from 'app/services/table.service';
import { AuthService } from 'app/services/auth.service';
import { DepositService } from 'app/services/deposit.service';
import { Deposit } from 'app/models/deposit';
import { BranchService } from 'app/services/branch.service';
import { Branch } from 'app/models/branch';
import { SelectBranchComponent } from '../select-branch/select-branch.component';
import { Origin } from 'app/models/origin';
import { OriginService } from 'app/services/origin.service';
import { SelectOriginComponent } from '../select-origin/select-origin.component';
import { SelectDepositComponent } from '../select-deposit/select-deposit.component';
import { ConfigService } from 'app/services/config.service';
import { PrintTransactionTypeComponent } from '../print/print-transaction-type/print-transaction-type.component';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { SelectCompanyComponent } from '../select-company/select-company.component';
import { User } from 'app/models/user';
import { UserService } from 'app/services/user.service';

@Component({
	selector: 'app-point-of-sale',
	templateUrl: './point-of-sale.component.html',
	styleUrls: ['./point-of-sale.component.scss'],
	providers: [NgbAlertConfig],
	encapsulation: ViewEncapsulation.None
})

export class PointOfSaleComponent implements OnInit {

	public rooms: Room[] = new Array();
	public roomSelected: Room;
	public transactions: Transaction[] = new Array();
	public transactionStates: string[];
	public validTransactionStates: string[] = [
		TransactionState.Delivered.toString(),
		TransactionState.Open.toString(),
		TransactionState.Pending.toString(),
		TransactionState.Sent.toString(),
		TransactionState.Preparing.toString(),
		TransactionState.Packing.toString()
	];
	public originsToFilter: number[];
	public transactionTypes: TransactionType[];
	public transactionMovement: TransactionMovement;
	public userType: string;
	public propertyTerm: string;
	public orderTerm: string[] = ['startDate'];
	public posType: string;
	public alertMessage: string = '';
	public areFiltersVisible: boolean = false;
	public loading: boolean = false;
	public itemsPerPage = 10;
	public printers: Printer[];
	@ViewChild('contentPrinters', { static: true }) contentPrinters: ElementRef;
	@Output() eventRefreshCurrentAccount: EventEmitter<any> = new EventEmitter<any>();
	public transaction: Transaction;
	public printerSelected: Printer;
	public employeeTypeSelected: EmployeeType;
	public tableSelected: Table;
	public config: Config;
	public transactionTypeId: string;
	private subscription: Subscription = new Subscription();
	public identity: User;
	public user: User;

	// CAMPOS TRAIDOS DE LA CUENTA CTE.
	@Input() company: Company;
	public companyType: CompanyType;
	@Input() totalPrice: number;

	constructor(
		public alertConfig: NgbAlertConfig,
		private _roomService: RoomService,
		private _transactionService: TransactionService,
		private _transactionTypeService: TransactionTypeService,
		private _printerService: PrinterService,
		private _employeeTypeService: EmployeeTypeService,
		private _depositService: DepositService,
		private _branchService: BranchService,
		private _router: Router,
		private _route: ActivatedRoute,
		private _modalService: NgbModal,
		private _currencyService: CurrencyService,
		private _cashBoxService: CashBoxService,
		private _tableService: TableService,
		private _authService: AuthService,
		private _originService: OriginService,
		private _configService: ConfigService,
		private _userService: UserService
	) {
		this.roomSelected = new Room();
		this.transactionTypes = new Array();
		this.originsToFilter = new Array();
	}

	async ngOnInit() {

		let pathLocation: string[] = this._router.url.split('/');
		this.userType = pathLocation[1].split('?')[0];
		this.posType = pathLocation[2].split('?')[0];

		await this._configService.getConfig.subscribe(
			config => {
				this.config = config;
			}
		);
		await this._authService.getIdentity.subscribe(
			identity => {
				this.identity = identity;
			}
		);
		await this.getUser().then(
			async user => {
				if (user) {
					this.user = user;
				} else {
					this.showMessage("Debe volver a iniciar sesión", "danger", false);
				}
			}
		);
		this.processParams();
		this.initInterval();
	}

	public initInterval(): void {
		setInterval(() => {
			if (this.posType === 'delivery') {
				this.refresh();
			}
		}, 5000);
	}

	private processParams(): void {
		let isLoadRefresh: boolean = false;
		this._route.queryParams.subscribe(params => {
			this.companyType = params['companyType'];
			this.transactionTypeId = params['automaticCreation'];
			this.transactionStates = new Array();
			// RECORRER POS INSERTADOS
			if (params['origins']) {
				for (let origin of params['origins'].split(',')) {
					this.originsToFilter.push(parseInt(origin));
				}
			}
			// RECORRER ESTADOS INSERTADOS
			Object.keys(params).map(key => {
				if (this.posType === 'delivery') {
					for (const s of params[key].split(',')) {
						if (this.validTransactionStates.includes(s)) {
							this.transactionStates.push(s);

						}
					}
					isLoadRefresh = true;
					this.refresh();
				}
			});
			if (this.posType === 'delivery' && this.transactionStates.length === 0) {
				this.transactionStates.push(TransactionState.Open.toString());
				isLoadRefresh = true;
				this.refresh();
			}

			if (!isLoadRefresh) {
				this.refresh();
			}
		});
	}

	public getUser(): Promise<User> {

		return new Promise<User>((resolve, reject) => {

			var identity: User = JSON.parse(sessionStorage.getItem('user'));
			var user;
			if (identity) {
				this._userService.getUser(identity._id).subscribe(
					result => {
						if (result && result.user) {
							resolve(result.user)
						} else {
							this.showMessage("Debe volver a iniciar sesión", "danger", false);
						}
					},
					error => {
						this.showMessage(error._body, "danger", false);
					}
				)
			}
		});
	}

	public getBranches(match: {} = {}): Promise<Branch[]> {

		return new Promise<Branch[]>((resolve, reject) => {

			this.subscription.add(this._branchService.getBranches(
				{}, // PROJECT
				match, // MATCH
				{ number: 1 }, // SORT
				{}, // GROUP
				0, // LIMIT
				0 // SKIP
			).subscribe(
				result => {
					if (result && result.branches) {
						resolve(result.branches);
					} else {
						resolve(null);
					}
				},
				error => {
					this.showMessage(error._body, 'danger', false);
					resolve(null);
				}
			));
		});
	}

	public getDeposits(match: {} = {}): Promise<Deposit[]> {

		return new Promise<Deposit[]>((resolve, reject) => {

			this.subscription.add(this._depositService.getDepositsV2(
				{}, // PROJECT
				match, // MATCH
				{ name: 1 }, // SORT
				{}, // GROUP
				0, // LIMIT
				0 // SKIP
			).subscribe(
				result => {
					if (result.deposits) {
						resolve(result.deposits);
					} else {
						resolve(null);
					}
				},
				error => {
					this.showMessage(error._body, 'danger', false);
					resolve(null);
				}
			));
		});
	}

	public getOrigins(match: {} = {}): Promise<Origin[]> {

		return new Promise<Origin[]>((resolve, reject) => {

			this.subscription.add(this._originService.getOrigins(
				{}, // PROJECT
				match, // MATCH
				{ number: 1 }, // SORT
				{}, // GROUP
				0, // LIMIT
				0 // SKIP
			).subscribe(
				result => {
					if (result.origins) {
						resolve(result.origins);
					} else {
						resolve(null);
					}
				},
				error => {
					this.showMessage(error._body, 'danger', false);
					resolve(null);
				}
			));
		});
	}

	public getCurrencies(): Promise<Currency[]> {

		return new Promise<Currency[]>((resolve, reject) => {

			this.subscription.add(this._currencyService.getCurrencies('sort="name":1').subscribe(
				result => {
					if (!result.currencies) {
						resolve(null);
					} else {
						resolve(result.currencies);
					}
				},
				error => {
					this.showMessage(error._body, "danger", false);
					resolve(null);
				}
			));
		});
	}

	public getPrinters(): Promise<Printer[]> {

		return new Promise<Printer[]>(async (resolve, reject) => {

			this.subscription.add(this._printerService.getPrinters().subscribe(
				result => {
					if (!result.printers) {
						if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
						resolve(null);
					} else {
						resolve(result.printers);
					}
				},
				error => {
					this.showMessage(error._body, 'danger', false);
					resolve(null);
				}
			));
		});
	}

	public getTransactionTypes(query?: string): Promise<TransactionType[]> {

		return new Promise<TransactionType[]>((resolve, reject) => {

			this.loading = true;

			this.subscription.add(this._transactionTypeService.getTransactionTypes(query).subscribe(
				result => {
					this.loading = false;
					if (!result.transactionTypes) {
						resolve(null);
					} else {
						resolve(result.transactionTypes);
					}
				},
				error => {
					this.loading = false;
					this.showMessage(error._body, 'danger', false);
					resolve(null);
				}
			));
		});
	}

	public getRooms(): void {

		this.loading = true;

		this.subscription.add(this._roomService.getRooms().subscribe(
			result => {
				if (!result.rooms) {
					if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
					this.loading = false;
				} else {
					this.hideMessage();
					this.loading = false;
					this.rooms = result.rooms;

					if (this.roomSelected._id === undefined) {
						this.roomSelected = this.rooms[0];
					} else {
						for (let room of this.rooms) {
							if (this.roomSelected._id === room._id) {
								this.roomSelected = room;
							}
						}
					}
				}
			},
			error => {
				this.showMessage(error._body, 'danger', false);
				this.loading = false;
			}
		));
	}

	async refresh() {
		let pathLocation: string[] = this._router.url.split('/');

		if (this.posType === 'mostrador') {
			if (pathLocation[3] === 'venta') {
				this.transactionMovement = TransactionMovement.Sale;
			} else if (pathLocation[3] === 'compra') {
				this.transactionMovement = TransactionMovement.Purchase;
			} else if (pathLocation[3] === 'stock') {
				this.transactionMovement = TransactionMovement.Stock;
			} else if (pathLocation[3] === 'fondo') {
				this.transactionMovement = TransactionMovement.Money;
			} else {
				this.transactionMovement = TransactionMovement.Sale;
			}
		} else if (this.posType === "cuentas-corrientes") {
			if (this.companyType === CompanyType.Client) {
				this.transactionMovement = TransactionMovement.Sale;
			} else {
				this.transactionMovement = TransactionMovement.Purchase;
			}
		} else {
			this.transactionMovement = TransactionMovement.Sale;
		}

		if (!this.transaction && this.transactionTypeId && this.transactionTypeId !== '') {
			this.getTransactionTypes(`where="_id":"${this.transactionTypeId}"`).then(
				transactionTypes => {
					if (transactionTypes) {
						this.addTransaction(transactionTypes[0]);
					}
				}
			);
		} else {
			if (this.posType === 'resto') {
				this.roomSelected._id = pathLocation[4];
				this.getRooms();
			} else if (this.posType === "delivery") {
				await this.getTransactionTypes('where="$or":[{"cashOpening":true},{"cashClosing":true}]').then(
					transactionTypes => {
						if (transactionTypes) {
							this.transactionTypes = transactionTypes;
						}
					}
				);
				let query = {};

				if (this.originsToFilter && this.originsToFilter.length > 0) {
					query['origin'] = { $in: this.originsToFilter };
				}
				query['state'] = { $in: this.transactionStates };
				query['operationType'] = { $ne: 'D' };

				await this.getTransactionsV2(query).then(
					transactions => {
						this.hideMessage();
						this.transactions = transactions;
					}
				);
			} else if (this.posType === 'pedidos-web') {
				let query = {
					state: TransactionState.Closed,
					madein: this.posType,
					balance: { $gt: 0 },
					operationType: { $ne: 'D' },
					"type.transactionMovement": this.transactionMovement,
				}
				await this.getTransactionsV2(query).then(
					transactions => {
						this.hideMessage();
						this.transactions = transactions;
					}
				);
			} else if (this.posType === 'mostrador') {


				let where

				if (this.user.branch && this.user.branch._id) {
					where = 'where="level":{ "$lt" : "' + this.user.level + '"},"$or":[{"branch":{ "$exists": false}},{"branch":null},{"branch":"' + this.user.branch._id + '"}],"transactionMovement":"' + this.transactionMovement + '","allowAPP":false'
				} else {
					where = 'where="level":{ "$lt" : "' + this.user.level + '"},"transactionMovement":"' + this.transactionMovement + '","allowAPP":false'
				}

				await this.getTransactionTypes(where).then(
					transactionTypes => {
						if (transactionTypes) {
							this.transactionTypes = transactionTypes;
						}
					}
				);

				let query = {
					state: { $in: [TransactionState.Open, TransactionState.Pending] },
					madein: this.posType,
					"type.transactionMovement": this.transactionMovement,
				};

				if (this.identity.origin) {
					query['branchOrigin'] = { $oid: this.identity.origin.branch._id };
				}

				query['type.level'] = { $lt: this.user.level };
				query['operationType'] = { $ne: 'D' };

				await this.getTransactionsV2(query).then(
					transactions => {
						this.hideMessage();
						this.transactions = transactions;
					}
				);
			} else if (this.posType === "cuentas-corrientes") {

				let where

				if (this.user.branch && this.user.branch._id) {
					where = 'where="level":{ "$lt" : "' + this.user.level + '"},"$or":[{"branch":{ "$exists": false}},{"branch":null},{"branch":"' + this.user.branch._id + '"}],"transactionMovement":"' + this.transactionMovement + '"'
				} else {
					where = 'where="level":{ "$lt" : "' + this.user.level + '"},"transactionMovement":"' + this.transactionMovement + '"'
				}

				await this.getTransactionTypes(where).then(
					transactionTypes => {
						if (transactionTypes) {
							this.transactionTypes = transactionTypes;
						}
					}
				);
				this.eventRefreshCurrentAccount.emit();
			}
		}
	}

	public async initTransactionByType(op: string, openPending: boolean = false) {

		let query = `where="${op}":true`;

		await this.getTransactionTypes(query).then(
			async transactionTypes => {
				if (transactionTypes && transactionTypes.length > 0) {
					if (openPending) {
						let query = `where="$and":[{"state":{"$ne": "${TransactionState.Closed}"}},{"state":{"$ne":"${TransactionState.Canceled}"}},`

						if (this.identity.origin) {
							query += `{"branch":"${this.identity.origin.branch._id}"},`;
						}

						query += `{"madein":"${this.posType}"},{"type":"${transactionTypes[0]._id}"},{"$or":[{"table":{"$exists":false}},{"table":null}]}]&limit=1`;
						await this.getTransactions(query).then(
							transactions => {
								if (transactions && transactions.length > 0) {
									this.transaction = transactions[0];
									this.tableSelected = this.transaction.table;
									this.nextStepTransaction();
								} else {
									this.addTransaction(transactionTypes[0]);
								}
							}
						);
					} else {
						this.addTransaction(transactionTypes[0]);
					}
				} else {
					this.showMessage('Es necesario configurar el tipo de transacción.', 'info', true);
				}
			}
		);
	}

	async addTransaction(type: TransactionType) {

		this.transaction = new Transaction();
		this.transaction.type = type;
		this.transaction.table = this.tableSelected;

		if (this.transaction.type.fixedLetter && this.transaction.type.fixedLetter !== '') {
			this.transaction.letter = this.transaction.type.fixedLetter.toUpperCase();
		}

		if (this.posType === 'cuentas-corrientes') {
			if (this.transactionMovement === TransactionMovement.Sale) {
				this.totalPrice *= -1;
			}

			if (this.totalPrice < 0) {
				this.totalPrice = 0;
			}

			this.transaction.totalPrice = this.totalPrice;
		}

		if (!type.cashOpening && !type.cashClosing) {

			if (Config.modules.money && this.transaction.type.cashBoxImpact) {
				let query = 'where="state":"' + CashBoxState.Open + '"';
				if (this.config.cashBox.perUser) {
					if (this.identity.employee) {
						query += ',"employee":"' + this.identity.employee._id + '"';
					}
				} else if (this.identity.cashBoxType) {
					query += ',"type":"' + this.identity.cashBoxType._id + '"';
				} else {
					query += ',"type":null';
				}
				query += '&sort="number":-1&limit=1';
				await this.getCashBoxes(query).then(
					async cashBoxes => {
						if (cashBoxes) {
							this.transaction.cashBox = cashBoxes[0];
							this.nextStepTransaction();
						} else {
							await this.getTransactionTypes('where="cashOpening":true').then(
								transactionTypes => {
									if (transactionTypes && transactionTypes.length > 0) {
										this.transaction.type = transactionTypes[0];
										this.openModal('cash-box');
									} else {
										this.showMessage("Debe configurar un tipo de transacción para realizar la apertura de caja.", "info", true);
									}
								}
							);
						}
					}
				);
			} else {
				this.nextStepTransaction();
			}
		} else {
			this.openModal('cash-box');
		}
	}

	public getCashBoxes(query?: string): Promise<CashBox[]> {

		return new Promise<CashBox[]>((resolve, reject) => {

			this._cashBoxService.getCashBoxes(query).subscribe(
				result => {
					if (!result.cashBoxes) {
						resolve(null);
					} else {
						resolve(result.cashBoxes);
					}
				},
				error => {
					this.showMessage(error._body, 'danger', false);
					resolve(null);
				}
			);
		});
	}

	async assignCurrency(): Promise<boolean> {

		return new Promise<boolean>(async (resolve, reject) => {

			await this.getCurrencies().then(
				currencies => {
					if (currencies && Config.currency) {
						this.transaction.currency = Config.currency;
					}
					if (this.transaction.quotation === undefined ||
						this.transaction.quotation === null) {
						if (currencies && currencies.length > 0) {
							for (let currency of currencies) {
								if (Config.currency && currency._id !== Config.currency._id) {
									this.transaction.quotation = currency.quotation;
								}
							}
						} else {
							this.transaction.quotation = 1;
						}
					}
					resolve(true);
				}
			);
		});
	}

	async assignBranch(): Promise<boolean> {

		return new Promise<boolean>(async (resolve, reject) => {

			if (!this.transaction.branchDestination || !this.transaction.branchOrigin) {

				// CONSULTAMOS SI TIENE PUNTO DE VENTA ASIGNADO AL USUARIO
				if (this.identity.origin) {
					// PREDOMINIA PUNTO DE VENTA DEL TIPO DE TRANSACCION
					if (this.transaction.type.fixedOrigin && this.transaction.type.fixedOrigin !== 0) {
						this.transaction.origin = this.transaction.type.fixedOrigin;
					} else {
						if (this.transaction.type.transactionMovement !== TransactionMovement.Purchase) {
							this.transaction.origin = this.identity.origin.number;
						}
					}
					// ASIGNAMOS A LA TRANSACCIÓN LA SUCURSAL DEL PV DEL USUARIO
					this.transaction.branchOrigin = this.identity.origin.branch;
					this.transaction.branchDestination = this.identity.origin.branch;
					if (!this.transaction.type.fixedOrigin || this.transaction.type.fixedOrigin === 0 && this.transaction.origin === 0) {
						let originAssigned = await this.assignOrigin();
						resolve(originAssigned);
					} else {
						resolve(true);
					}
					let depositAssigned = await this.assignDeposit();
					if (depositAssigned) {
						if (!this.transaction.type.fixedOrigin || this.transaction.type.fixedOrigin === 0 && this.transaction.origin === 0) {
							let originAssigned = await this.assignOrigin();
							resolve(originAssigned);
						} else {
							resolve(depositAssigned);
						}
					} else {
						resolve(depositAssigned);
					}
				} else {
					// SI NO TIENE ASIGNADO PV
					if (this.transaction.type.fixedOrigin && this.transaction.type.fixedOrigin !== 0) {
						this.transaction.origin = this.transaction.type.fixedOrigin;
					}

					// CONSULTAMOS LAS SUCURSALES
					if (!this.transaction.branchDestination || !this.transaction.branchOrigin) {
						await this.getBranches({ operationType: { $ne: 'D' } }).then(
							async branches => {
								if (branches && branches.length > 0) {
									if (branches.length > 1) {
										// SOLICITAR SUCURSAL
										this.openModal('select-branch');
									} else {
										// ASIGNAR ÚNICA SUCURSAL
										let defaultBranch = branches[0];
										this.transaction.branchOrigin = defaultBranch;
										this.transaction.branchDestination = defaultBranch;
										if (!this.transaction.type.fixedOrigin || this.transaction.type.fixedOrigin === 0 && this.transaction.origin === 0) {
											let originAssigned = await this.assignOrigin();
											resolve(originAssigned);
										} else {
											resolve(true);
										}
										let depositAssigned = await this.assignDeposit();
										if (depositAssigned) {
											if (!this.transaction.type.fixedOrigin || this.transaction.type.fixedOrigin === 0 && this.transaction.origin === 0) {
												let originAssigned = await this.assignOrigin();
												resolve(originAssigned);
											} else {
												resolve(depositAssigned);
											}
										} else {
											resolve(depositAssigned);
										}
									}
								} else {
									this.showMessage("Debe crear un sucursal para poder poder crear una transacción", "info", true);
									resolve(false);
								}
							}
						);
					}
				}

			} else if (!this.transaction.depositDestination || !this.transaction.depositOrigin) {
				let depositAssigned = await this.assignDeposit();
				if (depositAssigned) {
					if (!this.transaction.type.fixedOrigin || this.transaction.type.fixedOrigin === 0 && this.transaction.origin === 0) {
						let originAssigned = await this.assignOrigin();
						resolve(originAssigned);
					} else {
						resolve(depositAssigned);
					}
				} else {
					resolve(depositAssigned);
				}
			} else if (!this.transaction.type.fixedOrigin || this.transaction.type.fixedOrigin === 0 && this.transaction.origin === 0) {
				let originAssigned = await this.assignOrigin();
				resolve(originAssigned);
			} else {
				resolve(true);
			}
		});
	}

	async assignDeposit(): Promise<boolean> {
		return new Promise<boolean>(async (resolve, reject) => {
			if (!this.transaction.depositDestination || !this.transaction.depositOrigin) {
				await this.getDeposits({ branch: { $oid: this.transaction.branchOrigin._id }, operationType: { $ne: 'D' } }).then(
					deposits => {
						if (deposits && deposits.length > 0) {
							if (deposits.length === 1) {
								this.transaction.depositOrigin = deposits[0];
								this.transaction.depositDestination = deposits[0];
								resolve(true);
							} else {
								let depositDefault: Deposit;
								deposits.forEach(element => {
									if (element && element.default) {
										depositDefault = element;
									}
								});
								if (depositDefault) {
									this.transaction.depositOrigin = depositDefault;
									this.transaction.depositDestination = depositDefault;
									resolve(true);
								} else {
									this.showMessage("Debe asignar un depósito principal para la sucursal " + this.transaction.branchDestination.name, "info", true);
									resolve(false);
								}
							}
						} else {
							this.showMessage("Debe crear un depósito para la sucursal " + this.transaction.branchDestination.name, "info", true);
							resolve(false);
						}
					}
				);
			} else {
				resolve(true);
			}
		});
	}

	async assignOrigin(): Promise<boolean> {

		return new Promise<boolean>(async (resolve, reject) => {

			if (this.transaction.origin === 0) {
				// ASIGNAMOS EL ÚNICO DEPOSITO DE LA LA SUCURSAL
				await this.getOrigins({ branch: { $oid: this.transaction.branchDestination._id }, operationType: { $ne: 'D' } }).then(
					origins => {
						if (origins && origins.length > 0) {
							if (origins.length > 1) {
								this.openModal('select-origin');
							} else {
								this.transaction.origin = origins[0].number;
								resolve(true);
							}
						} else {
							this.showMessage("Debe crear un punto de venta defecto para la sucursal " + this.transaction.branchDestination.name, "info", true);
							resolve(false);
						}
					}
				);
			} else {
				resolve(true);
			}
		});
	}

	async nextStepTransaction() {

		if (this.transaction && (!this.transaction._id || this.transaction._id === "")) {
			let result;
			if (this.transaction.type.transactionMovement === TransactionMovement.Stock &&
				this.transaction.type.stockMovement === StockMovement.Transfer &&
				(!this.transaction.depositDestination || !this.transaction.depositOrigin)) {
				this.openModal('transfer');
			} else {
				result = await this.assignBranch();
			}
			if (result) {
				// CONSULTAR ULTIMA TRANSACCIÓN PARA ENUMARAR LA SIGUIENTE
				let query = `where= "type":"${this.transaction.type._id}",
							"origin":${this.transaction.origin},
							"letter":"${this.transaction.letter}"
							&sort="number":-1
							&limit=1`;
				await this.getTransactions(query).then(
					async transactions => {
						if (transactions && transactions.length > 0) {
							this.transaction.number = transactions[0].number + 1;
						} else {
							this.transaction.number = 1;
						}
						await this.assignCurrency().then(
							async result => {
								if (result) {
									// CONSULTAR ULTIMO NÚMERO DE PEDIDO PARA ENUMARAR EL SIGUIENTE
									if (this.transaction.type.maxOrderNumber > 0) {
										let query = `where= "type":"${this.transaction.type._id}"
													&sort="startDate":-1
													&limit=1`;
										await this.getTransactions(query).then(
											async transactions => {
												let orderNumber = 1;
												if (transactions && transactions.length > 0) {
													orderNumber = transactions[0].orderNumber + 1;
													if (orderNumber > this.transaction.type.maxOrderNumber) {
														orderNumber = 1;
													}
												}
												this.transaction.orderNumber = orderNumber;
											}
										);
									}
									await this.saveTransaction().then(
										async transaction => {
											if (transaction) {
												this.transaction = transaction;
												if (this.posType === 'resto' && this.tableSelected) {
													this.tableSelected.lastTransaction = this.transaction;
													this.tableSelected.state = TableState.Busy;
													await this.updateTable().then(
														table => {
															if (table) {
																this.tableSelected = table;
															}
														}
													);
												}
											}
										}
									);
								}
							}
						);
					}
				);
			}
		}

		if (this.transaction && this.transaction._id && this.transaction._id !== "") {
			await this.updateTransaction(this.transaction).then(
				transaction => {
					if (transaction) {
						this.transaction = transaction;
					}
				}
			);
			if (!this.transaction.branchDestination ||
				!this.transaction.branchOrigin ||
				!this.transaction.depositDestination ||
				!this.transaction.depositOrigin) {
				let branchAssigned = await this.assignBranch();
				if (branchAssigned) {
					this.nextStepTransaction();
				}
			} else if (!this.transaction.employeeClosing &&
				this.transaction.type.requestEmployee &&
				this.transaction.type.requestArticles &&
				(this.posType === 'mostrador' ||
					(this.posType === 'resto' && this.transaction.table))) {
				this.openModal('select-employee');
			} else if (!this.transaction.company &&
				(this.transaction.type.requestCompany || (this.transaction.type.requestArticles && this.posType === 'cuentas-corrientes'))) {
				if (!this.company) {
					this.openModal('company');
				} else {
					this.transaction.company = this.company;
					this.nextStepTransaction();
				}
			} else if (this.transaction.type.automaticNumbering && this.transaction.type.requestArticles) {
				let route = '/pos/' + this.posType + '/editar-transaccion';
				if (this.posType === "cuentas-corrientes") {
					route = '/pos/mostrador/editar-transaccion';
				}

				let queryParams = {
					transactionId: this.transaction._id,
					returnURL: this.removeParam(this._router.url, 'automaticCreation')
				};

				if (this.transaction.type.automaticCreation && this.posType !== 'resto') {
					queryParams['automaticCreation'] = this.transaction.type._id;
				}

				this._router.navigate(
					[route], {
					queryParams
				});
			} else {
				this.openModal('transaction');
			}
		}
	}

	private removeParam(sourceURL: string, key: string) {
		let rtn = sourceURL.split("?")[0], param, params_arr = [], queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
		if (queryString !== "") {
			params_arr = queryString.split("&");
			for (let i = params_arr.length - 1; i >= 0; i -= 1) {
				param = params_arr[i].split("=")[0];
				if (param === key) {
					params_arr.splice(i, 1);
				}
			}
			rtn = rtn + "?" + params_arr.join("&");
		}
		return rtn;
	}

	public async cancelTransaction(transaction: Transaction) {
		this.transaction = await this.getTransaction(transaction._id);
		if (this.transaction) {
			this.openModal('cancel-transaction');
		}
	}

	public async viewTransaction(transaction: Transaction) {
		this.transaction = await this.getTransaction(transaction._id);
		if (this.transaction) {
			this.openModal('view-transaction');
		}
	}

	public async chargeTransaction(transaction: Transaction) {
		this.transaction = await this.getTransaction(transaction._id);
		if (this.transaction) {
			this.openModal('charge');
		}
	}

	public async changeCompany(transaction: Transaction) {
		this.transaction = await this.getTransaction(transaction._id);
		if (this.transaction) {
			this.openModal('edit');
		}
	}

	public async printTransaction(transaction: Transaction) {
		this.transaction = await this.getTransaction(transaction._id);
		if (this.transaction) {
			this.openModal('print');
		}
	}

	public async openTransaction(transaction: Transaction) {
		this.transaction = await this.getTransaction(transaction._id);
		if (this.transaction) {
			this.nextStepTransaction();
		}
	}

	public getTransaction(transactionId: string): Promise<Transaction> {

		return new Promise<Transaction>((resolve, reject) => {

			this._transactionService.getTransaction(transactionId).subscribe(
				async result => {
					if (!result.transaction) {
						this.showMessage(result.message, 'danger', false);
						resolve(null);
					} else {
						resolve(result.transaction);
					}
				},
				error => {
					this.showMessage(error._body, 'danger', false);
					resolve(null);
				}
			);
		});
	}

	async openModal(op: string) {

		let modalRef;

		switch (op) {
			case 'company':
				modalRef = this._modalService.open(SelectCompanyComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.type = this.transaction.type.requestCompany;
				modalRef.result.then(
					async (result) => {
						if (result.company) {
							this.transaction.company = result.company;
							this.nextStepTransaction();
						} else {
							this.refresh();
						}
					}, (reason) => {
						this.refresh();
					}
				);
				break;
			case 'transaction':

				modalRef = this._modalService.open(AddTransactionComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.transactionId = this.transaction._id;
				modalRef.result.then(
					async (result) => {
						this.transaction = result.transaction;
						if (this.transaction) {
							if (this.transaction.type && this.transaction.type.requestArticles) {
								let route = '/pos/' + this.posType + '/editar-transaccion';
								this._router.navigate([route], { queryParams: { transactionId: this.transaction._id, returnURL: this._router.url } });
							} else if (this.transaction.type.requestPaymentMethods) {
								this.openModal('charge');
							} else {
								this.finishTransaction();
							}
						} else if (result === "change-company") {
							this.openModal('company');
						} else {
							this.refresh();
						}
					}, (reason) => {
						this.refresh();
					}
				);
				break;
			case 'charge':
				if (await this.isValidCharge()) {
					modalRef = this._modalService.open(AddMovementOfCashComponent, { size: 'lg', backdrop: 'static' });
					modalRef.componentInstance.transaction = this.transaction;
					modalRef.result.then((result) => {
						if (result.movementsOfCashes) {
							this.finishTransaction();
						} else {
							this.refresh();
						}
					}, (reason) => {
						this.refresh();
					});
				}
				break;
			case 'print':
				if (this.transaction.type.readLayout) {
					modalRef = this._modalService.open(PrintTransactionTypeComponent);
					modalRef.componentInstance.transactionId = this.transaction._id;
					modalRef.result.then(async (result) => {
					}, async (reason) => {
						if (this.transaction.state === TransactionState.Packing) {
							// PONEMOS LA TRANSACCION EN ESTADO EN ENTREGADO
							await this.getTransaction(this.transaction._id).then(
								async transaction => {
									if (transaction) {
										transaction.state = TransactionState.Delivered;
										await this.updateTransaction(transaction).then(
											async transaction => {
												if (transaction) {
													this.refresh();
												}
											}
										);
									}
								}
							);
						}
					});
				} else {
					await this.getPrinters().then(
						printers => {
							this.printers = printers;
						}
					);
					modalRef = this._modalService.open(PrintComponent);
					modalRef.componentInstance.company = this.transaction.company;
					modalRef.componentInstance.transactionId = this.transaction._id;
					modalRef.componentInstance.typePrint = 'invoice';
					if (this.transaction.type.defectPrinter) {
						modalRef.componentInstance.printer = this.transaction.type.defectPrinter;
					} else {
						if (this.printers && this.printers.length > 0) {
							for (let printer of this.printers) {
								if (printer.printIn === PrinterPrintIn.Counter) {
									modalRef.componentInstance.printer = printer;
								}
							}
						}
					}
					modalRef.result.then(async (result) => {
					}, async (reason) => {
						if (this.transaction.state === TransactionState.Packing) {
							// PONEMOS LA TRANSACCION EN ESTADO EN ENTREGADO
							await this.getTransaction(this.transaction._id).then(
								async transaction => {
									if (transaction) {
										transaction.state = TransactionState.Delivered;
										await this.updateTransaction(transaction).then(
											async transaction => {
												if (transaction) {
													this.refresh();
												}
											}
										);
									}
								}
							);
						}
					});
				}
				break;
			case 'printers':
				await this.getPrinters().then(
					printers => {
						this.printers = printers;
					}
				);
				if (this.countPrinters() > 1) {
					modalRef = this._modalService.open(this.contentPrinters, { size: 'lg', backdrop: 'static' }).result.then((result) => {
						if (result !== "cancel" && result !== '') {
							this.printerSelected = result;
							this.openModal("print");
						} else {
							if (this.posType !== 'delivery' && this.transaction.state === TransactionState.Closed && this.transaction.type.automaticCreation) {
								this.transactionTypeId = this.transaction.type._id;
								this.transaction = undefined;
							}
							this.refresh();
						}
					}, (reason) => {
						if (this.posType !== 'delivery' && this.transaction.state === TransactionState.Closed && this.transaction.type.automaticCreation) {
							this.transactionTypeId = this.transaction.type._id;
							this.transaction = undefined;
						}
						this.refresh();
					});
				} else if (this.countPrinters() === 1) {
					this.printerSelected = this.printers[0];
					this.openModal("print");
				}
				break;
			case 'view-transaction':
				modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.transactionId = this.transaction._id;
				break;
			case 'cancel-transaction':
				modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.transactionId = this.transaction._id;
				modalRef.result.then((result) => {
					if (result === "delete_close") {
						this.refresh();
					}
				}, (reason) => {

				});
				break;
			case 'open-turn':
				modalRef = this._modalService.open(SelectEmployeeComponent);
				modalRef.componentInstance.requireLogin = false;
				modalRef.componentInstance.typeEmployee = this.employeeTypeSelected;
				modalRef.componentInstance.op = 'open-turn';
				modalRef.result.then((result) => {
					if (result.turn) {
						this.showMessage("El turno se ha abierto correctamente", 'success', true);
					}
				}, (reason) => {

				});
				break;
			case 'close-turn':
				modalRef = this._modalService.open(SelectEmployeeComponent);
				modalRef.componentInstance.requireLogin = false;
				modalRef.componentInstance.typeEmployee = this.employeeTypeSelected;
				modalRef.componentInstance.op = 'close-turn';
				modalRef.result.then((result) => {
					if (result.turn) {
						this.showMessage("El turno se ha cerrado correctamente", 'success', true);
					}
				}, (reason) => {

				});
				break;
			case 'cash-box':
				modalRef = this._modalService.open(CashBoxComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.transactionType = this.transaction.type;
				modalRef.result.then((result) => {
					if (result && result.cashBox) {
					} else {
						this.hideMessage();
					}
				}, (reason) => {
					this.hideMessage();
				});
				break;
			case 'select-branch':
				modalRef = this._modalService.open(SelectBranchComponent);
				modalRef.result.then((result) => {
					if (result && result.branch) {
						this.transaction.branchOrigin = result.branch;
						this.transaction.branchDestination = result.branch;
						this.nextStepTransaction();
					} else {
						this.hideMessage();
					}
				}, (reason) => {
					this.hideMessage();
				});
				break;
			case 'select-origin':
				modalRef = this._modalService.open(SelectOriginComponent);
				modalRef.componentInstance.branchId = this.transaction.branchDestination._id;
				modalRef.result.then((result) => {
					if (result && result.origin) {
						this.transaction.origin = result.origin.number;
						this.nextStepTransaction();
					} else {
						this.hideMessage();
					}
				}, (reason) => {
					this.hideMessage();
				});
				break;
			case 'select-employee':
				modalRef = this._modalService.open(SelectEmployeeComponent);
				modalRef.componentInstance.requireLogin = false;
				if (this.posType === 'resto' && this.tableSelected) {
					modalRef.componentInstance.op = 'open-table';
					modalRef.componentInstance.table = this.tableSelected;
				} else {
					modalRef.componentInstance.op = 'select-employee';
				}
				modalRef.componentInstance.typeEmployee = this.transaction.type.requestEmployee;
				modalRef.result.then(
					async (result) => {
						if (result.employee) {
							this.transaction.employeeOpening = result.employee;
							this.transaction.employeeClosing = result.employee;
							if (this.posType === "delivery") {
								this.transaction.state = TransactionState.Sent;
								await this.updateTransaction(this.transaction).then(
									transaction => {
										if (transaction) {
											this.transaction = transaction;
											this.refresh();
										}
									}
								);
							} else if (this.posType === 'resto' && this.tableSelected) {
								this.tableSelected.employee = result.employee;
								this.tableSelected.diners = result.diners;
								await this.updateTable().then(
									table => {
										if (table) {
											this.tableSelected = table;
											this.transaction.diners = this.tableSelected.diners;
											this.nextStepTransaction();
										}
									}
								);
							} else {
								this.nextStepTransaction();
							}
						} else {
							this.refresh();
						}
					}, (reason) => {
						this.refresh();
					});
				break;
			case 'transfer':
				modalRef = this._modalService.open(SelectDepositComponent);
				modalRef.componentInstance.op = op
				modalRef.result.then(
					async (result) => {
						if (result && result.origin && result.destination) {
							let depositOrigin = await this.getDeposits({ _id: { $oid: result.origin }, operationType: { $ne: 'D' } });
							this.transaction.depositOrigin = depositOrigin[0]
							let branchO = await this.getBranches({ _id: { $oid: depositOrigin[0].branch }, operationType: { $ne: 'D' } });
							this.transaction.branchOrigin = branchO[0];
							let depositDestination = await this.getDeposits({ _id: { $oid: result.destination }, operationType: { $ne: 'D' } });
							let branchD = await this.getBranches({ _id: { $oid: depositDestination[0].branch }, operationType: { $ne: 'D' } });
							this.transaction.branchDestination = branchD[0]
							this.transaction.depositDestination = depositDestination[0]
							this.nextStepTransaction();
						} else {
							this.hideMessage();
						}
					}, (reason) => {
						this.hideMessage();
					});
				break;
			case 'edit':
				modalRef = this._modalService.open(AddTransactionComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.transactionId = this.transaction._id;
				modalRef.result.then(
					async (result) => {
						if (result && result.transaction) {
							this.updateTransaction(result.transaction)
							this.refresh();
						} else {
							this.refresh();
						}
					}, (reason) => {
						this.refresh();
					});
				break;

			default: ;
		}
	}

	public updateTable(): Promise<Table> {

		return new Promise<Table>((resolve, reject) => {

			this._tableService.updateTable(this.tableSelected).subscribe(
				result => {
					if (!result.table) {
						if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
						resolve(null);
					} else {
						resolve(result.table);
					}
				},
				error => {
					this.showMessage(error._body, 'danger', false);
					resolve(null);
				}
			);
		});
	}

	async isValidCharge(): Promise<boolean> {

		return new Promise<boolean>((resolve, reject) => {

			let isValid = true;

			if (isValid &&
				this.transaction.type.transactionMovement === TransactionMovement.Purchase &&
				!this.transaction.company) {
				isValid = false;
				this.showMessage("Debe seleccionar un proveedor para la transacción.", 'info', true);
			}

			if (isValid &&
				this.transaction.type.electronics &&
				this.transaction.totalPrice >= 5000 &&
				!this.transaction.company &&
				Config.country === 'AR') {
				isValid = false;
				this.showMessage("Debe indentificar al cliente para transacciones electrónicos con monto mayor a $5.000,00.", 'info', true);
			}

			if (isValid &&
				this.transaction.type.electronics &&
				this.transaction.company && (
					!this.transaction.company.identificationType ||
					!this.transaction.company.identificationValue ||
					this.transaction.company.identificationValue === '')
			) {
				isValid = false;
				this.showMessage("El cliente ingresado no tiene nro de identificación", 'info', true);
				this.loading = false;
			}

			if (isValid &&
				this.transaction.type.fixedOrigin &&
				this.transaction.type.fixedOrigin === 0 &&
				this.transaction.type.electronics &&
				Config.country === 'MX') {
				isValid = false;
				this.showMessage("Debe configurar un punto de venta para transacciones electrónicos. Lo puede hacer en /Configuración/Tipos de Transacción.", 'info', true);
				this.loading = false;
			}

			resolve(isValid);
		});
	}

	async finishTransaction() {
		await this.updateBalance().then(
			async balance => {
				if (balance !== null) {
					this.transaction.balance = balance;
					if (this.posType === 'resto' || this.posType === "delivery") {
						this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
						this.transaction.VATPeriod = moment().format('YYYYMM');
					} else {
						if (!this.transaction.endDate) {
							this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
						}
						if (this.transaction.type.transactionMovement !== TransactionMovement.Purchase || !this.transaction.VATPeriod) {
							this.transaction.VATPeriod = moment(this.transaction.endDate, 'YYYY-MM-DDTHH:mm:ssZ').format('YYYYMM');
						}
					}
					this.transaction.expirationDate = this.transaction.endDate;
					this.transaction.state = TransactionState.Closed;
					await this.updateTransaction(this.transaction).then(
						transaction => {
							if (transaction) {
								this.transaction = transaction;
								if (this.transaction.type.printable) {
									this.refresh();
									if (this.transaction.type.defectPrinter) {
										this.printerSelected = this.printerSelected;
										this.openModal("print");
									} else {
										this.openModal("printers");
									}
								} else {
									if (this.posType !== 'delivery' && this.transaction.state === TransactionState.Closed && this.transaction.type.automaticCreation) {
										this.transactionTypeId = this.transaction.type._id;
										this.transaction = undefined;
									}
									this.refresh();
								}
							}
						}
					);
				}
			});
	}

	public getTransactions(query: string): Promise<Transaction[]> {

		return new Promise<Transaction[]>((resolve, reject) => {

			this._transactionService.getTransactions(query).subscribe(
				result => {
					if (!result.transactions) {
						resolve(new Array());
					} else {
						resolve(result.transactions);
					}
				},
				error => {
					this.showMessage(error._body, 'danger', false);
					resolve(new Array());
				}
			);
		});
	}

	public getTransactionsV2(match: {}): Promise<Transaction[]> {

		return new Promise<Transaction[]>((resolve, reject) => {

			this.loading = true;

			let project = {
				startDate: 1,
				endDate: 1,
				origin: 1,
				number: 1,
				observation: 1,
				totalPrice: 1,
				balance: 1,
				state: 1,
				madein: 1,
				operationType: 1,
				"type._id": 1,
				"type.allowEdit": 1,
				"type.name": 1,
				"type.level": 1,
				"type.transactionMovement": 1,
				"branchOrigin": 1,
			}

			if (this.transactionMovement === TransactionMovement.Stock) {
				project["type.stockMovement"] = 1;
				project["depositOrigin._id"] = 1;
				project["depositOrigin.name"] = 1;
				project["depositDestination._id"] = 1;
				project["depositDestination.name"] = 1;
			}

			if (this.transactionMovement !== TransactionMovement.Stock) {
				project["company._id"] = 1;
				project["company.name"] = 1;
			}

			if (this.transactionMovement === TransactionMovement.Sale) {
				project["employeeClosing._id"] = 1;
				project["employeeClosing.name"] = 1;
			}

			let sort: {} = { startDate: -1 };

			if (this.posType === 'pedidos-web') {
				sort = { endDate: -1 };
			}

			this.subscription.add(this._transactionService.getTransactionsV2(
				project, // PROJECT
				match, // MATCH
				sort, // SORT
				{}, // GROUP
				0, // LIMIT
				0 // SKIP
			).subscribe(
				result => {
					this.loading = false;
					this.hideMessage();
					resolve(result.transactions);
				},
				error => {
					this.showMessage(error._body, 'danger', false);
					this.loading = false;
					resolve(new Array());
				}
			));
		});
	}

	public updateBalance(): Promise<number> {

		return new Promise<number>((resolve, reject) => {
			this._transactionService.updateBalance(this.transaction).subscribe(
				async result => {
					if (!result.transaction) {
						if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
						resolve(null);
					} else {
						resolve(result.transaction.balance);
					}
				},
				error => {
					this.showMessage(error._body, 'danger', false);
					reject(null);
				}
			)
		});
	}

	public saveTransaction(): Promise<Transaction> {

		return new Promise<Transaction>((resolve, reject) => {

			(this.posType === 'cuentas-corrientes') ? this.transaction.madein = 'mostrador' : this.transaction.madein = this.posType;

			this._transactionService.saveTransaction(this.transaction).subscribe(
				result => {
					if (!result.transaction) {
						if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
						resolve(null);
					} else {
						this.hideMessage();
						resolve(result.transaction);
					}
				},
				error => {
					this.showMessage(error._body, 'danger', false);
					resolve(null);
				}
			);
		});
	}

	public countPrinters(): number {

		let numberOfPrinters: number = 0;
		let printersAux = new Array();

		if (this.printers && this.printers.length > 0) {
			for (let printer of this.printers) {
				if (printer.printIn === PrinterPrintIn.Counter) {
					printersAux.push(printer);
					numberOfPrinters++;
				}
			}
		} else {
			numberOfPrinters = 0;
		}

		this.printers = printersAux;

		return numberOfPrinters;
	}

	public updateTransaction(transaction: Transaction): Promise<Transaction> {

		return new Promise<Transaction>((resolve, reject) => {

			this._transactionService.updateTransaction(transaction).subscribe(
				result => {
					if (!result.transaction) {
						if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
						resolve(null);
					} else {
						resolve(result.transaction);
					}
				},
				error => {
					this.showMessage(error._body, 'danger', false);
					resolve(null);
				}
			);
		});
	}

	async selectTable(table: Table) {

		this.tableSelected = await this.getTable(table._id);

		if (this.tableSelected.state !== TableState.Disabled &&
			this.tableSelected.state !== TableState.Reserved) {
			if (this.tableSelected.state === TableState.Busy ||
				this.tableSelected.state === TableState.Pending) {
				if (this.tableSelected.lastTransaction) {
					this.transaction = await this.getTransaction(this.tableSelected.lastTransaction._id);
					if (this.transaction) {
						this.nextStepTransaction();
					}
				} else {
					this.tableSelected.state = TableState.Available;
					await this.updateTable().then(
						table => {
							if (table) {
								this.selectTable(table);
							}
						}
					);
				}
			} else {
				this.initTransactionByType('defectOrders');
			}
		} else {
			this.showMessage("La mesa seleccionada se encuentra " + this.tableSelected.state, 'info', true);
		}
	}

	public getTable(tableId: string) {

		return new Promise<Table>((resolve, reject) => {

			this.loading = true;

			this._tableService.getTable(tableId).subscribe(
				result => {
					this.loading = false;
					if (!result.table) {
						if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
						resolve(null);
					} else {
						resolve(result.table);
					}
				},
				error => {
					this.showMessage(error._body, 'danger', false);
					this.loading = false;
					resolve(null);
				}
			);
		});
	}

	async changeStateOfTransaction(transaction: Transaction, state: string) {

		this.transaction = await this.getTransaction(transaction._id);
		if (this.transaction) {
			if (this.transaction.totalPrice > 0) {
				if (state === "Enviado") {
					if (this.transaction.type.requestEmployee) {
						this.openModal('select-employee');
					} else {
						this.transaction.state = TransactionState.Sent;
					}
				} else if (state === "Entregado") {
					this.transaction.state = TransactionState.Delivered;
				}

				this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
				this.transaction.VATPeriod = moment().format('YYYYMM');
				this.transaction.expirationDate = this.transaction.endDate;

				await this.updateTransaction(this.transaction).then(
					transaction => {
						if (this.transaction) {
							this.transaction = transaction;
							this.refresh();
						}
					}
				);
			} else {
				this.showMessage("No se puede cambiar de estado una transacción con monto menor o igual $0,00.", "info", true);
			}
		}
	}

	public getEmployeeType(op: string, employeeType: string): void {

		let query = 'where="description":"' + employeeType + '"';

		this._employeeTypeService.getEmployeeTypes(query).subscribe(
			result => {
				if (!result.employeeTypes) {
					this.showMessage("No existen empleados de tipo " + employeeType, "info", true);
				} else {
					this.hideMessage();
					this.employeeTypeSelected = result.employeeTypes[0];
					this.openModal(op);
				}
			},
			error => {
				this.showMessage(error._body, 'danger', false);
			}
		);
	}

	public changeRoom(room: Room): void {
		this.roomSelected = room;
	}

	public orderBy(term: string, property?: string): void {

		if (this.orderTerm[0] === term) {
			this.orderTerm[0] = "-" + term;
		} else {
			this.orderTerm[0] = term;
		}
		this.propertyTerm = property;
	}

	public ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	public showMessage(message: string, type: string, dismissible: boolean): void {
		this.alertMessage = message;
		this.alertConfig.type = type;
		this.alertConfig.dismissible = dismissible;
	}

	public hideMessage(): void {
		this.alertMessage = '';
	}
}
