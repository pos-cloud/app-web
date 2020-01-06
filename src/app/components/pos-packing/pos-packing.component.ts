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
	public colors: string[] = ["teal:white", "midnightblue:white", "black:white", "black:white", "chocolate:white"];
	public printers: Printer[];
	public colorNumber: number = 0;
	public limit: number = 3;
	public fontSize: number = 30;
	public column: number = 4;

	constructor(
		public alertConfig: NgbAlertConfig,
		private _modalService: NgbModal,
		private _route: ActivatedRoute,
		private _transactionService: TransactionService,
		private _movementOfArticleService: MovementOfArticleService,
		private _printerService: PrinterService
	) {
		this.transactionsToPacking = new Array();
		this.processParams();
	}

	private processParams(): void {
		this._route.queryParams.subscribe(params => {
			if(params['column'] && !isNaN(params['column'])) this.column = params['column'];
			if(params['fontSize'] && !isNaN(params['fontSize'])) this.fontSize = params['fontSize'];
			if(params['limit'] && !isNaN(params['limit'])) {
				if(params['limit'] !== this.limit) {
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
		let packingColors = [];
		this.transactionsToPacking = await this.getTransactions({ state: TransactionState.Packing, operationType: { $ne: "D" } });
		let i = 0;
		for (let transaction of this.transactionsToPacking) {
			transaction['movementsOfArticles'] = await this.getMovementsOfArticles({ transaction: { $oid: transaction._id }, operationType: { $ne: "D" } });
			let color: string = this.getColor(transaction._id);
			if (color) {
				this.colorNumber = this.colors.indexOf(color);
			}
			transaction['color'] = this.colors[this.colorNumber];
			packingColors.push({
				transactionId: transaction._id,
				color: transaction['color']
			});
			(this.colorNumber === this.colors.length - 1) ? this.colorNumber = 0 : this.colorNumber++;
			i++;
		}
		localStorage.setItem('packingColors', JSON.stringify(packingColors));
		this.loading = false;
	}

	private getColor(transactionId: string): string {
		let color: string = null;
		let packingColors = localStorage.getItem('packingColors');
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

	public async initInterval() {
		setInterval(async () => {
			if (!this.loading && this.transactionsToPacking.length < this.limit) {
				this.loadPacking();
			}
		}, 10000);
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
				transaction: 1
			};

			this._movementOfArticleService.getMovementsOfArticlesV2(
				project, // PROJECT
				match, // MATCH
				{}, // SORT
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

	public showMessage(message: string, type: string, dismissible: boolean): void {
		this.alertMessage = message;
		this.alertConfig.type = type;
		this.alertConfig.dismissible = dismissible;
	}

	public hideMessage(): void {
		this.alertMessage = '';
	}
}
