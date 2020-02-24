import { Component, OnInit, EventEmitter, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';
import { Transaction } from 'app/models/transaction';
import { TransactionService } from 'app/services/transaction.service';
import { MovementOfArticle } from 'app/models/movement-of-article';
import { MovementOfArticleService } from 'app/services/movement-of-article.service';
import { ArticlePrintIn } from 'app/models/article';
import { VoucherService } from 'app/services/voucher.service';
import { Voucher } from 'app/models/voucher';

declare const Instascan: any;

@Component({
	selector: 'app-voucher-reader',
	templateUrl: './voucher-reader.component.html',
	styleUrls: ['./voucher-reader.component.scss'],
	providers: [NgbAlertConfig],
	encapsulation: ViewEncapsulation.None
})

export class VoucherReaderComponent implements OnInit {

	public text: string;
	public alertMessage: string = '';
	public focusEvent = new EventEmitter<boolean>();
	public loading: boolean = false;
	public showCamera: boolean = true;
	@ViewChild('voucherDetails', { static: true }) voucherDetails: ElementRef;
	public available: boolean = true;
	public scanner;
	public timeOfReading: string;
	public timeGenerate: string;
	public voucher;
	public movementsOfArticles: MovementOfArticle[];

	constructor(
		public activeModal: NgbActiveModal,
		public alertConfig: NgbAlertConfig,
		public _router: Router,
		public _modalService: NgbModal,
		private _voucherService: VoucherService,
		private _transactionService: TransactionService,
		private _movementOfArticleService: MovementOfArticleService
	) { }

	ngOnInit(): void {
	}

	ngAfterViewInit() {
		this.focusEvent.emit(true);
	}

	public initScanner(): void {
		this.showCamera = true;
		this.scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
		this.scanner.addListener('scan', (content) => {
			if (this.available) {
				this.text = content;
				this.readVoucher();
			}
		});

		Instascan.Camera.getCameras().then((cameras) => {
			if (cameras.length > 0) {
				this.scanner.start(cameras[0]);
			} else {
				this.showMessage('No se encontraron cámaras.', 'info', true);
			}
		}).catch(function (e) {
			this.showMessage(e, 'danger', true);
		});
	}

	public async readVoucher() {
		this.available = false;
		if (this.text && this.text !== '') {
			try {
				// Decrypt
				this._voucherService.verifyVoucher(this.text).subscribe(
					async result => {
						if (!result.voucher) {
							this.available = true;
							this.focusEvent.emit(true);
							if (result.message && result.message !== '') this.showMessage(result.message, 'danger', true);
						} else {
							this.hideMessage();
							this.voucher = result.voucher;
							if (this.voucher.transaction) {
								await this.getTransactions({
									_id: { $oid: this.voucher.transaction },
									state: { $ne: 'Anulado' },
									operationType: { $ne: 'D' }
								}).then(
									async transactions => {
										if (transactions && transactions.length > 0) {
											await this.getMovementsOfArticles({
												operationType: { $ne: 'D' },
												transaction: { $oid: this.voucher.transaction },
												'article.printIn': ArticlePrintIn.Voucher
											}).then(
												movementsOfArticles => {
													if (movementsOfArticles && movementsOfArticles.length > 0) {
														this.movementsOfArticles = movementsOfArticles;
													}
												}
											);
										} else {
											this.showMessage('La transacción ya no se encuentra disponible', 'info', true);
										}
									}
								);
							}
							this.timeOfReading = moment().calendar();
							this.timeGenerate = moment(this.voucher.time).calendar();
							if (this.voucher.type === 'articles') {
								this.openModal('articles');
							}
						}
					}
				);
			} catch (err) {
				this.available = true;
				this.focusEvent.emit(true);
				this.showMessage('Error al intentar leer el voucher.', 'info', true);
			}
		} else {
			this.available = true;
			this.focusEvent.emit(true);
			this.showMessage('Debe ingresar un código de voucher válido.', 'info', true);
		}
	}

	public getTransactions(match: {}): Promise<Transaction[]> {

		return new Promise<Transaction[]>((resolve, reject) => {

			this.loading = true;

			let project = {
				operationType: 1,
				state: 1,
			}

			this._transactionService.getTransactionsV2(
				project, // PROJECT
				match, // MATCH
				{}, // SORT
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
				'article.printIn': 1
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

	public updateVoucher(): Promise<Voucher> {

		return new Promise<Voucher>((resolve, reject) => {

			this.loading = true;

			this._voucherService.updateVoucher(this.voucher).subscribe(
				result => {
					this.loading = false;
					if (!result.voucher) {
						if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
						resolve(null);
					} else {
						resolve(result.voucher);
					}
				},
				error => {
					this.loading = false;
					this.showMessage(error._body, 'danger', false);
					resolve(null);
				}
			);
		});
	}

	public clearText(): void {
		this.text = '';
		this.focusEvent.emit(true);
	}

	public stopScanner(): void {
		this.scanner.stop();
		this.showCamera = true;
	}

	async openModal(op: string) {

		let modalRef;

		switch (op) {
			case 'articles':
				modalRef = this._modalService.open(this.voucherDetails, { size: 'lg', backdrop: 'static' });
				modalRef.result.then(async (result) => {
					this.clearText();
					this.available = true;
				}, (reason) => {
					this.clearText();
					this.available = true;
				});
				break;
			default:
				break;
		}
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
