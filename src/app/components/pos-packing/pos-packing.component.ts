import { Component, ViewEncapsulation } from '@angular/core';
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Transaction, TransactionState } from 'app/models/transaction';
import { TransactionService } from 'app/services/transaction.service';
import { MovementOfArticle } from 'app/models/movement-of-article';
import { MovementOfArticleService } from 'app/services/movement-of-article.service';
import { ActivatedRoute } from '@angular/router';
import { PrintTransactionTypeComponent } from '../print/print-transaction-type/print-transaction-type.component';
import { Printer, PrinterPrintIn } from 'app/models/printer';
import { PrintComponent } from '../print/print/print.component';
import { PrinterService } from 'app/services/printer.service';
import { JsonDiffPipe } from 'app/pipes/json-diff';
import { User } from 'app/models/user';
import { UserService } from 'app/services/user.service';

@Component({
	selector: 'app-pos-packing',
	templateUrl: './pos-packing.component.html',
	styleUrls: ['./pos-packing.component.scss'],
	providers: [NgbAlertConfig],
	encapsulation: ViewEncapsulation.None
})

export class PosPackingComponent {

	public alertMessage: string = '';
	public loading: boolean = false;
	public transactionsToPacking: Transaction[];
	public printers: Printer[];

	// DISEÑO
	public colors: string[] = ["teal:white", "midnightblue:white", "black:white", "black:white", "chocolate:white"];
	public colorNumber: number = 0;
	public positionNumber: number = 0;
	public limit: number = 3;
	public fontSize: number = 30;
	public column: number = 4;

	constructor(
		public alertConfig: NgbAlertConfig,
		private _modalService: NgbModal,
		private _route: ActivatedRoute,
		private _transactionService: TransactionService,
		private _movementOfArticleService: MovementOfArticleService,
        private _printerService: PrinterService,
        private _userService : UserService,
		private _jsonDiffPipe: JsonDiffPipe
	) {
		this.transactionsToPacking = new Array();
		this.processParams();
	}

	private processParams(): void {
		this._route.queryParams.subscribe(params => {
			if (params['column'] && !isNaN(params['column'])) this.column = params['column'];
			if (params['fontSize'] && !isNaN(params['fontSize'])) this.fontSize = params['fontSize'];
			if (params['limit'] && !isNaN(params['limit'])) {
				if (params['limit'] !== this.limit) {
					this.limit = params['limit'];
					this.loadPacking();
				} else {
					this.limit = params['limit'];
				}
			}
			if (params['colors']) {
				this.colors = new Array();
				for (const color of params['colors'].split(',')) {
					this.colors.push(color);
				}
			}
		});
	}

	public async ngOnInit() {
		await this.getPrinters().then(
			printers => {
				this.printers = printers;
			}
		);
		this.loadPacking();
		this.initInterval();
	}

	private async loadPacking() {
		this.loading = true;
		let transactions: Transaction[] = await this.getTransactions({ state: TransactionState.Packing, operationType: { $ne: "D" } });
		let count = 0;
		let change: boolean = false;
		for (const transactionToPacking of this.transactionsToPacking) {
			if (transactionToPacking && transactionToPacking._id && transactionToPacking._id !== '') {
				if (transactions && transactions.length > 0) {
					for (const transaction of transactions) {
						if (transaction._id && transactionToPacking._id) {
							count++;
							if (this._jsonDiffPipe.transform(transaction, transactionToPacking)) {
								change = true;
							}
						}
					}
				} else {
					change = true;
				}
			}
		}
		if (count != transactions.length || change) {
			let packingTransactions = [];
			this.transactionsToPacking = transactions;
			if (this.transactionsToPacking.length < this.limit) {
				let toCreate = (this.limit - this.transactionsToPacking.length);
				for (let i = 0; i < toCreate; i++) {
					this.transactionsToPacking.push(new Transaction());
				}
			}
			let i = 0;
			for (let transaction of this.transactionsToPacking) {
				transaction['movementsOfArticles'] = await this.getMovementsOfArticles(
					{
						transaction: { $oid: transaction._id },
						operationType: { $ne: "D" },
						$or: [
							{
								$and: [
									{
										movementParent: { $exists: true, $ne: null },
										isOptional: true
									}
								]
							},
							{
								$and: [
									{
										movementParent: { $exists: false, $eq: null },
										isOptional: false
									}
								]
							}
						]
					}
				);
				let color: string = this.getColor(transaction._id);
				if (color) {
					this.colorNumber = this.colors.indexOf(color);
				}
				transaction['color'] = this.colors[this.colorNumber];
				transaction['position'] = this.getPosition(transaction._id);
				this.positionNumber = transaction['position'];
				if (transaction && transaction._id && transaction._id !== '') {
					packingTransactions.push({
						transactionId: transaction._id,
						color: transaction['color'],
						position: transaction['position'],

					});
				}
				(this.colorNumber === this.colors.length - 1) ? this.colorNumber = 0 : this.colorNumber++;
				i++;
			}
			this.transactionsToPacking.sort((a, b) => {
				let comparison = 0;
				if (a['position'] > b['position']) {
					comparison = 1;
				} else if (a['position'] < b['position']) {
					comparison = -1;
				}
				return comparison;
			});
			localStorage.setItem('packingTransactions', JSON.stringify(packingTransactions));
		}
		this.loading = false;
	}

	private getColor(transactionId: string): string {
		let color: string = null;
		let packingColors = localStorage.getItem('packingTransactions');
		if (packingColors) {
			try {
				packingColors = JSON.parse(packingColors);
				for (let pack of packingColors) {
					if (pack['transactionId'] === transactionId) {
						color = pack['color'];
					}
				}
			} catch (err) { }
		}
		return color;
	}

	private getPosition(transactionId: string): number {
		let position: number = null;
		let packingPositions = localStorage.getItem('packingTransactions');
		if (packingPositions) {
			try {
				packingPositions = JSON.parse(packingPositions);
				for (let pack of packingPositions) {
					if (pack['transactionId'] === transactionId) {
						position = pack['position'];
					}
				}
			} catch (err) { }
		}
		if (position === null) position = this.getFreePosition();
		return position;
	}

	private getFreePosition(): number {
		let position: number = null;
		if (localStorage.getItem('packingTransactions')) {
			try {
				this.transactionsToPacking.sort((a, b) => {
					let comparison = 0;
					if (a['position'] > b['position']) {
						comparison = 1;
					} else if (a['position'] < b['position']) {
						comparison = -1;
					}
					return comparison;
				});
				for (let i = 1; i <= this.limit; i++) {
					if (position === null) {
						let exists: boolean = false;
						for (let pack of this.transactionsToPacking) {
							if (pack['position'] === i) {
								exists = true;
							}
						}
						if (!exists) position = i;
					}
				}
			} catch (err) { }
		} else {
			position = 1;
		}
		if (position === null) position = this.positionNumber + 1;
		return position;
	}

	public async initInterval() {
		setInterval(async () => {
			if (!this.loading) {
				let count = 0;
				for (const transaction of this.transactionsToPacking) {
					if (transaction && transaction._id && transaction._id !== '') {
						count++;
					}
				}
				if (count < this.limit) {
					this.loadPacking();
				}
			}
		}, 5000);
	}

	public getTransactions(match: {}): Promise<Transaction[]> {

		return new Promise<Transaction[]>((resolve, reject) => {

			this.loading = true;

			let project = {
				endDate: 1,
				number: 1,
				state: 1,
				operationType: 1,
			}

			this._transactionService.getTransactionsV2(
				project, // PROJECT
				match, // MATCH
				{ startDate: 1 }, // SORT
				{}, // GROUP
				this.limit, // LIMIT
				0 // SKIP
			).subscribe(
				result => {
					this.loading = false;
					resolve(result.transactions);
				},
				error => {
					this.loading = false;
					resolve([]);
				}
			);
		});
	}

	public getMovementsOfArticles(match: {}): Promise<MovementOfArticle[]> {

		return new Promise<MovementOfArticle[]>((resolve, reject) => {

			this.loading = true;

			let project = {
				_id: 1,
				description: 1,
				amount: 1,
				notes: 1,
				transaction: 1,
				operationType: 1,
				isOptional: 1,
				movementParent: 1,
				"category.order": 1,
			};

			this._movementOfArticleService.getMovementsOfArticlesV2(
				project, // PROJECT
				match, // MATCH
				{ "category.order": 1 , movementParent: -1}, // SORT
				{}, // GROUP
				0, // LIMIT
				0 // SKIP
			).subscribe(
				result => {
					this.loading = false;
					if (!result.movementsOfArticles) {
						if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
						resolve([]);
					} else {
						resolve(result.movementsOfArticles);
					}
				},
				error => {
					this.loading = false;
					this.showMessage(error._body, 'danger', false);
					resolve([]);
				}
			);
		});
	}

	async openModal(op: string, transaction: Transaction) {

		let modalRef;
        let printerSelect : Printer;

		switch (op) {
			case 'print':
				await this.getTransaction(transaction._id).then(
					async result => {
						if (result) {
							transaction = result;
						}
					}
				);
				if (transaction.type.readLayout) {
					modalRef = this._modalService.open(PrintTransactionTypeComponent);
					modalRef.componentInstance.transactionId = transaction._id;
					modalRef.result.then(async (result) => {
					}, async (reason) => {
						if (transaction.state === TransactionState.Packing) {
							// PONEMOS LA TRANSACCION EN ESTADO EN ENTREGADO
							transaction.state = TransactionState.Delivered;
							await this.updateTransaction(transaction).then(
								async transaction => {
									if (transaction) {
										this.loadPacking();
									}
								}
							);
						}
					});
				} else {
					modalRef = this._modalService.open(PrintComponent);
					modalRef.componentInstance.company = transaction.company;
					modalRef.componentInstance.transactionId = transaction._id;
					modalRef.componentInstance.typePrint = 'invoice';
					if (transaction.type.defectPrinter) {
						modalRef.componentInstance.printer = transaction.type.defectPrinter;
					} else {
                        await this.getUser().then(
                            async user => {
                                if (user) {
                                    if (user.printers && user.printers.length > 0) {
                                        for (const element of user.printers) {
                                            if (element && element.printer && element.printer.printIn === PrinterPrintIn.Bar) {
                                                printerSelect = element.printer;
                                            }
                                            if (element && element.printer && element.printer.printIn === PrinterPrintIn.Counter) {
                                                printerSelect = element.printer;
                                            }
                                            if (element && element.printer && element.printer.printIn === PrinterPrintIn.Kitchen) {
                                                printerSelect = element.printer;
                                            }
                                            if (element && element.printer && element.printer.printIn === PrinterPrintIn.Voucher) {
                                                printerSelect = element.printer;
                                            }
                                        }
                                    } else {
                                        if (!printerSelect) {
                                            if (this.printers && this.printers.length > 0) {
                                                for (let printer of this.printers) {
                                                    //traer usuario y la impresora seteada y asignar
                                                    if (printer.printIn === PrinterPrintIn.Counter) {
                                                        printerSelect = printer;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    modalRef.componentInstance.printer = printerSelect;
                                } else {
                                    this.showMessage("Debe iniciar sesión", 'danger', false);
                                }
                            }
                        );

						
					}
					modalRef.result.then(async (result) => {
					}, async (reason) => {
						if (transaction.state === TransactionState.Packing) {
							// PONEMOS LA TRANSACCION EN ESTADO EN ENTREGADO
							transaction.state = TransactionState.Delivered;
							await this.updateTransaction(transaction).then(
								async transaction => {
									if (transaction) {
										this.loadPacking();
									}
								}
							);
						}
					});
				}
				break;
			default:
				break;
		}
	}

	public getPrinters(): Promise<Printer[]> {

		return new Promise<Printer[]>(async (resolve, reject) => {

			this._printerService.getPrinters().subscribe(
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
			);
		});
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

	public updateTransaction(transaction: Transaction): Promise<Transaction> {

		return new Promise<Transaction>((resolve, reject) => {

			this.loading = true;

			this._transactionService.updateTransaction(transaction).subscribe(
				result => {
					this.loading = false;
					if (!result.transaction) {
						resolve(null);
					} else {
						resolve(result.transaction);
					}
				},
				error => {
					this.loading = false;
					resolve(null);
				}
			);
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
							this.showMessage("Debe volver a iniciar session", "danger", false);
						}
					},
					error => {
						this.showMessage(error._body, "danger", false);
					}
				)
			}
		});
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