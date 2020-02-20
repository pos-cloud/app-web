import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { MovementOfArticleService } from 'app/services/movement-of-article.service';
import { MovementOfArticle, MovementOfArticleStatus } from 'app/models/movement-of-article';
import { Config } from 'app/app.config';
import * as moment from 'moment';
import 'moment/locale/es';
import { Transaction, TransactionState } from 'app/models/transaction';
import { TransactionService } from 'app/services/transaction.service';

@Component({
	selector: 'app-pos-kitchen',
	templateUrl: './pos-kitchen.component.html',
	styleUrls: ['./pos-kitchen.component.scss'],
	providers: [NgbAlertConfig],
	encapsulation: ViewEncapsulation.None
})

export class PosKitchenComponent {

	public alertMessage: string = '';
	public loading: boolean = false;
	public movementsOfArticles: MovementOfArticle[];
	public movementOfArticle: MovementOfArticle;
	public database: string = Config.database;
	public apiURL = Config.apiURL;
	public productionStarted: boolean = false;
	public startProductionDate: string;
	public movementsOfArticlesChildren: MovementOfArticle[];

	constructor(
		public _router: Router,
		public alertConfig: NgbAlertConfig,
		private _movementOfArticleService: MovementOfArticleService,
		private _transactionService: TransactionService
	) {
		this.movementsOfArticlesChildren = new Array();
	}

	public async ngOnInit() {
		await this.loadMovementOfArticleReady();
		this.initInterval();
	}

	public initInterval(): void {
		setInterval(() => {
			if (this.productionStarted && !this.movementOfArticle && !this.loading) {
				this.startProduction();
			}
		}, 5000);
	}

	public async loadMovementOfArticleReady() {
		try {
			this.movementsOfArticles = JSON.parse(sessionStorage.getItem('kitchen_movementsOfArticles'));
			this.movementOfArticle = JSON.parse(localStorage.getItem('kitchen_movementOfArticle'));
			if (this.movementOfArticle) {
				this.productionStarted = true;
				this.startProductionDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
				await this.loadMovementsOfArticlesChildren();
			};
		} catch (err) { }
	}

	public async startProduction() {

		this.productionStarted = true;

		this.searchOrderToPreparing();
	}

	public async searchOrderToPreparing() {

		await this.updateMovementOfArticleByWhere({
			$or: [{ status: MovementOfArticleStatus.Pending }, { status: MovementOfArticleStatus.Preparing }],
			operationType: { $ne: 'D' }
		}, {
			status: MovementOfArticleStatus.LastOrder,
			$inc: { printed: 1 }
		},
			{
				creationDate: 1
			}).then(
				async movementOfArticle => {
					if (movementOfArticle) {
						if (movementOfArticle.printed === movementOfArticle.amount) {
							this.movementOfArticle = movementOfArticle;
							this.startProductionDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
							await this.getMovementsOfArticles({ _id: { $oid: this.movementOfArticle._id } }).then(
								async movementsOfArticles => {
									if (movementsOfArticles && movementsOfArticles.length > 0) {
										this.movementOfArticle = movementsOfArticles[0];
										localStorage.setItem('kitchen_movementOfArticle', JSON.stringify(this.movementOfArticle));
										await this.loadMovementsOfArticlesChildren();
										// PONEMOS LA TRANSACCION EN ESTADO EN PREPARACION
										await this.getTransaction(this.movementOfArticle.transaction._id).then(
											async transaction => {
												if (transaction) {
													transaction.state = TransactionState.Preparing;
													await this.updateTransaction(transaction).then(
														async transaction => {
															if (transaction) {
															}
														}
													);
												}
											}
										);
									}
								}
							);
						} else if (movementOfArticle.printed < movementOfArticle.amount) {
							this.movementOfArticle = movementOfArticle;
							this.startProductionDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
							this.movementOfArticle.status = MovementOfArticleStatus.Preparing;
							await this.updateMovementOfArticle().then(
								async movementOfArticle => {
									if (movementOfArticle) {
										this.movementOfArticle = movementOfArticle;
										await this.getMovementsOfArticles({ _id: { $oid: this.movementOfArticle._id } }).then(
											async movementsOfArticles => {
												if (movementsOfArticles && movementsOfArticles.length > 0) {
													this.movementOfArticle = movementsOfArticles[0];
													localStorage.setItem('kitchen_movementOfArticle', JSON.stringify(this.movementOfArticle));
													await this.loadMovementsOfArticlesChildren();
													// PONEMOS LA TRANSACCION EN ESTADO EN PREPARACION
													await this.getTransaction(this.movementOfArticle.transaction._id).then(
														async transaction => {
															if (transaction) {
																transaction.state = TransactionState.Preparing;
																await this.updateTransaction(transaction).then(
																	async transaction => {
																		if (transaction) {
																		}
																	}
																);
															}
														}
													);
												}
											}
										);
									}
								}
							);
						} else {
							this.movementOfArticle.status = MovementOfArticleStatus.Ready;
							await this.updateMovementOfArticle().then(
								movementOfArticle => {
									if (movementOfArticle) {
										this.startProduction();
									}
								}
							);
						}
					}
				}
			);
	}

	public async loadMovementsOfArticlesChildren() {
		await this.getMovementsOfArticles(
			{
				isOptional: true,
				movementParent: { $oid: this.movementOfArticle._id },
				operationType: { $ne: 'D' }
			}).then(
				movementsOfArticles => {
					this.movementsOfArticlesChildren = movementsOfArticles;
				}
			).catch(
				err => {
					this.movementsOfArticlesChildren = new Array();
				}
			);
	}

	public getTransaction(transactionId: string): Promise<Transaction> {

		return new Promise<Transaction>((resolve, reject) => {

			this.loading = true;

			this._transactionService.getTransaction(transactionId).subscribe(
				async result => {
					this.loading = false;
					if (!result.transaction) {
						this.showMessage(result.message, 'danger', false);
						resolve(null);
					} else {
						resolve(result.transaction);
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

	public updateTransaction(transaction: Transaction): Promise<Transaction> {

		return new Promise<Transaction>((resolve, reject) => {

			this.loading = true;

			this._transactionService.updateTransaction(transaction).subscribe(
				result => {
					this.loading = false;
					if (!result.transaction) {
						if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
						resolve(null);
					} else {
						resolve(result.transaction);
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

	public async stopProduction() {
		if (this.movementOfArticle) {
			await this.changeStatusToPending().then(
				movementOfArticle => {
					if (movementOfArticle) {
						this.movementOfArticle = null;
						this.movementsOfArticlesChildren = new Array();
						localStorage.removeItem('kitchen_movementOfArticle');
					}
				}
			);
		} else {
			this.loading = false;
		}
		this.productionStarted = false;
	}

	public finishOrder(): void {

		if (!this.movementsOfArticles) this.movementsOfArticles = new Array();
		// AGREGAMOS AL PRINCIPIO DEL LISTADO DE PRODUCIDOS Y SOLO GUARDAMOS LOS 3 PRIMEROS
		this.movementsOfArticles.unshift(this.movementOfArticle);
		this.movementsOfArticles = this.movementsOfArticles.slice(0, 3);
		sessionStorage.setItem('kitchen_movementsOfArticles', JSON.stringify(this.movementsOfArticles));
		this.movementOfArticle = null;
		this.movementsOfArticlesChildren = new Array();
		localStorage.removeItem('kitchen_movementOfArticle');
		this.startProduction();
	}

	public getMovementsOfArticles(match: {}): Promise<MovementOfArticle[]> {

		return new Promise<MovementOfArticle[]>((resolve, reject) => {

			this.loading = true;

			let project = {
				_id: 1,
				description: 1,
				notes: 1,
				status: 1,
				amount: 1,
				printed: 1,
				movementParent: 1,
				isOptional: 1,
				operationType: 1,
				'article._id': 1,
				'article.picture': 1,
				'transaction._id': 1,
				'transaction.endDate': 1,
				'transaction.number': 1,
				'transaction.orderNumber': 1
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

	public getTime(date: string): string {
		let time: string;
		if (date && moment(date).isValid()) {
			time = moment(date).fromNow();
		}
		return time;
	}

	public updateMovementOfArticleByWhere(where: {}, set: {}, sort: {}): Promise<MovementOfArticle> {

		return new Promise<MovementOfArticle>((resolve, reject) => {

			this.loading = true;

			this._movementOfArticleService.updateMovementOfArticleByWhere(where, set, sort).subscribe(
				result => {
					this.loading = false;
					if (!result.movementOfArticle) {
						if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
						resolve(null);
					} else {
						resolve(result.movementOfArticle);
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

	public async viewArticle(movementOfArticle: MovementOfArticle) {
		if (this.movementOfArticle) {
			await this.changeStatusToPending().then(
				movementOfArticle => {
					if (movementOfArticle) {
						this.movementOfArticle = null;
						this.movementsOfArticlesChildren = new Array();
						localStorage.removeItem('kitchen_movementOfArticle');
					}
				}
			);
		}
		this.movementOfArticle = movementOfArticle;
		this.loadMovementsOfArticlesChildren();
		this.startProductionDate = null;
	}

	public async changeStatusToPending() {
		return new Promise(async (resolve, reject) => {
			this.movementOfArticle.status = MovementOfArticleStatus.Pending;
			await this.updateMovementOfArticleByWhere(
				{
					_id: this.movementOfArticle._id
				},
				{
					status: MovementOfArticleStatus.Pending,
					$inc: { printed: -1 }
				},
				{}).then(
					async movementOfArticle => {
						if (movementOfArticle) {
							resolve(movementOfArticle);
						}
					}
				);
		});
	}

	public async changeStatusToReady() {

		return new Promise(async (resolve, reject) => {

			if (!this.loading) {
				if (this.movementOfArticle.status !== MovementOfArticleStatus.Ready) {
					// PASAMOS A ÚLTIMA ORDEN PARA RESERVAR POSIBLE LA INFORMACIÓN Y OBTENER EL ÚLTIMO ESTADO
					await this.updateMovementOfArticleByWhere({ _id: this.movementOfArticle._id }, { status: MovementOfArticleStatus.LastOrder }, {}).then(
						async movementOfArticle => {
							if (movementOfArticle) {
								this.movementOfArticle = movementOfArticle;
								// SI LA CANTIDAD PRODUCIDA ES IGUAL A LA CANTIDAD DE ARTICULOS PASA A ESTAR LISTO
								if (this.movementOfArticle.printed >= this.movementOfArticle.amount) {
									this.movementOfArticle.status = MovementOfArticleStatus.Ready;
								} else {
									this.movementOfArticle.status = MovementOfArticleStatus.Preparing;
								}
								this.updateMovementOfArticle().then(
									async movementOfArticle => {
										if (movementOfArticle) {
											this.movementOfArticle = movementOfArticle;
											if (this.movementOfArticle.status === MovementOfArticleStatus.Ready) {
												await this.getTransaction(this.movementOfArticle.transaction._id).then(
													async transaction => {
														if (transaction) {
															transaction.state = TransactionState.Packing;
															await this.updateTransaction(transaction).then(
																async transaction => {
																	if (transaction) {
																		this.finishOrder();
																	}
																}
															);
														}
													}
												);
											} else {
												this.finishOrder();
											}
										}
									}
								);
							}
						}
					);
				} else {
					this.movementOfArticle = null;
					this.movementsOfArticlesChildren = new Array();
					localStorage.removeItem('kitchen_movementOfArticle');
					this.startProduction();
					resolve(this.movementOfArticle);
				}
			} else {
				resolve(null);
			}
		});
	}

	public updateMovementOfArticle(): Promise<MovementOfArticle> {

		return new Promise<MovementOfArticle>((resolve, reject) => {

			this.loading = true;

			this._movementOfArticleService.updateMovementOfArticle(this.movementOfArticle).subscribe(
				result => {
					this.loading = false;
					if (!result.movementOfArticle) {
						if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
						resolve(null);
					} else {
						resolve(result.movementOfArticle);
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

	public showMessage(message: string, type: string, dismissible: boolean): void {
		this.alertMessage = message;
		this.alertConfig.type = type;
		this.alertConfig.dismissible = dismissible;
	}

	public hideMessage(): void {
		this.alertMessage = '';
	}
}
