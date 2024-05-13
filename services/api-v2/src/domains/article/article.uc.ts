import * as axios from 'axios'
import Responseable from 'interfaces/responsable.interface'

import { ArticleFieldType } from './../../domains/article-field/article-field.interface'
import FileUC from './../../domains/file/file.uc'
import MovementOfArticleController from './../../domains/movement-of-article/movement-of-article.controller'
import MovementOfArticle from './../../domains/movement-of-article/movement-of-article.interface'
import StructureController from './../../domains/structure/structure.controller'
import Structure from './../../domains/structure/structure.interface'
import { PriceType } from './../../domains/transaction-type/transaction-type.interface'
import MercadoLibreController from './../../domains/uc/mercadolibre.controller'
import WooCommerceController from './../../domains/uc/woocomerce.controller'
import VariantController from './../../domains/variant/variant.controller'
import Variant from './../../domains/variant/variant.interface'
import Responser from './../../utils/responser'
import ArticleController from './article.controller'
import Article from './article.interface'
import MakeController from '../make/make.controller'
import Make from '../make/make.interface'
import CategoryController from '../category/category.controller'
import Category from '../category/category.interface'
import MakeSchema from '../make/make.model'
import CategorySchema from '../category/category.model'
import ArticleSchema from '../article/article.model'
import Printer from '../printer/printer.interface'
import PrinterController from '../printer/printer.controller'
import UnitOfMeasurement from '../unit-of-measurement/unit-of-measurement.interface'
import UnitOfMeasurementController from '../unit-of-measurement/unit-of-measurement.controller'
import Tax from '../tax/tax.interface'
import TaxController from '../tax/tax.controller'
import ApplicationController from '../application/application.controller'
import { Application, application } from 'express'
import VariantSchema from '../variant/variant.model'
import ArticleStock from '../article-stock/article-stock.interface'
import ArticleStockSchema from '../article-stock/article-stock.model'
import BranchController from '../branch/branch.controller'
import Branch from '../branch/branch.interface'
import Deposit from '../deposit/deposit.interface'
import DepositController from '../deposit/deposit.controller'
import VariantTypeController from '../variant-type/variant-type.controller'
import VariantType from '../variant-type/variant-type.interface'
import VariantTypeSchema from '../variant-type/variant-type.model'
import VariantValueController from '../variant-value/variant-value.controller'
import VariantValue from '../variant-value/variant-value.interface'
import VariantValueSchema from '../variant-value/variant-value.model'
import { ObjectId } from 'mongodb';

export default class ArticleUC {
	database: string
	articleController: ArticleController
	api: any
	authToken: string

	constructor(database: string, authToken?: string) {
		this.database = database
		this.authToken = authToken
		this.articleController = new ArticleController(database)
		this.api = axios.default
	}

	updatePurchasePrice = async (transactionId: string): Promise<MovementOfArticle> => {
		return new Promise<MovementOfArticle>(async (resolve, reject) => {
			new MovementOfArticleController(this.database)
				.getAll({
					project: {
						basePrice: 1,
						transaction: 1,
						'article._id': 1,
					},
					match: {
						transaction: { $oid: transactionId },
					},
				})
				.then(async (result: Responseable) => {
					if (result && result.result.length > 0) {
						const movsArticle: MovementOfArticle[] = result.result

						for (const mov of movsArticle) {
							this.articleController.update(mov.article._id, {
								purchasePrice: mov.basePrice,
							})
						}
					}
				})
				.catch((error: Responseable) => reject(error))
		})
	}

	updateCostByStruct = async (): Promise<boolean> => {
		return new Promise<boolean>(async (resolve, reject) => {
			new ArticleController(this.database)
				.getAll({
					project: {
						containsStructure: 1,
						operationType: 1,
					},
					match: {
						operationType: { $ne: 'D' },
						containsStructure: true,
					},
				})
				.then(async (result: Responseable) => {
					if (result && result.result.length > 0) {
						const articles: Article[] = result.result

						for (const article of articles) {
							new StructureController(this.database)
								.getAll({
									project: {
										parent: 1,
										'child.basePrice': 1,
										operationType: 1,
									},
									match: {
										parent: { $oid: article._id },
										operationType: { $ne: 'D' },
									},
								})
								.then(async (result: Responseable) => {
									if (result && result.result.length > 0) {
										const structures: Structure[] = result.result
										let costPrice: Number

										for (const structure of structures) {
											costPrice = +structure.child.basePrice
										}
										new ArticleController(this.database).update(article._id, {
											costPrice2: costPrice,
										})
									} else {
										reject(result)
									}
								})
								.catch((error: Responseable) => reject(error))
						}
					} else {
						reject(result)
					}
				})
				.catch((error: Responseable) => reject(error))
		})
	}

	recalculatePrices = async (
		articlesCode: string[],
		typePrice: PriceType | string,
		decimal: number,
		percentage: number,
	) => {
		let articlesFails = 0
		let articlesOk = 0

		return new Promise<Responser>(async (resolve) => {
			if (articlesCode && articlesCode.length > 0) {
				for (let i = 0; i < articlesCode.length; i++) {
					let article: Article = await this.getArticleByCode(articlesCode[i])

					switch (typePrice) {
						case 'basePrice':
							article.costPrice = 0
							article.basePrice = this.roundNumber(
								(article.basePrice * percentage) / 100 + article.basePrice,
								decimal,
							)
							let taxedAmount = article.basePrice

							if (article.otherFields && article.otherFields.length > 0) {
								for (const field of article.otherFields) {
									if (field.articleField.datatype === ArticleFieldType.Percentage) {
										field.amount = this.roundNumber(
											(article.basePrice * parseFloat(field.value)) / 100,
											decimal,
										)
									} else if (field.articleField.datatype === ArticleFieldType.Number) {
										field.amount = parseFloat(field.value)
									}
									if (field.articleField.modifyVAT) {
										taxedAmount += field.amount
									} else {
										article.costPrice += field.amount
									}
								}
							}

							if (article.taxes && article.taxes.length > 0) {
								for (const articleTax of article.taxes) {
									articleTax.taxBase = taxedAmount
									articleTax.taxAmount = this.roundNumber(
										(taxedAmount * articleTax.percentage) / 100,
										decimal,
									)
									article.costPrice += articleTax.taxAmount
								}
							}
							article.costPrice += taxedAmount

							if (!(taxedAmount === 0 && article.salePrice !== 0)) {
								article.markupPrice = this.roundNumber(
									(article.costPrice * article.markupPercentage) / 100,
									decimal,
								)
								article.salePrice = article.costPrice + article.markupPrice
							}
							break
						case 'costPrice':
							break
						case 'markupPercentage':
							article.markupPercentage += percentage
							article.markupPercentage = this.roundNumber(article.markupPercentage, decimal)
							article.markupPrice = this.roundNumber(
								(article.costPrice * article.markupPercentage) / 100,
							)
							article.salePrice = article.costPrice + article.markupPrice
							break
						case 'salePrice':
							article.salePrice += this.roundNumber((percentage * article.salePrice) / 100)
							article.salePrice = this.roundNumber(article.salePrice, decimal)
							if (article.basePrice === 0) {
								article.costPrice === 0
								article.markupPercentage = 100
								article.markupPrice = article.salePrice
							} else {
								article.markupPrice = article.salePrice - article.costPrice
								article.markupPercentage = this.roundNumber((article.markupPrice / article.costPrice) * 100, decimal)
							}
							break
						default:
							break
					}

					const result = await new ArticleController(this.database).update(
						article._id,
						article,
					)

					if (result.status === 200) {
						articlesOk++
					} else {
						articlesFails++
					}
				}
			} else {
				const articles: Article[] = await this.getArticles();

				for (const article of articles) {

					switch (typePrice) {
						case 'basePrice':
							article.costPrice = 0
							article.basePrice = this.roundNumber(
								(article.basePrice * percentage) / 100 + article.basePrice,
								decimal,
							)
							let taxedAmount = article.basePrice

							if (article.otherFields && article.otherFields.length > 0) {
								for (const field of article.otherFields) {
									if (field.articleField.datatype === ArticleFieldType.Percentage) {
										field.amount = this.roundNumber(
											(article.basePrice * parseFloat(field.value)) / 100,
											decimal,
										)
									} else if (field.articleField.datatype === ArticleFieldType.Number) {
										field.amount = parseFloat(field.value)
									}
									if (field.articleField.modifyVAT) {
										taxedAmount += field.amount
									} else {
										article.costPrice += field.amount
									}
								}
							}

							if (article.taxes && article.taxes.length > 0) {
								for (const articleTax of article.taxes) {
									articleTax.taxBase = taxedAmount
									articleTax.taxAmount = this.roundNumber(
										(taxedAmount * articleTax.percentage) / 100,
										decimal,
									)
									article.costPrice += articleTax.taxAmount
								}
							}
							article.costPrice += taxedAmount

							if (!(taxedAmount === 0 && article.salePrice !== 0)) {
								article.markupPrice = this.roundNumber(
									(article.costPrice * article.markupPercentage) / 100,
									decimal,
								)
								article.salePrice = article.costPrice + article.markupPrice
							}
							break
						case 'costPrice':
							break
						case 'markupPercentage':
							article.markupPercentage += percentage
							article.markupPercentage = this.roundNumber(article.markupPercentage, decimal)
							article.markupPrice = this.roundNumber(
								(article.costPrice * article.markupPercentage) / 100,
							)
							article.salePrice = article.costPrice + article.markupPrice
							break
						case 'salePrice':
							article.salePrice += this.roundNumber((percentage * article.salePrice) / 100)
							article.salePrice = this.roundNumber(article.salePrice, decimal)
							if (article.basePrice === 0) {
								article.costPrice === 0
								article.markupPercentage = 100
								article.markupPrice = article.salePrice
							} else {
								article.markupPrice = article.salePrice - article.costPrice
								article.markupPercentage = this.roundNumber(
									(article.markupPrice / article.costPrice) * 100,
								)
							}
							break
						default:
							break
					}

					const result = await new ArticleController(this.database).update(
						article._id,
						article,
					)

					if (result.status === 200) {
						articlesOk++
					} else {
						articlesFails++
					}
				}


			}

			resolve(new Responser(200, { articlesOk, articlesFails }, null, null))
		})
	}

	getArticleByCode = async (code: string) => {
		return new Promise<Article>(async (resolve) => {
			await new ArticleController(this.database)
				.getAll({
					project: {
						code: 1,
						salePrice: 1,
						costPrice: 1,
						costPrice2: 1,
						basePrice: 1,
						markupPercentage: 1,
						markupPrice: 1,
						taxes: 1,
						operationType: 1,
					},
					match: {
						code: { $regex: code, $options: 'i' },
						operationType: { $ne: 'D' },
					},
				})
				.then((result: Responseable) => {
					if (result.status === 200) resolve(result.result[0])
				})
		})
	}

	getArticles = async () => {
		return new Promise<Article[]>(async (resolve) => {
			await new ArticleController(this.database)
				.getAll({
					project: {
						code: 1,
						salePrice: 1,
						costPrice: 1,
						costPrice2: 1,
						basePrice: 1,
						markupPercentage: 1,
						markupPrice: 1,
						taxes: 1,
						operationType: 1,
					},
					match: {
						operationType: { $ne: 'D' },
					},
				})
				.then((result: Responseable) => {
					if (result.status === 200) resolve(result.result)
				})
		})
	}

	deleteArticle = async (articleId: string) => {
		try {
			const response = await new ArticleController(this.database).getById(articleId)
			const article: Article = response.result

			await this.articleController.delete(articleId)
			await new WooCommerceController(this.database).syncArticles(articleId)
			await new MercadoLibreController(this.database).syncArticles(articleId)
			if (article.picture && article.picture !== 'deafult.jpg') {
				try {
					await new FileUC(this.database, this.authToken).deleteFile('image', 'article', article.picture)
				} catch (error) {
					//ignore error
				}
			}
			article.pictures.forEach((picture) => {
				new FileUC(this.database, this.authToken).deleteFile('image', 'article', picture.picture)
			})

			if (article.containsVariants) {
				const variantsResponse: Responseable = await new VariantController(
					this.database,
				).getAll({
					project: { articleParent: 1, 'articleChild._id': 1 },
					match: { articleParent: { $oid: articleId } },
				})

				const variants: Variant[] = variantsResponse.result

				variants.forEach(async (variant) => {
					await this.deleteArticle(variant.articleChild._id)
				})

				await new VariantController(this.database).deleteMany({
					articleParent: articleId,
				})
			}

			if (article.containsStructure) {
				await new StructureController(this.database).deleteMany({
					parent: articleId,
				})

				await new StructureController(this.database).deleteMany({
					child: articleId,
				})
			}

			return
		} catch (error) {
			throw error
		}
	}

	roundNumber(value: any, numberOfDecimals: number = 2): number {

		if (value !== undefined && !isNaN(value)) {
			const multiplier = Math.pow(10, numberOfDecimals);
			return Math.round(value * multiplier) / multiplier;
		} else {
			return 0; // Si el valor no es un número válido, devuelve 0
		}

	}

	async importFromExcel(data: any[]) {
		return new Promise<{}>(async (resolve, reject) => {

			const response = {
				updateArticle: <any>[],
				notUpdateArticle: <any>[],
				countUpdate: 0,
				countNotUpdate: 0
			};

			const articlesObj: any = {};

			const articles = await new ArticleController(this.database).find({}, {});

			articles.forEach((item: any) => {
				if (item.code) {
					articlesObj[item.code] = item;
				}
			});

			await this.createMake(data)
			await this.createCategory(data)
			const makesObj = await this.getMake()
			const categoryObj = await this.getCategory()
			const printerObj = await this.getPrinters()
			const unitOfMeasurementObj = await this.getUnitOfMeasurement()
			const taxObj = await this.getTax()

			for (const item of data) {
				const calculatedSalePrice = this.calculateSalePrice(item.column11, item.column13, item.column14);
				if (item.column2 === '') {
					return reject(new Responser(500, null, "En el archivo Excel, hay códigos de productos que están incompletos."))
				}
				let code = item.column2;
				if (articlesObj[code]) {
					const article = articlesObj[code]
					const result = await new ArticleController(this.database).update(
						article._id,
						{
							order: item.column1 === "" ? article.order : item.column11,
							code: item.column2,
							barcode: item.column13 === "" ? article.barcode : item.column13,
							make: makesObj[item.column4] === undefined ? article.make : makesObj[item.column4]._id,
							category: categoryObj[item.column5] === undefined ? article.category : categoryObj[item.column5]?._id,
							description: item.column6 === "" ? article.description : item.column6.substring(0, 20),
							posDescription: item.column7 === "" ? article.posDescription : item.column7,
							unitOfMeasurement: unitOfMeasurementObj[item.column8] === "" ? article.unitOfMeasurement : unitOfMeasurementObj[item.column8]?._id,
							printIn: printerObj[item.column9] === "" ? article.unitOfMeasurement : printerObj[item.column9]?.name,
							observation: item.column10 === "" ? article.observation : item.column10,
							basePrice: calculatedSalePrice.basePrice2,
							taxes: item.column12 === "" ? article.tax : {
								tax: taxObj[item.column12]._id,
								percentage: taxObj[item.column12].percentage
							},
							markupPercentage: calculatedSalePrice.markupPercentage2,
							salePrice: calculatedSalePrice.salePrice2,
							weight: item.column15 === "" ? article.weight : item.column15,
							width: item.column16 === "" ? article.width : item.column16,
							height: item.column17 === "" ? article.height : item.column17,
							depth: item.column18 === "" ? article.depth : item.column18,
							allowPurchase: item.column19 === 'Si',
							allowSale: item.column20 === 'Si',
							allowStock: item.column21 === 'Si',
							allowSaleWithoutStock: item.column22 === 'Si',
							isWeigth: item.column23 === 'Si',
							allowMeasure: item.column24 === 'Si',
							posKitchen: item.column25 === 'Si',
							m3: item.column26 === "" ? item.m3 : item.column26,
						}
					);

					if (result.status === 200) {
						const code = result.result.code;
						if (!response.updateArticle.includes(code)) {
							response.updateArticle.push(code);
						}
						const indexToRemove = response.notUpdateArticle.indexOf(code);
						if (indexToRemove !== -1) {
							response.notUpdateArticle.splice(indexToRemove, 1);
						}
					}
				} else {
					let newArticle: Article = ArticleSchema.getInstance(this.database)
					newArticle = Object.assign(newArticle, {
						order: item.column1,
						code: item.column2,
						barcode: item.column3,
						make: makesObj[item.column4]?._id,
						category: categoryObj[item.column5]?._id,
						description: item.column6.substring(0, 20),
						posDescription: item.column7,
						unitOfMeasurement: unitOfMeasurementObj[item.column8]?._id,
						printIn: printerObj[item.column9]?.name,
						observation: item.column10,
						basePrice: calculatedSalePrice.basePrice2,
						taxes: item.column12 === "" ? {
							tax: taxObj[21]._id,
							percentage: taxObj[21].percentage
						} : {
							tax: taxObj[item.column12]._id,
							percentage: taxObj[item.column12].percentage
						},
						markupPercentage: calculatedSalePrice.markupPercentage2,
						salePrice: calculatedSalePrice.salePrice2,
						weight: item.column15,
						width: item.column16,
						height: item.column17,
						depth: item.column18,
						allowPurchase: item.column19 === 'Si',
						allowSale: item.column20 === 'Si',
						allowStock: item.column21 === 'Si',
						allowSaleWithoutStock: item.column22 === 'Si',
						isWeigth: item.column23 === 'Si',
						allowMeasure: item.column24 === 'Si',
						posKitchen: item.column25 === 'Si',
						m3: item.column26,
					})
					const result = await new ArticleController(this.database).save(newArticle);

					if (result.status === 200) {
						const code = result.result.code;
						if (!response.updateArticle.includes(code)) {
							response.updateArticle.push(code);
						}
						const indexToRemove = response.notUpdateArticle.indexOf(code);
						if (indexToRemove !== -1) {
							response.notUpdateArticle.splice(indexToRemove, 1);
						}
					}
				}
			}

			response.countUpdate = response.updateArticle.length;
			response.countNotUpdate = response.notUpdateArticle.length;
			resolve(response);
		})
	}

	async importProductTiendaNube(data: any) {
		const ArticlesObj: any = {};

		try {
			await this.createCategory(data)
			await this.createVariantTypes(data)
			await this.createVariantValues(data)
			//await this.createMake(data)

			const articles = await new ArticleController(this.database).getAll({
				project: {
					tiendaNubeId: 1,
					description: 1
				},
				match: {
					tiendaNubeId: { $exists: true, $ne: null }
				}
			});

			articles.result.forEach((item: any) => {
				if (item.tiendaNubeId) {
					ArticlesObj[item.tiendaNubeId] = item;
				}
			});

			//const makeObj= await this.getMake()
			const categoryObj = await this.getCategory()
			const taxObj = await this.getTax()
			const aplicationsObj = await this.getApplications()
			const branch = await this.getBranch()
			const deposit = await this.getDeposit()
			const variantType = await this.getVariantType()
			const variantValue = await this.getVariantValue()
			let code = await this.lastArticle()

			for (const [index, item] of data.entries()) {
				let tiendaNubeId = item.id;
				if (ArticlesObj[tiendaNubeId]) {
					const article = ArticlesObj[tiendaNubeId]
					if (item.attributes.length) {
						const variants = await this.getVariant(article._id)
						item.variants.forEach(async (art: any, index: any) => {
							const variantProducto = variants[index];
							const result = await new ArticleController(this.database).update(
								variantProducto.articleChild._id,
								{
									tiendaNubeId: art.inventory_levels[0].variant_id,
								}
							)
						})
					}
				} else {
					let newArticle: Article = ArticleSchema.getInstance(this.database)
					code++;
					newArticle = Object.assign(newArticle, {
						code: String(code).padStart(5, '0'),
						barcode: item.variants[0].sku,
						//make: makeObj[´']._id,
						category: categoryObj[item.categories[0]?.name.es] !== undefined ? categoryObj[item.categories[0].name.es]._id : null,
						description: item.name.es,
						url: item.canonical_url,
						posDescription: item.name.es,
						observation: item.variants[0].description,
						basePrice: 0,
						taxes: {
							tax: taxObj[21]._id,
							percentage: taxObj[21].percentage
						},
						markupPercentage: (item.variants[0].price === null || item.variants[0].cost === null) ? null : Number(Math.abs(((Number(item.variants[0].price) - Number(item.variants[0].cost)) / Number(item.variants[0].cost) * 100)).toFixed(2)),
						salePrice: item.variants[0].price,
						weight: item.variants[0].weight,
						width: item.variants[0].width,
						height: item.variants[0].height,
						depth: item.variants[0].depth,
						//picture: item.images[0]?.src,
						allowPurchase: true,
						allowSale: true,
						allowStock: true,
						allowSaleWithoutStock: item.variants[0].stock_management,
						// isWeigth: true,
						// allowMeasure: item.attributes.length > 0,
						// posKitchen: true,
						tiendaNubeId: item.id,
						applications: aplicationsObj['TiendaNube']._id,
						type: 'Final',
						tags: item.tags.split(',').map((tag: any) => tag.trim()),
						containsVariants: item.attributes.length > 0
					})
					const resultParent = await new ArticleController(this.database).save(newArticle);

					if (item.attributes.length) {
						item.variants.forEach(async (art: any) => {
							let newArticle: Article = ArticleSchema.getInstance(this.database)
							newArticle = Object.assign(newArticle, {
								code: resultParent.result.code,
								barcode: art.sku,
								//make: makeObj[´']._id,
								category: categoryObj[item.categories[0]?.name.es] !== undefined ? categoryObj[item.categories[0].name.es]._id : null,
								description: art.values.map((items: any) => items.es.toLowerCase()).join(' / '),
								url: art.canonical_url,
								posDescription: item.name.es,
								observation: item.description.es,
								basePrice: 0,
								taxes: {
									tax: taxObj[21]._id,
									percentage: taxObj[21].percentage
								},
								markupPercentage: (item.variants[0].price === null || item.variants[0].cost === null) ? null : Number(Math.abs(((Number(item.variants[0].price) - Number(item.variants[0].cost)) / Number(item.variants[0].cost) * 100)).toFixed(2)),
								salePrice: art.price,
								weight: art.weight,
								width: art.width,
								height: art.height,
								depth: art.depth,
								// picture: (() => {
								// 	const imageObject = item.images.find((img: any) => img.id === art.image_id);
								// 	return imageObject ? imageObject.src : null;
								// })(),
								allowPurchase: true,
								allowSale: true,
								allowStock: true,
								allowSaleWithoutStock: art.stock_management,
								// isWeigth: true,
								// allowMeasure: true,
								// posKitchen: true,
								tiendaNubeId: art.inventory_levels[0].variant_id,
								applications: aplicationsObj['TiendaNube']._id,
								type: 'Variante'
							})

							let resultChild = await new ArticleController(this.database).save(newArticle);
							art.values.forEach(async (artic: any, index: number) => {
								let newVariant: Variant = VariantSchema.getInstance(this.database);
								newVariant = Object.assign(newVariant, {
									type: variantType[item.attributes[index].es],
									value: variantValue[artic.es],
									articleParent: resultParent.result._id,
									articleChild: resultChild.result._id,
								});
								const resultVariant = await new VariantController(this.database).save(newVariant);
							});

							let newArticleStock: ArticleStock = ArticleStockSchema.getInstance(this.database);
							newArticleStock = Object.assign(newArticleStock, {
								article: resultChild.result._id,
								branch: branch,
								deposit: deposit,
								realStock: art.stock ?? 0,
								minStock: 0,
								maxStock: 0,
								code: resultChild.result.code
							})
							const resultArticleStock = await new ArticleController(this.database).save(newArticleStock);
						})
					} else {
						let newArticleStock: ArticleStock = ArticleStockSchema.getInstance(this.database);
						newArticleStock = Object.assign(newArticleStock, {
							article: resultParent.result._id,
							branch: branch,
							deposit: deposit,
							realStock: item.variants[0].stock ?? 0,
							minStock: 0,
							maxStock: 0,
							code: resultParent.result.code
						})
						const resultArticleStock = await new ArticleController(this.database).save(newArticleStock);

					}
				}
			}
		} catch (error) {
			console.log(error)
		}
	}

	async getPrinters() {
		try {
			let printersObj: any = {}
			let printers: Printer[] = await new PrinterController(this.database).find({}, {})
			printers.forEach((item: any) => {
				printersObj[item.printIn] = item;
			});
			return printersObj
		} catch (error) {
			throw error;
		}
	}

	async createCategory(data: any) {
		const categoriesObj: any = {};
		const categories = await new CategoryController(this.database).getAll({
			project: {
				tiendaNubeId: 1,
				description: 1
			},
			match: {
				description: { $exists: true, $ne: null }
			}
		});

		categories.result.forEach((item: any) => {
			if (item.description) {
				categoriesObj[item.description] = item;
			}
		});

		for (const item of data) {
			const description = item.categories === undefined ? item.column5 : item.categories[0]?.name?.es;
			if (!categoriesObj[description]) {
				if (description) {
					let newCategory: Category = CategorySchema.getInstance(this.database)
					newCategory = Object.assign(newCategory, {
						description: description,
						tiendaNubeId: item.categories[0].id
					})
					const result = await new MakeController(this.database).save(newCategory);
					categoriesObj[description] = newCategory;
				}
			}
		}
		return 200
	}

	async createVariantTypes(data: any) {
		const variantTypesObj: any = {};
		const variantTypes = await new VariantTypeController(this.database).getAll({
			project: {
				name: 1
			},
			match: {
				name: { $exists: true, $ne: null }
			}
		});

		variantTypes.result.forEach((item: any) => {
			if (item.name) {
				variantTypesObj[item.name] = item;
			}
		});

		for (const item of data) {
			await Promise.all(item.attributes.map(async (art: any) => {
				if (!variantTypesObj[art.es]) {
					let newVariantType: VariantType = VariantTypeSchema.getInstance(this.database);
					newVariantType = Object.assign(newVariantType, {
						name: art?.es,
						operationType: 'C'
					});

					const result = await new VariantTypeController(this.database).save(newVariantType);
					variantTypesObj[art.es] = newVariantType;
				}
			}));
		}
		return 200;
	}

	async createVariantValues(data: any) {
		const varinatValuesObj: any = {};
		const VariantValues = await new VariantValueController(this.database).getAll({
			project: {
				description: 1
			},
			match: {
				description: { $exists: true, $ne: null }
			}
		});

		VariantValues.result.forEach((item: any) => {
			if (item.description) {
				varinatValuesObj[item.description] = item;
			}
		});

		const variantType = await this.getVariantType();

		for (const item of data) {
			for (const art of item.variants) {
				for (const [index, artic] of art.values.entries()) {
					if (!varinatValuesObj[artic.es]) {
						let newVariantValue: VariantValue = VariantValueSchema.getInstance(this.database);
						newVariantValue = Object.assign(newVariantValue, {
							type: variantType[item.attributes[index]?.es],
							description: artic.es,
						});
						const result = await new VariantValueController(this.database).save(newVariantValue);
						varinatValuesObj[artic.es] = newVariantValue;
					}
				}
			}
		}

		return 200;
	}

	async getApplications() {
		try {
			let aplicationsObj: any = {}
			let applications: Application[] = await new ApplicationController(this.database).find({}, {})
			applications.forEach((item: any) => {
				aplicationsObj[item.type] = item;
			});
			return aplicationsObj
		} catch (error) {
			throw error;
		}
	}

	async getUnitOfMeasurement() {
		try {
			let unitOfMeasurementObj: any = {}
			let unitOfMeasurement: UnitOfMeasurement[] = await new UnitOfMeasurementController(this.database).find({}, {})
			unitOfMeasurement.forEach((item: any) => {
				unitOfMeasurementObj[item.name] = item;
			});
			return unitOfMeasurementObj
		} catch (error) {
			throw error;
		}
	}

	async getTax() {
		try {
			let taxObj: any = {}
			let tax: Tax[] = await new TaxController(this.database).find({}, {})

			tax.forEach((item: any) => {
				taxObj[item.percentage] = item;
			});
			return taxObj
		} catch (error) {
			throw error;
		}
	}

	async getVariantType() {
		try {
			let variantTypeObj: any = {}
			let variantType = await new VariantTypeController(this.database).find({}, {})

			variantType.forEach((item: any) => {
				variantTypeObj[item.name] = item;
			});
			return variantTypeObj
		} catch (error) {
			throw error;
		}
	}

	async getVariantValue() {
		try {
			let variantValueObj: any = {}
			let variantValue = await new VariantValueController(this.database).find({}, {})

			variantValue.forEach((item: any) => {
				variantValueObj[item.description] = item;
			});
			return variantValueObj

		} catch (error) {
			throw error;
		}
	}

	async getBranch() {
		try {
			let branch: Branch[] = await new BranchController(this.database).find({ default: true }, {})

			return branch[0]._id
		} catch (error) {
			throw error;
		}
	}

	async getDeposit() {
		try {
			let depesit: Deposit[] = await new DepositController(this.database).find({ default: true }, {})

			return depesit[0]._id
		} catch (error) {
			throw error;
		}
	}

	async createMake(data: any) {
		const makeObj: any = {};
		const makes = await new MakeController(this.database).getAll({
			project: {
				description: 1
			},
			match: {
				description: { $exists: true, $ne: null }
			}
		});

		makes.result.forEach((item: any) => {
			if (item.description) {
				makeObj[item.description] = item;
			}
		});

		for (const item of data) {
			let descripcion = item.column4
			if (!makeObj[descripcion]) {
				if (descripcion) {
					let make: Make = MakeSchema.getInstance(this.database)
					make = Object.assign(make, {
						description: descripcion
					})
					const result = await new MakeController(this.database).save(make);
					makeObj[descripcion] = make
				}
			}
		}
		return 200
	}

	async getMake() {
		let makeObj: any = {}
		let make: Make[] = await new MakeController(this.database).find({}, {})
		make.forEach((item: any) => {
			makeObj[item.description] = item;
		});
		return makeObj
	}

	async getCategory() {
		let categoryObj: any = {}
		let category: Category[] = await new CategoryController(this.database).find({}, {})
		category.forEach((item: any) => {
			categoryObj[item.description] = item;
		});
		return categoryObj
	}

	calculateSalePrice(basePrice: string, markupPercentage: string, salePrice: string) {
		let price = {
			basePrice2: 0,
			markupPercentage2: 0,
			salePrice2: 0
		}
		if (basePrice !== "" && markupPercentage !== "" && salePrice === "") {
			price.basePrice2 = Number(basePrice);
			price.markupPercentage2 = Number(markupPercentage);
			price.salePrice2 = Number((Number(basePrice) * (1 + Number(markupPercentage) / 100)).toFixed(2))

			return price
		} else if (basePrice === "" && markupPercentage === "" && salePrice !== "") {
			price.basePrice2 = Number(basePrice);
			price.markupPercentage2 = Number(markupPercentage);
			price.salePrice2 = Number(salePrice)

			return price;
		} else if (basePrice !== "" && markupPercentage === "" && salePrice !== "") {
			price.basePrice2 = Number(basePrice);
			price.markupPercentage2 = Number(Math.abs(((Number(salePrice) - Number(basePrice)) / Number(basePrice) * 100)).toFixed(2));

			price.salePrice2 = Number(salePrice)
			return price;
		} else {
			price.basePrice2 = Number(basePrice);
			price.markupPercentage2 = Number(markupPercentage);
			price.salePrice2 = Number(salePrice)

			return price;
		}
	}

	async lastArticle() {
		const todosLosProductos = await new ArticleController(this.database).getAll({
			match: {
				type: 'Final'
			}
		});

		if (todosLosProductos.result) {
			todosLosProductos.result.sort((a: any, b: any) => {
				const dateA = new Date(a.creationDate).getTime();
				const dateB = new Date(b.creationDate).getTime();
				return dateB - dateA;
			});
			const ultimoProducto = todosLosProductos.result[0];
			return ultimoProducto?.code ?? 0
		}
	}

	async getVariant(id: string) {
		let VariantObj: any = {}
		let variant: Variant[] = await new VariantController(this.database).find({
			articleParent: new ObjectId(id.toString()),
		}, {})
		// variant.forEach((item: any) => {
		// 	VariantObj[item._id] = item;
		// });
		//console.log(VariantObj)
		return variant

	}

}
