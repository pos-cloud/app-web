import * as express from 'express';
import ArticleStockSchema from '../article-stock/article-stock.model';
import authMiddleware from '../../middleware/auth.middleware';
import ensureLic from '../../middleware/license.middleware';
import MovementOfArticleSchema from '../movement-of-article/movement-of-article.model';
import DepositSchema from '../deposit/deposit.model';
import BranchSchema from '../branch/branch.model';
import RequestWithUser from './../../interfaces/requestWithUser.interface';
import Responser from '../../utils/responser';
import HttpException from '../../exceptions/HttpException';
import Responseable from './../../interfaces/responsable.interface';
import MovementOfArticleController from '../movement-of-article/movement-of-article.controller';
import ArticleStockController from '../article-stock/article-stock.controller';
import NotFoundException from './../../exceptions/NotFoundException';
import ArticleStock from './../../domains/article-stock/article-stock.interface';
import MovementOfArticle from './../../domains/movement-of-article/movement-of-article.interface';
import TransactionController from './../../domains/transaction/transaction.controller';
import Transaction from './../../domains/transaction/transaction.interface';
import WooCommerceController from './woocomerce.controller';
import MercadoLibreController from './mercadolibre.controller';
import StructureController from './../../domains/structure/structure.controller';
import { StockMovement } from './../../domains/transaction-type/transaction-type.interface';

export default class StockController {

	public EJSON: any = require('bson').EJSON;
	public path = '/stock';
	public router = express.Router();
	public database: string;

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router
			.put(`${this.path}/by-transaction`, [authMiddleware, ensureLic], this.updateArticleStockByTransaction)
	}

	private updateArticleStockByTransaction = (
		request: RequestWithUser,
		response: express.Response,
		next: express.NextFunction,
		transactionId: string = null
	) => {
		this.database = request.database;
		let transaction: Transaction;

		if (!transactionId) {
			transactionId = request.body.transaction._id;
		}

		// TRAEMOS DE LA BASE EL MOVIMIENTO DEL ARTÍCULO
		new TransactionController(this.database).getAll({
			project: {
				_id: 1,
				operationType: 1,
				'depositOrigin._id': 1,
				'depositOrigin.operationType': 1,
				'depositOrigin.branch._id': 1,
				'branchOrigin._id': 1,
				'branchOrigin.operationType': 1,
				'depositDestination._id': 1,
				'depositDestination.operationType': 1,
				'depositDestination.branch._id': 1,
				'depositDestination.branch.operationType': 1,
				'type._id': 1,
				'type.stockMovement': 1,
				'type.operationType': 1,
			},
			match: {
				_id: { $oid: transactionId },
				operationType: { $ne: 'D' },
				'type.operationType': { $ne: 'D' },
				'depositOrigin.operationType': { $ne: 'D' },
				'branchOrigin.operationType': { $ne: 'D' },
				'depositDestination.operationType': { $ne: 'D' },
				'depositDestination.branch.operationType': { $ne: 'D' },
			}
		})
			.then(async (result: Responseable) => {
				if (result.status === 200) {
					if (result.result.length > 0) {
						transaction = result.result[0];
						this.isDataTransactionValid(transaction)
							.then(async (result: Responseable) => {
								if (result.status === 200) {
									this.processStockByTransaction(transaction)
										.then((result: Responseable) => {
											if (result.status === 200) {
												response.send(new Responser(200, transaction));
											} else {
												next(new HttpException(new Responser(result.status, null, result.message, result)));
											};
										})
										.catch((error: Responseable) => {
											next(new HttpException(new Responser(500, null, error.message, error)))
										});
								} else {
									next(new HttpException(new Responser(result.status, null, result.message, result)));
								}
							})
							.catch((error: Responseable) => {
								next(new HttpException(new Responser(500, null, error.message, error)))
							});
					} else {
						next(new NotFoundException(transactionId));
					}
				} else {
					next(new HttpException(new Responser(result.status, null, result.message, result)));
				}
			}).catch((error: Responseable) => {
				next(new HttpException(new Responser(500, null, error.message, error)))
			});
	}

	public processStockByTransaction = async (transaction: Transaction) => {
		return new Promise<Responseable>(async (resolve, reject) => {
			// TRAEMOS DE LA BASE EL MOVIMIENTO DEL ARTÍCULO
			await new MovementOfArticleController(this.database).getAll({
				project: {
					_id: 1,
					stockMovement: 1,
					amount: 1,
					quantityForStock: 1,
					operationType: 1,
					transaction: 1,
					code: 1,
					'deposit._id': 1,
					'deposit.branch._id': 1,
					'deposit.branch.operationType': 1,
					'deposit.audit': 1,
					'article._id': 1,
					'article.operationType': 1,
					'article.containsStructure': 1,
					'article.allowStock': 1,
					'movementParent': 1,
					'recalculateParent': 1,
					'article.deposits._id': 1,
					'article.deposits.branch._id': 1,
					'audits': 1
				},
				match: {
					operationType: { $ne: 'D' },
					transaction: { $oid: transaction._id },
					article: { $exists: true },
					'deposit.operationType': { $ne: 'D' },
					'deposit.branch.operationType': { $ne: 'D' },
					'article.operationType': { $ne: 'D' },
				}
			}).then(async (result: Responseable) => {
				if (result.status === 200) {
					let endProcess: boolean = false;
					if (result.result.length > 0) {
						const movementsOfArticles: MovementOfArticle[] = result.result;
						for (let movementOfArticle of movementsOfArticles) {
							if (!endProcess) {
								await this.processStockByMovementOfArticle(movementOfArticle, transaction)
									.then((result: Responseable) => {
										if (result.status !== 200) {
											endProcess = true;
											reject(new HttpException(new Responser(result.status, null, result.message, result)));
										}
									})
									.catch((error: Responseable) => {
										endProcess = true;
										reject(new HttpException(new Responser(500, null, error.message, error)));
									})
							}
						}
						if (!endProcess) {
							resolve(new Responser(200, transaction))
						};
					} else {
						endProcess = true;
						reject(new HttpException(new Responser(404, null, 'No se encontraron productos en la transacción', 'No se encontraron productos en la transacción')));
					}
				} else reject(new HttpException(new Responser(result.status, null, result.message, result)));
			}
			).catch((error: Responseable) => reject(new HttpException(new Responser(500, null, error.message, error))));
		});
	}

	public processStockByMovementOfArticle = async (
		movementOfArticle: MovementOfArticle,
		transaction: Transaction
	): Promise<Responseable> => {
		return new Promise<Responseable>(async (resolve, reject) => {
			let endProcess: boolean = false;
			let movementOfArticleDestination: MovementOfArticle; // Para el caso de la transferencia
			let quantityForStock: number;

			if (!endProcess) {
				await this.isDataTransactionValid(transaction)
					.catch((error: Responseable) => { endProcess = true; reject(new HttpException(new Responser(500, null, error.message, error))) });
			}

			if (!endProcess) {
				await this.isDataMovementOfArticleValid(movementOfArticle, transaction)
					.catch((error: Responseable) => { endProcess = true; reject(new HttpException(new Responser(500, null, error.message, error))) });
			}

			// BUSCAMOS EL STOCK DEL ARTÍCULO
			if (!endProcess) {
				await new ArticleStockController(this.database).getAll({
					match: {
						operationType: { $ne: 'D' },
						deposit: { $oid: movementOfArticle.deposit._id },
						article: { $oid: movementOfArticle.article._id }
					}
				})
					.then(async (result: Responseable) => {
						if (result.status == 200) {
							if (!result.result || result.result.length === 0) {
								let articleStock: ArticleStock = ArticleStockSchema.getInstance(this.database);
								articleStock.article = movementOfArticle.article;
								articleStock.branch = movementOfArticle.deposit.branch;
								articleStock.deposit = movementOfArticle.deposit;
								articleStock.minStock = 0;
								articleStock.realStock = 0;
								articleStock.code = movementOfArticle.code;

								if (!endProcess) {
									if (movementOfArticle.stockMovement === StockMovement.Inflows ||
										movementOfArticle.stockMovement === StockMovement.Inventory) {
										quantityForStock = movementOfArticle.amount;
									} else if (movementOfArticle.stockMovement === StockMovement.Transfer) {
										// VALIDAMOS SI TIENE MISMO ORIGEN, SE RESTA LA CANTIDAD PARA STOCK, SI ES EL DESTINO SE SUMA
										if (transaction.branchOrigin._id.toString() === movementOfArticle.deposit.branch._id.toString()) {
											quantityForStock = movementOfArticle.amount * -1;
											// DUPLICAMOS EL MOV OF ARTICLE PARA TRANSFERENCIA
											if (movementOfArticle.stockMovement === StockMovement.Transfer) {
												let mov: MovementOfArticle = MovementOfArticleSchema.getInstance(this.database);
												const _id: string = mov._id;
												await new MovementOfArticleController(this.database).getById(movementOfArticle._id)
													.then(async (result: Responseable) => {
														if (result.status === 200) {
															mov = Object.assign(mov, result.result);
															mov._id = _id;
															mov.quantityForStock = 0;
															mov.deposit = DepositSchema.getInstance(this.database);
															mov.deposit = Object.assign(mov.deposit, transaction.depositDestination);
															mov.deposit.branch = BranchSchema.getInstance(this.database);
															mov.deposit.branch = Object.assign(mov.deposit.branch, transaction.depositDestination.branch);
															await new MovementOfArticleController(this.database).save(mov).then(
																(result: Responseable) => {
																	if (result.status === 200) movementOfArticleDestination = mov;
																	else {
																		endProcess = true;
																		reject(new HttpException(new Responser(result.status, null, result.message, result)));
																	}
																}
															).catch((error: Responseable) => {
																endProcess = true;
																reject(new HttpException(new Responser(500, null, error.message, error)));
															});
														}
													})
													.catch((error: Responseable) => {
														endProcess = true;
														reject(new HttpException(new Responser(500, null, error.message, error)))
													});
											}
										} else {
											quantityForStock = movementOfArticle.amount;
										}
									} else {
										quantityForStock = movementOfArticle.amount * -1;
									}

									articleStock.realStock = quantityForStock; // ASIGNAMOS LA CANTIDAD CALCULADA SEGÚN EL TIPO DE TRANSACCIÓN Y SUS MOVIMIENTOS
									movementOfArticle.quantityForStock = quantityForStock;

									await new ArticleStockController(this.database).save(articleStock).then(
										async (result: Responseable) => {
											if (result.status === 200) {
												new WooCommerceController(this.database).syncArticles(movementOfArticle.article._id);
												new MercadoLibreController(this.database).syncArticles(movementOfArticle.article._id);
												await new MovementOfArticleController(this.database).update(movementOfArticle._id, movementOfArticle).then(
													async (result: Responseable) => {
														if (result.status === 200) {
															if (movementOfArticleDestination) {
																await this.processStockByMovementOfArticle(movementOfArticleDestination, transaction)
																	.then((result: Responseable) => {
																		if (result.status === 200) {
																			endProcess = true;
																			resolve(new Responser(200, transaction));
																		} else {
																			endProcess = true;
																			reject(new HttpException(new Responser(result.status, null, result.message, result)));
																		}
																	})
																	.catch((error: Responseable) => {
																		endProcess = true;
																		reject(new HttpException(new Responser(500, null, error.message, error)));
																	})
															} else {
																endProcess = true;
																resolve(new Responser(200, transaction));
															}
														} else {
															endProcess = true;
															reject(new HttpException(new Responser(result.status, null, result.message, result)));
														}
													}
												).catch((error: Responseable) => {
													endProcess = true;
													reject(new HttpException(new Responser(500, null, error.message, error)));
												});
											} else {
												endProcess = true;
												reject(new HttpException(new Responser(result.status, null, result.message, result)));
											}
										}
									).catch((error: Responseable) => {
										endProcess = true;
										reject(new HttpException(new Responser(500, null, error.message, error)));
									});
								}
							} else {
								if (!endProcess) {
									let articleStock: ArticleStock = result.result[0];
									if (movementOfArticle.stockMovement === StockMovement.Inventory) {
										if (!isNaN(movementOfArticle.quantityForStock)) articleStock.realStock += movementOfArticle.quantityForStock;
										quantityForStock = (articleStock.realStock - movementOfArticle.amount) * -1;
									} else if (movementOfArticle.stockMovement === StockMovement.Inflows) {
										quantityForStock = movementOfArticle.amount;
									} else if (movementOfArticle.stockMovement === StockMovement.Transfer) {
										// VALIDAMOS SI TIENE MISMO ORIGEN, SE RESTA LA CANTIDAD PARA STOCK, SI ES EL DESTINO SE SUMA
										if (transaction.branchOrigin._id.toString() === movementOfArticle.deposit.branch._id.toString()) {
											quantityForStock = movementOfArticle.amount * -1;
										} else {
											quantityForStock = movementOfArticle.amount;
										}
									} else {
										quantityForStock = movementOfArticle.amount * -1;
									}

									if (!isNaN(movementOfArticle.quantityForStock) &&
										movementOfArticle.quantityForStock !== quantityForStock) {
										let diff = 0;
										if (!isNaN(movementOfArticle.quantityForStock)) {
											diff += movementOfArticle.quantityForStock;
										};
										articleStock.realStock += quantityForStock - diff;
										// DUPLICAMOS EL MOV OF ARTICLE PARA TRANSFERENCIA
										if (transaction.branchOrigin._id.toString() === movementOfArticle.deposit.branch._id.toString() &&
											movementOfArticle.stockMovement === StockMovement.Transfer) {
											let mov: MovementOfArticle = MovementOfArticleSchema.getInstance(this.database);
											const _id: string = mov._id;
											await new MovementOfArticleController(this.database).getById(movementOfArticle._id)
												.then(async (result: Responseable) => {
													if (result.status === 200) {
														mov = Object.assign(mov, result.result);
														mov._id = _id;
														mov.amount = movementOfArticle.amount + diff;
														mov.quantityForStock = 0;
														mov.deposit = DepositSchema.getInstance(this.database);
														mov.deposit = Object.assign(mov.deposit, transaction.depositDestination);
														mov.deposit.branch = BranchSchema.getInstance(this.database);
														mov.deposit.branch = Object.assign(mov.deposit.branch, transaction.depositDestination.branch);
														await new MovementOfArticleController(this.database).save(mov).then(
															(result: Responseable) => {
																if (result.status === 200) movementOfArticleDestination = mov;
																else {
																	endProcess = true;
																	reject(new HttpException(new Responser(result.status, null, result.message, result)));
																}
															}
														).catch((error: Responseable) => {
															endProcess = true;
															reject(new HttpException(new Responser(500, null, error.message, error)));
														});
													}
												})
												.catch((error: Responseable) => {
													endProcess = true;
													reject(new HttpException(new Responser(500, null, error.message, error)))
												});
										}

										if (!endProcess) {
											await new ArticleStockController(this.database).update(articleStock._id, articleStock).then(
												async result => {
													if (result.status === 200) {
														new WooCommerceController(this.database).syncArticles(movementOfArticle.article._id);
														new MercadoLibreController(this.database).syncArticles(movementOfArticle.article._id);

														if (movementOfArticle && movementOfArticle.recalculateParent && movementOfArticle.article && movementOfArticle.article.allowStock) {
															await this.recalculateStruct(movementOfArticle, articleStock.realStock);
														}

														movementOfArticle.quantityForStock = quantityForStock;
														await new MovementOfArticleController(this.database).update(movementOfArticle._id, movementOfArticle)
															.then(async (result: Responseable) => {
																if (result.status === 200) {
																	if (movementOfArticleDestination) {
																		await this.processStockByMovementOfArticle(movementOfArticleDestination, transaction)
																			.then((result: Responseable) => {
																				if (result.status === 200) {
																					endProcess = true;
																					resolve(new Responser(200, transaction));
																				} else {
																					endProcess = true;
																					reject(new HttpException(new Responser(result.status, null, result.message, result)));
																				}
																			})
																			.catch((error: Responseable) => {
																				endProcess = true;
																				reject(new HttpException(new Responser(500, null, error.message, error)));
																			})
																	} else {
																		endProcess = true;
																		resolve(new Responser(200, transaction));
																	}
																} else {
																	endProcess = true;
																	reject(new HttpException(new Responser(result.status, null, result.message, result)));
																}
															}
															).catch((error: Responseable) => {
																endProcess = true;
																reject(new HttpException(new Responser(500, null, error.message, error)));
															});
													} else {
														endProcess = true;
														reject(new HttpException(new Responser(result.status, null, result.message, result)));
													}
												}
											).catch((error: Responseable) => {
												endProcess = true;
												reject(new HttpException(new Responser(500, null, error.message, error)));
											});
										}
									} else {
										if (!endProcess) {
											if (movementOfArticle.stockMovement === StockMovement.Inventory) {
												await new MovementOfArticleController(this.database).update(movementOfArticle._id, movementOfArticle)
													.then(async (result: Responseable) => {
														if (result.status === 200) {
															await new ArticleStockController(this.database).getById(articleStock._id)
																.then((result: Responseable) => {
																	endProcess = true;
																	resolve(result);
																})
																.catch((error: Responseable) => {
																	endProcess = true;
																	reject(new HttpException(new Responser(500, null, error.message, error)))
																});
														} else {
															endProcess = true;
															reject(new HttpException(new Responser(result.status, null, result.message, result)));
														}
													})
													.catch((error: Responseable) => {
														endProcess = true;
														reject(new HttpException(new Responser(500, null, error.message, error)))
													});
											} else {
												await new ArticleStockController(this.database).getById(articleStock._id)
													.then((result: Responseable) => {
														endProcess = true;
														resolve(result)
													})
													.catch((error: Responseable) => {
														endProcess = true;
														reject(new HttpException(new Responser(500, null, error.message, error)))
													});
											}
										}
									}
								}
							}
						} else {
							endProcess = true;
							reject(new HttpException(new Responser(result.status, null, result.message, result)));
						}
					}).catch((error: Responseable) => { endProcess = true; reject(new HttpException(new Responser(500, null, error.message, error))) });;
			}
		});
	}

	async recalculateStruct(movArticle: MovementOfArticle, stockChild: number): Promise<boolean> {

		return new Promise<boolean>(async (resolve, reject) => {

			//me traigo el movarticle del parent por que no me lo idrata cuando viene 
			if (movArticle.movementParent) {
				await new MovementOfArticleController(this.database).getById(movArticle.movementParent.toString())
					.then(async (result: Responseable) => {

						if (result && result.status == 200) {
							let movArticleParent: MovementOfArticle = result.result;

							//consulto todas las estrucutras del articulo del movimiento sacando la del movparent para no descontar dos veces
							await new StructureController(this.database).getAll({
								match: {
									child: { $oid: movArticle.article._id },
									parent: { "$ne": { $oid: movArticleParent.article.toString() } },
									operationType: { $ne: "D" }
								}
							}).then(async (result: Responseable) => {

								if (result && result.status === 200 && result.result && result.result.length > 0) {
									for (const structure of result.result) {

										//actualizado los padres de la estrctura del deposito del movimiento
										await new ArticleStockController(this.database).getAll({
											match: {
												article: { $oid: structure.parent },
												deposit: { $oid: movArticle.deposit._id }
											}
										}).then(async (result: Responseable) => {
											if (result && result.status === 200) {
												for (const articleStock of result.result) {

													let realStock = stockChild / structure.quantity;
													articleStock.realStock = Math.trunc(realStock);

													await new ArticleStockController(this.database).update(articleStock._id, articleStock).then(
														async result => {
															if (result && result.status === 200) {
																let articleId = result.result.article;
																new WooCommerceController(this.database).syncArticles(articleId);
																new MercadoLibreController(this.database).syncArticles(articleId);
															}
														})
												}
												resolve(true);
											}
										}).catch((error: Responseable) => {
											resolve(false)
										});
									}
								} else {
									resolve(false)
								}

							}).catch((error: Responseable) => {
								resolve(false)
							});
						} else {
							resolve(false);
						}
					}).catch((error: Responseable) => {
						resolve(false)
					});
			} else {
				await new StructureController(this.database).getAll({
					match: {
						child: { $oid: movArticle.article._id },
						operationType: { $ne: "D" }
					}
				}).then(async (result: Responseable) => {

					if (result && result.status === 200 && result.result && result.result.length > 0) {
						for (const structure of result.result) {

							//actualizado los padres de la estrctura del deposito del movimiento
							await new ArticleStockController(this.database).getAll({
								match: {
									article: { $oid: structure.parent },
									deposit: { $oid: movArticle.deposit._id }
								}
							}).then(async (result: Responseable) => {
								if (result && result.status === 200) {
									for (const articleStock of result.result) {

										let realStock = stockChild / structure.quantity;
										articleStock.realStock = Math.trunc(realStock);

										await new ArticleStockController(this.database).update(articleStock._id, articleStock).then(
											async result => {
												if (result && result.status === 200) {
													let articleId = result.result.article;
													new WooCommerceController(this.database).syncArticles(articleId);
													new MercadoLibreController(this.database).syncArticles(articleId);
												}
											})
									}
									resolve(true);
								}
							}).catch((error: Responseable) => {
								resolve(false)
							});
						}
					} else {
						resolve(false)
					}

				}).catch((error: Responseable) => {
					resolve(false)
				});
			}

		});
	}

	private isDataMovementOfArticleValid(movementOfArticle: MovementOfArticle, transaction: Transaction): Promise<Responseable> {

		return new Promise<Responseable>((resolve, reject) => {

			let isValid: boolean = true;

			// VALIDAR DATOS DEL MOVIMIENTO DEL ARTÍCULO PARA PODER REALIZAR LOS CÁLCULOS
			if (isValid && movementOfArticle.amount === undefined) {
				isValid = false;
				reject(new HttpException(new Responser(400, null, 'El campo cantidad en el movimiento del artículo es requerido', 'El campo cantidad en el movimiento del artículo es requerido')));
			}
			if (isValid && !movementOfArticle.stockMovement) {
				isValid = false;
				reject(new HttpException(new Responser(400, null, 'El campo movimiento de stock en el movimiento del artículo es requerido', 'El campo movimiento de stock en el movimiento del artículo es requerido')));
			}
			if (isValid && (!movementOfArticle.article || !movementOfArticle.article._id)) {
				isValid = false;
				reject(new HttpException(new Responser(400, null, 'El campo identificador de artículo en el movimiento del artículo es requerido', 'El campo identificador de artículo en el movimiento del artículo es requerido')));
			}

			if (isValid && (!movementOfArticle.deposit || !movementOfArticle.deposit._id)) {

				if (transaction.type.stockMovement !== StockMovement.Transfer) {
					movementOfArticle.deposit = transaction.depositDestination;
				} else {
					movementOfArticle.deposit = transaction.depositOrigin;
				}

				if (movementOfArticle.article.deposits && movementOfArticle.article.deposits.length > 0) {
					for (const dep of movementOfArticle.article.deposits) {
						if (dep.deposit && dep.deposit.branch && dep.deposit.branch._id.toString() === transaction.branchDestination._id.toString()) {
							movementOfArticle.deposit = dep.deposit;
						}
					}
				}
			}

			if (isValid && !movementOfArticle.deposit._id) {
				isValid = false;
				reject(new HttpException(new Responser(400, null, 'El campo identificador de depósito en el movimiento del artículo es requerido', 'El campo identificador de depósito en el movimiento del artículo es requerido')));
			}

			if (isValid && (!movementOfArticle.deposit.branch || !movementOfArticle.deposit.branch._id)) {
				isValid = false;
				reject(new HttpException(new Responser(400, null, 'El campo identificador de sucursal en el depósito del movimiento del artículo es requerido', 'El campo identificador de sucursal en el depósito del movimiento del artículo es requerido')));
			}

			if (isValid) resolve(new Responser(200, true));
		});
	}

	private isDataTransactionValid(transaction: Transaction): Promise<Responseable> {

		return new Promise<Responseable>((resolve, reject) => {

			let isValid: boolean = true;

			// VALIDAR DATOS DE LA TRANSACCIÓN PARA PODER REALIZAR LOS CÁLCULOS
			if (isValid && (!transaction || !transaction._id)) {
				isValid = false;
				reject(new HttpException(new Responser(400, null, 'El campo identificador de transacción en el movimiento del artículo es requerido', 'El campo identificador de transacción en el movimiento del artículo es requerido')));
			}
			if (isValid && (!transaction.depositOrigin || !transaction.depositOrigin._id)) {
				isValid = false;
				reject(new HttpException(new Responser(400, null, 'El campo identificador de depósito origen en la transacción es requerido', 'El campo identificador de depósito origen en la transacción es requerido')));
			}
			if (isValid && (!transaction.depositOrigin.branch || !transaction.depositOrigin.branch._id)) {
				isValid = false;
				reject(new HttpException(new Responser(400, null, 'El campo identificador de sucursal de depósito origen en la transacción es requerido', 'El campo identificador de depósito origen en la transacción es requerido')));
			}
			if (isValid && (!transaction.branchOrigin || !transaction.branchOrigin._id)) {
				isValid = false;
				reject(new HttpException(new Responser(400, null, 'El campo identificador de sucursal origen en la transacción es requerido', 'El campo identificador de sucursal origen en la transacción es requerido')));
			}
			if (isValid && (!transaction.depositDestination || !transaction.depositDestination._id)) {
				isValid = false;
				reject(new HttpException(new Responser(400, null, 'El campo identificador de depósito destino en la transacción es requerido', 'El campo identificador de depósito destino en la transacción es requerido')));
			}
			if (isValid && (!transaction.depositDestination.branch || !transaction.depositDestination.branch._id)) {
				isValid = false;
				reject(new HttpException(new Responser(400, null, 'El campo identificador de sucursal de depósito destino en la transacción es requerido', 'El campo identificador de depósito destino en la transacción es requerido')));
			}
			if (isValid && (!transaction.type || !transaction.type._id)) {
				isValid = false;
				reject(new HttpException(new Responser(400, null, 'El campo identificador del tipo de transacción es requerido', 'El campo identificador del tipo de transacción es requerido')));
			}
			if (isValid && (!transaction.type || !transaction.type.stockMovement)) {
				isValid = false;
				reject(new HttpException(new Responser(400, null, 'El campo movimiento de stock en el tipo de transacción es requerido', 'El campo movimiento de stock en el tipo de transacción es requerido')));
			}

			if (isValid) resolve(new Responser(200, true));
		});
	}
}
