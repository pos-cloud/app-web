import Axios, * as axios from 'axios'
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
import ConfigController from '../config/config.controller'
import ArticleStockController from '../article-stock/article-stock.controller'
import Application from '../application/application.interface'
import { roundNumber } from '../../utils/roundNumber'
import VariantUC from '../variant/variant.uc'

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
							article.basePrice = roundNumber(
								(article.basePrice * percentage) / 100 + article.basePrice,
								decimal,
							)
							let taxedAmount = article.basePrice

							if (article.otherFields && article.otherFields.length > 0) {
								for (const field of article.otherFields) {
									if (field.articleField.datatype === ArticleFieldType.Percentage) {
										field.amount = roundNumber(
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
									articleTax.taxAmount = roundNumber(
										(taxedAmount * articleTax.percentage) / 100,
										decimal,
									)
									article.costPrice += articleTax.taxAmount
								}
							}
							article.costPrice += taxedAmount

							if (!(taxedAmount === 0 && article.salePrice !== 0)) {
								article.markupPrice = roundNumber(
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
							article.markupPercentage = roundNumber(article.markupPercentage, decimal)
							article.markupPrice = roundNumber(
								(article.costPrice * article.markupPercentage) / 100,
							)
							article.salePrice = article.costPrice + article.markupPrice
							break
						case 'salePrice':
							article.salePrice += roundNumber((percentage * article.salePrice) / 100)
							article.salePrice = roundNumber(article.salePrice, decimal)
							if (article.basePrice === 0) {
								article.costPrice === 0
								article.markupPercentage = 100
								article.markupPrice = article.salePrice
							} else {
								article.markupPrice = article.salePrice - article.costPrice
								article.markupPercentage = roundNumber((article.markupPrice / article.costPrice) * 100, decimal)
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
							article.basePrice = roundNumber(
								(article.basePrice * percentage) / 100 + article.basePrice,
								decimal,
							)
							let taxedAmount = article.basePrice

							if (article.otherFields && article.otherFields.length > 0) {
								for (const field of article.otherFields) {
									if (field.articleField.datatype === ArticleFieldType.Percentage) {
										field.amount = roundNumber(
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
									articleTax.taxAmount = roundNumber(
										(taxedAmount * articleTax.percentage) / 100,
										decimal,
									)
									article.costPrice += articleTax.taxAmount
								}
							}
							article.costPrice += taxedAmount

							if (!(taxedAmount === 0 && article.salePrice !== 0)) {
								article.markupPrice = roundNumber(
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
							article.markupPercentage = roundNumber(article.markupPercentage, decimal)
							article.markupPrice = roundNumber(
								(article.costPrice * article.markupPercentage) / 100,
							)
							article.salePrice = article.costPrice + article.markupPrice
							break
						case 'salePrice':
							article.salePrice += roundNumber((percentage * article.salePrice) / 100)
							article.salePrice = roundNumber(article.salePrice, decimal)
							if (article.basePrice === 0) {
								article.costPrice === 0
								article.markupPercentage = 100
								article.markupPrice = article.salePrice
							} else {
								article.markupPrice = article.salePrice - article.costPrice
								article.markupPercentage = roundNumber(
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

	async importFromExcel(data: any[], token: string) {
		return new Promise<{}>(async (resolve, reject) => {
			this.authToken = token
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
			await this.createCategoryExel(data)
			await this.createVariantTypesExel(data)
			await this.createVariantValuesExel(data)

			const makesObj = await this.getMake()
			const categoryObj = await this.getCategory()
			const printerObj = await this.getPrinters()
			const unitOfMeasurementObj = await this.getUnitOfMeasurement()
			const variantType = await this.getVariantType()
			const variantValue = await this.getVariantValue()

			const groupedByCode = data.reduce((acc, item) => {
				if (!acc[item.column2.trim()]) {
					acc[item.column2.trim()] = [];
				}
				acc[item.column2.trim()].push(item);
				return acc;
			}, {});
			for (const code in groupedByCode) {
				const items = groupedByCode[code];

				// Crear el artículo padre tomando los valores del primer item del grupo
				let newArticle: Article = ArticleSchema.getInstance(this.database);
				const values = []
				const values1 = [];
				const values2 = [];
				const values3 = [];
				for (const item of items) {
					let codeArt = item.column2.trim();
					const article = articlesObj[codeArt]
					let arg = {
						basePrice: 0,
						margen: 0,
						salePrice: 0,
						imp: '21',
					}

					let basePriceEXEL = parseInt(item.column12.trim())
					let impEXEL = item.column11.trim();
					let margenEXEL = parseInt(item.column14.trim())
					let salePriceEXEL = parseInt(item.column15.trim())

					if (impEXEL) arg.imp = impEXEL

					//	if(basePriceEXEL == 0) arg.basePrice = article?.basePrice ?? 0;

					if (basePriceEXEL && margenEXEL && !salePriceEXEL) {
						arg.basePrice = basePriceEXEL
						arg.margen = margenEXEL
						arg.imp = article?.taxes[0]?.percentage ?? arg.imp

						// aca calculamos precio de venta
					}

					if (!basePriceEXEL && !margenEXEL && salePriceEXEL) {
						arg.salePrice = salePriceEXEL;
						arg.basePrice = article?.basePrice ?? 0
						arg.imp = article?.taxes[0]?.percentage ?? arg.imp

						// aca calcula margen
					}

					if (basePriceEXEL && !margenEXEL && !salePriceEXEL) {
						arg.basePrice = basePriceEXEL
						arg.margen = article?.markupPercentage ?? 0
						arg.imp = article?.taxes[0]?.percentage ?? arg.imp

						// aca calcular precio de venta
					}

					if (basePriceEXEL && !margenEXEL && salePriceEXEL) {
						arg.basePrice = basePriceEXEL
						arg.salePrice = salePriceEXEL
						arg.imp = article?.taxes[0]?.percentage ?? arg.imp

						// aca calculamos margen
					}

					if (!basePriceEXEL && margenEXEL && !salePriceEXEL) {
						arg.basePrice = article?.basePrice ?? 0
						arg.margen = margenEXEL
						arg.imp = article?.taxes[0]?.percentage ?? arg.imp

						// calculamos precio de venta
					}
					const calculatedSalePrice = await this.calculateSalePrice(arg.basePrice, arg.margen, arg.salePrice, arg.imp);

					values.push({
						type: variantType[item.column29.trim()],
						value: variantValue[item.column30.trim()],
						basePrice: calculatedSalePrice.basePrice,
						taxes: calculatedSalePrice.tax,
						costPrice: calculatedSalePrice.costPrice,
						markupPercentage: calculatedSalePrice.markupPercentage,
						markupPrice: calculatedSalePrice.markupPrice,
						salePrice: calculatedSalePrice.salePrice,
						weight: item.column16.trim(),
						width: item.column17.trim(),
						height: item.column18.trim(),
						depth: item.column19.trim(),
					});
					if (item.column29.trim() !== '' && item.column30.trim() !== '' && item.column31 === '' && item.column32 === '') {
						values1.push({
							type: variantType[item.column29.trim()],
							value: variantValue[item.column30.trim()],
							basePrice: calculatedSalePrice.basePrice,
							taxes: calculatedSalePrice.tax,
							costPrice: calculatedSalePrice.costPrice,
							markupPercentage: calculatedSalePrice.markupPercentage,
							markupPrice: calculatedSalePrice.markupPrice,
							salePrice: calculatedSalePrice.salePrice,
							weight: item.column16.trim(),
							width: item.column17.trim(),
							height: item.column18.trim(),
							depth: item.column19.trim(),
						});
					}
					if (item.column29.trim() !== '' && item.column30.trim() !== '' && item.column31 !== '' && item.column32 !== '' && item.column33 === '' && item.column34 === '') {

						values.push(
							{ type: variantType[item.column29], value: variantValue[item.column30] },
							{ type: variantType[item.column31], value: variantValue[item.column32] },
						);
						values2.push({
							type1: variantType[item.column29.trim()],
							value1: variantValue[item.column30.trim()],
							type2: variantType[item.column31],
							value2: variantValue[item.column32],
							basePrice: calculatedSalePrice.basePrice,
							taxes: calculatedSalePrice.tax,
							costPrice: calculatedSalePrice.costPrice,
							markupPercentage: calculatedSalePrice.markupPercentage,
							markupPrice: calculatedSalePrice.markupPrice,
							salePrice: calculatedSalePrice.salePrice,
							weight: item.column16,
							width: item.column17,
							height: item.column18,
							depth: item.column19,
						});
					}
					if (item.column29.trim() !== '' && item.column30.trim() !== '' && item.column31 !== '' && item.column32 !== '' && item.column33 !== '' && item.column34 !== '') {

						values.push(
							{ type: variantType[item.column29], value: variantValue[item.column30] },
							{ type: variantType[item.column31], value: variantValue[item.column32] },
							{ type: variantType[item.column33], value: variantValue[item.column34] }
						);
						values3.push({
							type1: variantType[item.column29.trim()],
							value1: variantValue[item.column30.trim()],
							type2: variantType[item.column31],
							value2: variantValue[item.column32],
							type3: variantType[item.column33],
							value3: variantValue[item.column34],
							basePrice: calculatedSalePrice.basePrice,
							taxes: calculatedSalePrice.tax,
							costPrice: calculatedSalePrice.costPrice,
							markupPercentage: calculatedSalePrice.markupPercentage,
							markupPrice: calculatedSalePrice.markupPrice,
							salePrice: calculatedSalePrice.salePrice,
							weight: item.column16,
							width: item.column17,
							height: item.column18,
							depth: item.column19,
						});
						//.log(values3)
					}
				}
				// Asignar propiedades al artículo padre usando el primer elemento del grupo
				const firstItem: any = items[0];
				let codeArt: any = firstItem.column2.trim();
				const article = articlesObj[codeArt]
				let arg = {
					basePrice: 0,
					margen: 0,
					salePrice: 0,
					imp: '21',
				}

				let basePriceEXEL = parseInt(firstItem.column12.trim())
				let impEXEL = firstItem.column11.trim();
				let margenEXEL = parseInt(firstItem.column14.trim())
				let salePriceEXEL = parseInt(firstItem.column15.trim())

				if (impEXEL) arg.imp = impEXEL

				//	if(basePriceEXEL == 0) arg.basePrice = article?.basePrice ?? 0;

				if (basePriceEXEL && margenEXEL && !salePriceEXEL) {
					arg.basePrice = basePriceEXEL
					arg.margen = margenEXEL
					arg.imp = article?.taxes[0]?.percentage ?? arg.imp

					// aca calculamos precio de venta
				}

				if (!basePriceEXEL && !margenEXEL && salePriceEXEL) {
					arg.salePrice = salePriceEXEL;
					arg.basePrice = article?.basePrice ?? 0
					arg.imp = article?.taxes[0]?.percentage ?? arg.imp

					// aca calcula margen
				}

				if (basePriceEXEL && !margenEXEL && !salePriceEXEL) {
					arg.basePrice = basePriceEXEL
					arg.margen = article?.markupPercentage ?? 0
					arg.imp = article?.taxes[0]?.percentage ?? arg.imp

					// aca calcular precio de venta
				}

				if (basePriceEXEL && !margenEXEL && salePriceEXEL) {
					arg.basePrice = basePriceEXEL
					arg.salePrice = salePriceEXEL
					arg.imp = article?.taxes[0]?.percentage ?? arg.imp

					// aca calculamos margen
				}

				if (!basePriceEXEL && margenEXEL && !salePriceEXEL) {
					arg.basePrice = article?.basePrice ?? 0
					arg.margen = margenEXEL
					arg.imp = article?.taxes[0]?.percentage ?? arg.imp

					// calculamos precio de venta
				}
				const calculatedSalePrice = await this.calculateSalePrice(arg.basePrice, arg.margen, arg.salePrice, arg.imp);

				if (!article) {
					if (values1.length > 0) {
						newArticle = Object.assign(newArticle, {
							order: firstItem.column1.trim(),
							code: firstItem.column2.trim(),
							barcode: firstItem.column3.trim(),
							make: makesObj[firstItem.column4.trim()]?._id,
							category: categoryObj[firstItem.column6.trim() === '' ? firstItem.column5.trim() : firstItem.column6.trim()]?._id,
							description: firstItem.column7.trim(),
							posDescription: firstItem.column8 !== '' ? firstItem.column8.substring(0, 20).trim() : firstItem.column7.substring(0, 20).trim(),
							unitOfMeasurement: unitOfMeasurementObj[firstItem.column9.trim()]?._id,
							printIn: printerObj[firstItem.column10.trim()]?.name,
							basePrice: calculatedSalePrice.basePrice,
							taxes: calculatedSalePrice.tax,
							costPrice: calculatedSalePrice.costPrice,
							markupPercentage: calculatedSalePrice.markupPercentage,
							markupPrice: calculatedSalePrice.markupPrice,
							salePrice: calculatedSalePrice.salePrice,
							observation: firstItem.column11.trim(),
							weight: firstItem.column16.trim(),
							width: firstItem.column17.trim(),
							height: firstItem.column18.trim(),
							depth: firstItem.column19.trim(),
							allowPurchase: firstItem.column20 === 'Si',
							allowSale: firstItem.column21 === 'Si',
							allowStock: firstItem.column22 === 'Si',
							allowSaleWithoutStock: firstItem.column23 === 'Si',
							isWeigth: firstItem.column24 === 'Si',
							allowMeasure: firstItem.column25 === 'Si',
							posKitchen: firstItem.column26 === 'Si',
							m3: firstItem.column27.trim(),
							variants: values1,
							containsVariants: true,
							updateVariants: true,
							codeProvider: firstItem.column28.trim()
						});

						const result = await new ArticleController(this.database).save(newArticle);

						await new VariantUC(this.database).createVariant(result.result._id, values1);
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
						data = data.filter(item => !(item.column29.trim() !== '' && item.column30.trim() !== '' && item.column2.trim() === firstItem.column2))
					}
					if (values2.length > 0) {
						const uniqueData = values.filter((item, index, self) =>
							index === self.findIndex((t) => (
								t.type._id === item.type._id && t.value._id === item.value._id
							))
						);

						newArticle = Object.assign(newArticle, {
							order: firstItem.column1.trim(),
							code: firstItem.column2.trim(),
							barcode: firstItem.column3.trim(),
							make: makesObj[firstItem.column4.trim()]?._id,
							category: categoryObj[firstItem.column6.trim() === '' ? firstItem.column5.trim() : firstItem.column6.trim()]?._id,
							description: firstItem.column7.trim(),
							posDescription: firstItem.column8 !== '' ? firstItem.column8.substring(0, 20).trim() : firstItem.column7.substring(0, 20).trim(),
							unitOfMeasurement: unitOfMeasurementObj[firstItem.column9.trim()]?._id,
							printIn: printerObj[firstItem.column10.trim()]?.name,
							basePrice: calculatedSalePrice.basePrice,
							taxes: calculatedSalePrice.tax,
							costPrice: calculatedSalePrice.costPrice,
							markupPercentage: calculatedSalePrice.markupPercentage,
							markupPrice: calculatedSalePrice.markupPrice,
							salePrice: calculatedSalePrice.salePrice,
							observation: firstItem.column11.trim(),
							weight: firstItem.column16.trim(),
							width: firstItem.column17.trim(),
							height: firstItem.column18.trim(),
							depth: firstItem.column19.trim(),
							allowPurchase: firstItem.column20 === 'Si',
							allowSale: firstItem.column21 === 'Si',
							allowStock: firstItem.column22 === 'Si',
							allowSaleWithoutStock: firstItem.column23 === 'Si',
							isWeigth: firstItem.column24 === 'Si',
							allowMeasure: firstItem.column25 === 'Si',
							posKitchen: firstItem.column26 === 'Si',
							m3: firstItem.column27.trim(),
							variants: uniqueData,
							containsVariants: true,
							updateVariants: true,
							codeProvider: firstItem.column28.trim()
						});

						const result = await new ArticleController(this.database).save(newArticle);

						await new VariantUC(this.database).createVariantExel(result.result._id, values2);
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
						data = data.filter(item => !(item.column29.trim() !== '' && item.column30.trim() !== '' && item.column2.trim() === firstItem.column2))
					}
					if (values3.length > 0) {
						const uniqueData = values.filter((item, index, self) =>
							index === self.findIndex((t) => (
								t.type._id === item.type._id && t.value._id === item.value._id
							))
						);

						newArticle = Object.assign(newArticle, {
							order: firstItem.column1.trim(),
							code: firstItem.column2.trim(),
							barcode: firstItem.column3.trim(),
							make: makesObj[firstItem.column4.trim()]?._id,
							category: categoryObj[firstItem.column6.trim() === '' ? firstItem.column5.trim() : firstItem.column6.trim()]?._id,
							description: firstItem.column7.trim(),
							posDescription: firstItem.column8 !== '' ? firstItem.column8.substring(0, 20).trim() : firstItem.column7.substring(0, 20).trim(),
							unitOfMeasurement: unitOfMeasurementObj[firstItem.column9.trim()]?._id,
							printIn: printerObj[firstItem.column10.trim()]?.name,
							basePrice: calculatedSalePrice.basePrice,
							taxes: calculatedSalePrice.tax,
							costPrice: calculatedSalePrice.costPrice,
							markupPercentage: calculatedSalePrice.markupPercentage,
							markupPrice: calculatedSalePrice.markupPrice,
							salePrice: calculatedSalePrice.salePrice,
							observation: firstItem.column11.trim(),
							weight: firstItem.column16.trim(),
							width: firstItem.column17.trim(),
							height: firstItem.column18.trim(),
							depth: firstItem.column19.trim(),
							allowPurchase: firstItem.column20 === 'Si',
							allowSale: firstItem.column21 === 'Si',
							allowStock: firstItem.column22 === 'Si',
							allowSaleWithoutStock: firstItem.column23 === 'Si',
							isWeigth: firstItem.column24 === 'Si',
							allowMeasure: firstItem.column25 === 'Si',
							posKitchen: firstItem.column26 === 'Si',
							m3: firstItem.column27.trim(),
							variants: uniqueData,
							containsVariants: true,
							updateVariants: true,
							codeProvider: firstItem.column28.trim()
						});

						const result = await new ArticleController(this.database).save(newArticle);

						await new VariantUC(this.database).createVariantExel(result.result._id, values3);
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
						data = data.filter(item => !(item.column29.trim() !== '' && item.column30.trim() !== '' && item.column2.trim() === firstItem.column2))
					}
				}
			}

			for (const item of data) {
				if (item.column2.trim() === '') {
					return reject(new Responser(500, null, "En el archivo Excel, hay códigos de productos que están incompletos."))
				}

				let code = item.column2.trim();
				const article = articlesObj[code]
				let arg = {
					basePrice: 0,
					margen: 0,
					salePrice: 0,
					imp: '21',
				}

				let basePriceEXEL = parseInt(item.column12.trim())
				let impEXEL = item.column11.trim();
				let margenEXEL = parseInt(item.column14.trim())
				let salePriceEXEL = parseInt(item.column15.trim())

				if (impEXEL) arg.imp = impEXEL

				//	if(basePriceEXEL == 0) arg.basePrice = article?.basePrice ?? 0;

				if (basePriceEXEL && margenEXEL && !salePriceEXEL) {
					arg.basePrice = basePriceEXEL
					arg.margen = margenEXEL
					arg.imp = article?.taxes[0]?.percentage ?? arg.imp

					// aca calculamos precio de venta
				}

				if (!basePriceEXEL && !margenEXEL && salePriceEXEL) {
					arg.salePrice = salePriceEXEL;
					arg.basePrice = article?.basePrice ?? 0
					arg.imp = article?.taxes[0]?.percentage ?? arg.imp

					// aca calcula margen
				}

				if (basePriceEXEL && !margenEXEL && !salePriceEXEL) {
					arg.basePrice = basePriceEXEL
					arg.margen = article?.markupPercentage ?? 0
					arg.imp = article?.taxes[0]?.percentage ?? arg.imp

					// aca calcular precio de venta
				}

				if (basePriceEXEL && !margenEXEL && salePriceEXEL) {
					arg.basePrice = basePriceEXEL
					arg.salePrice = salePriceEXEL
					arg.imp = article?.taxes[0]?.percentage ?? arg.imp

					// aca calculamos margen
				}

				if (!basePriceEXEL && margenEXEL && !salePriceEXEL) {
					arg.basePrice = article?.basePrice ?? 0
					arg.margen = margenEXEL
					arg.imp = article?.taxes[0]?.percentage ?? arg.imp

					// calculamos precio de venta
				}
				const calculatedSalePrice = await this.calculateSalePrice(arg.basePrice, arg.margen, arg.salePrice, arg.imp);

				console.log(arg)

				if (article) {
					//basePrice: string, markupPercentage: string, salePrice: string, percentageExel: string = '21'

					// const calculatedSalePrice = await this.calculateSalePrice(item.column12.trim() == '' ? parseInt(article.basePrice) : item.column12.trim(), item.column14.trim() === '' ? parseInt(article.markupPercentage) : item.column14.trim(), item.column15.trim() === '' ? parseInt(article.salePrice) : item.column15.trim(), item.column13.trim() === '' ? (article.taxes.length > 0 ? parseInt(article.taxes[0].percentage) : '21') : item.column13.trim());

					const result = await new ArticleController(this.database).update(
						article._id,
						{
							order: item.column1.trim() === "" ? article.order : item.column1.trim(),
							code: item.column2.trim(),
							barcode: item.column3.trim() === "" ? article.barcode : item.column3.trim(),
							make: makesObj[item.column4.trim()] === undefined ? article.make : makesObj[item.column4.trim()]._id,
							category: categoryObj[item.column6.trim() === '' ? item.column5.trim() : item.column6.trim()] === undefined ? article.category : categoryObj[item.column6.trim() === '' ? item.column5.trim() : item.column6.trim()]?._id,
							description: item.column7.trim() === "" ? article.description : item.column7.trim(),
							posDescription: item.column8.trim() === "" ? article.posDescription : item.column8.substring(0, 20),
							unitOfMeasurement: unitOfMeasurementObj[item.column9.trim()] === "" ? article.unitOfMeasurement : unitOfMeasurementObj[item.column9.trim()]?._id,
							printIn: printerObj[item.column10] === "" ? article.unitOfMeasurement : printerObj[item.column10]?.name,
							observation: item.column11 === "" ? article.observation : item.column11,
							basePrice: calculatedSalePrice.basePrice,
							taxes: calculatedSalePrice.tax,
							costPrice: calculatedSalePrice.costPrice,
							markupPercentage: calculatedSalePrice.markupPercentage,
							markupPrice: calculatedSalePrice.markupPrice,
							salePrice: calculatedSalePrice.salePrice,
							weight: item.column16 === "" ? article.weight : item.column16,
							width: item.column17 === "" ? article.width : item.column17,
							height: item.column18 === "" ? article.height : item.column18,
							depth: item.column19 === "" ? article.depth : item.column19,
							allowPurchase: item.column20 === 'Si',
							allowSale: item.column21 === 'Si',
							allowStock: item.column22 === 'Si',
							allowSaleWithoutStock: item.column23 === 'Si',
							isWeigth: item.column24 === 'Si',
							allowMeasure: item.column25 === 'Si',
							posKitchen: item.column26 === 'Si',
							m3: item.column27 === "" ? item.m3 : item.column27,
							codeProvider: item.column28 === "" ? item.codeProvider : item.column28
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
					//	const calculatedSalePrice = await this.calculateSalePrice(item.column12.trim() == '' ? parseInt(article.basePrice) : item.column12.trim(), item.column14.trim() === '' ? parseInt(article.markupPercentage) : item.column14.trim(), item.column15.trim() === '' ? parseInt(article.salePrice) : item.column15.trim(), item.column13.trim() === '' ? (article.taxes.length > 0 ? parseInt(article.taxes[0].percentage) : '21') : item.column13.trim());

					let newArticle: Article = ArticleSchema.getInstance(this.database)
					newArticle = Object.assign(newArticle, {
						order: item.column1.trim(),
						code: item.column2.trim(),
						barcode: item.column3.trim(),
						make: makesObj[item.column4.trim()]?._id,
						category: categoryObj[item.column6.trim() === '' ? item.column5.trim() : item.column6.trim()]?._id,
						description: item.column7.trim(),
						posDescription: item.column8 !== '' ? item.column8.substring(0, 20).trim() : item.column7.substring(0, 20).trim(),
						unitOfMeasurement: unitOfMeasurementObj[item.column9]?._id,
						printIn: printerObj[item.column10.trim()]?.name,
						observation: item.column11.trim(),
						basePrice: calculatedSalePrice.basePrice,
						taxes: calculatedSalePrice.tax,
						costPrice: calculatedSalePrice.costPrice,
						markupPercentage: calculatedSalePrice.markupPercentage,
						markupPrice: calculatedSalePrice.markupPrice,
						salePrice: calculatedSalePrice.salePrice,
						weight: item.column16.trim(),
						width: item.column17.trim(),
						height: item.column18.trim(),
						depth: item.column19.trim(),
						allowPurchase: item.column20 === 'Si',
						allowSale: item.column21 === 'Si',
						allowStock: item.column22 === 'Si',
						allowSaleWithoutStock: item.column23 === 'Si',
						isWeigth: item.column24 === 'Si',
						allowMeasure: item.column25 === 'Si',
						posKitchen: item.column26 === 'Si',
						m3: item.column27.trim(),
						codeProvider: item.column28.trim()
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
		const ArticlesVarintObj: any = {};

		try {
			await this.createAllCategoryTn()
			await this.createVariantTypes(data)
			await this.createVariantValues(data)
			//await this.createMake(data)

			const articles = await new ArticleController(this.database).getAll({
				project: {
					tiendaNubeId: 1,
					description: 1,
					code: 1,
					operationType: 1,
					type: 1
				},
				match: {
					tiendaNubeId: { $exists: true, $ne: null },
					operationType: { $ne: 'D' },
					type: 'Final'
				}
			});

			articles.result.forEach((item: any) => {
				if (item.tiendaNubeId) {
					ArticlesObj[item.tiendaNubeId] = item;
				}
			});

			const articleVariant = await new ArticleController(this.database).getAll({
				project: {
					tiendaNubeId: 1,
					description: 1,
					code: 1,
					operationType: 1,
					type: 1
				},
				match: {
					tiendaNubeId: { $exists: true, $ne: null },
					operationType: { $ne: 'D' },
					type: 'Variante'
				}
			})

			articleVariant.result.forEach((item: any) => {
				if (item.tiendaNubeId) {
					ArticlesVarintObj[item.tiendaNubeId] = item;
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

					await new ArticleController(this.database).update(
						article._id,
						{
							code: article.code,
							barcode: item.variants[0].sku,
							//make: makeObj[´']._id,
							category: categoryObj[item.categories[0]?.name.es] !== undefined ? categoryObj[item.categories[0].name.es]._id : null,
							description: item.name.es,
							url: item.canonical_url,
							posDescription: item.name.es.substring(0, 20),
							observation: item.description.es,
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
							tags: item.tags ? item.tags.split(',').map((tag: any) => tag.trim()) : null,
							containsVariants: item.attributes.length > 0
						}
					)

					if (item.attributes.length) {
						const variants = await this.getVariant(article._id);

						item.variants.forEach(async (art: any, index: any) => {
							if (ArticlesVarintObj[art.id]) {
								const variantProducto = variants[index];

								if (art.values[0].es !== variantProducto?.value?.description) {
									const variantValues = await this.getVariantValues(variantProducto.type)
									for (let values of variantValues) {

										if (art.values[0].es === values.description) {
											await new VariantController(this.database).update(
												variantProducto._id,
												{
													type: variantProducto.type,
													value: values._id,
													articleParent: variantProducto.articleParent,
													articleChild: variantProducto.articleChild._id
												}
											)

											const articleStock = await this.getArticleStock(variantProducto.articleChild._id)
											if (articleStock) {
												await new ArticleStockController(this.database).update(
													articleStock._id,
													{
														realStock: art.stock,
														article: articleStock.article._id
													}
												)
											}
										}
									}

									await new ArticleController(this.database).update(
										variantProducto.articleChild._id,
										{
											code: article.code,
											barcode: art.sku,
											// make: makeObj['']._id,
											category: categoryObj[item.categories[0]?.name.es] !== undefined ? categoryObj[item.categories[0].name.es]._id : null,
											description: art.values.map((items: any) => items.es.toLowerCase()).join(' / '),
											url: art.canonical_url,
											posDescription: item.name.es.substring(0, 20),
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
											tiendaNubeId: art.id,
											applications: aplicationsObj['TiendaNube']._id,
											type: 'Variante'
										}
									)
								}


								await new ArticleController(this.database).update(
									variantProducto.articleChild._id,
									{
										code: article.code,
										barcode: art.sku,
										// make: makeObj['']._id,
										category: categoryObj[item.categories[0]?.name.es] !== undefined ? categoryObj[item.categories[0].name.es]._id : null,
										description: art.values.map((items: any) => items.es.toLowerCase()).join(' / '),
										url: art.canonical_url,
										posDescription: item.name.es.substring(0, 20),
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
										tiendaNubeId: art.id,
										applications: aplicationsObj['TiendaNube']._id,
										type: 'Variante'
									}
								)
							} else {
								let newArticle: Article = ArticleSchema.getInstance(this.database)
								newArticle = Object.assign(newArticle, {
									code: article.code,
									barcode: art.sku,
									//make: makeObj[´']._id,
									category: categoryObj[item.categories[0]?.name.es] !== undefined ? categoryObj[item.categories[0].name.es]._id : null,
									description: art.values.map((items: any) => items.es.toLowerCase()).join(' / '),
									url: art.canonical_url,
									posDescription: item.name.es.substring(0, 20),
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
									tiendaNubeId: art.id,
									applications: aplicationsObj['TiendaNube']._id,
									type: 'Variante'
								})
								let resultChild = await new ArticleController(this.database).save(newArticle);
								art.values.forEach(async (artic: any, index: number) => {
									let newVariant: Variant = VariantSchema.getInstance(this.database);
									newVariant = Object.assign(newVariant, {
										type: variantType[item.attributes[index].es],
										value: variantValue[artic.es],
										articleParent: article._id,
										articleChild: resultChild.result._id,
									});
									const resultVariant = await new VariantController(this.database).save(newVariant);
								})

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
							}
						})
					}
				} else {
					let newArticle: Article = ArticleSchema.getInstance(this.database)

					newArticle = Object.assign(newArticle, {
						code: code,
						barcode: item.variants[0].sku,
						//make: makeObj[´']._id,
						category: categoryObj[item.categories[0]?.name.es] !== undefined ? categoryObj[item.categories[0].name.es]._id : null,
						description: item.name.es,
						url: item.canonical_url,
						posDescription: item.name.es.substring(0, 20),
						observation: item.description.es,
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
						tags: item.tags ? item.tags.split(',').map((tag: any) => tag.trim()) : null,
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

	async getArticleStock(articleId: any) {
		try {
			let stock = await new ArticleStockController(this.database).getAll({
				project: {
					_id: 1,
					'article._id': 1,
					'article.description': 1,
					realStock: 1,
					operationType: 1
				},
				match: {
					'article._id': { $oid: articleId },
					operationType: { $ne: 'D' },
				}
			})

			return stock.result[0]

		} catch (error) {
			throw error;
		}
	}

	async createAllCategoryTn() {
		const categoriesTnObj: any = {};
		const app = await new ApplicationController(this.database).getAll({
			project: {
				_id: 1,
				tiendaNube: {
					article: 1,
					company: 1,
					transactionType: 1,
					paymentMethod: 1,
					shipmentMethod: 1
				}
			}
		})

		const credentialesTn = app.result[0].tiendaNube

		const categoriesTn = await new CategoryController(this.database).getAll({
			project: {
				_id: 1,
				tiendaNubeId: 1,
				description: 1,
				parent: 1
			},
			match: {
				tiendaNubeId: { $exists: true, $ne: null }
			}
		});

		categoriesTn.result.forEach((item: any) => {
			if (item.tiendaNubeId) {
				categoriesTnObj[item.tiendaNubeId] = item;
			}
		});

		const URL = `https://api.tiendanube.com/v1/${credentialesTn.userID}/categories`;
		const requestOptions = {
			headers: {
				Authentication: `bearer ${credentialesTn.token}`
			}
		};
		const resp = await Axios.get(URL, requestOptions);

		const savePromises = [];

		for (let category of resp.data) {
			if (!categoriesTnObj[category.id]) {
				let newCategory: Category = CategorySchema.getInstance(this.database);
				newCategory = Object.assign(newCategory, {
					description: category?.name?.es,
					tiendaNubeId: category.id
				});
				savePromises.push(new CategoryController(this.database).save(newCategory));
			}
		}

		const saveResults = await Promise.all(savePromises);
		saveResults.forEach((result: any) => {
			categoriesTnObj[result.result.tiendaNubeId] = result.result;
		});

		const updatePromises = [];

		for (let category of resp.data) {
			if (category.parent) {
				const categoryParent = categoriesTnObj[category.parent];
				const categoryDes = categoriesTnObj[category.id];
				updatePromises.push(
					await new CategoryController(this.database).update(categoryDes._id, {
						parent: categoryParent._id,
					})
				);
			}
		}
		await Promise.all(updatePromises);
	}

	async createCategoryExel(data: any) {
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
			const descriptionParent = item.column5.trim();
			const description = item.column6.trim();

			// Manejo de descriptionParent
			if (descriptionParent && !categoriesObj[descriptionParent]) {
				let newCategoryParent: Category = CategorySchema.getInstance(this.database);
				newCategoryParent = Object.assign(newCategoryParent, {
					description: descriptionParent,
				});
				await new CategoryController(this.database).save(newCategoryParent);
				categoriesObj[descriptionParent] = newCategoryParent;
			}

			// Manejo de description
			if (description && !categoriesObj[description]) {
				let newCategory: Category = CategorySchema.getInstance(this.database);
				newCategory = Object.assign(newCategory, {
					description: description,
				});
				await new CategoryController(this.database).save(newCategory);
				categoriesObj[description] = newCategory;
			}
		}
		for (const item of data) {
			const descriptionParent = item.column5.trim();
			const description = item.column6.trim();

			if (description && descriptionParent && categoriesObj[description]) {
				// Actualizar la categoría existente con la referencia al parent
				const updatedCategory = Object.assign(categoriesObj[description], {
					parent: categoriesObj[descriptionParent]._id, // Asumiendo que `parentId` es el campo para la relación
				});
				await new CategoryController(this.database).update(updatedCategory._id, updatedCategory);
				categoriesObj[description] = updatedCategory;
			}
		}
		return 200
	}

	async createVariantTypes(data: any) {
		const variantTypesObj: any = {};
		const variantTypes = await new VariantTypeController(this.database).getAll({
			project: {
				name: 1,
				operationType: 1
			},
			match: {
				name: { $exists: true, $ne: null },
				operationType: { $ne: 'D' },
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

	async createVariantTypesExel(data: any) {
		const variantTypeObj: any = {};

		// Obtener todos los tipos de variantes existentes
		const variantType = await new VariantTypeController(this.database).getAll({
			project: {
				name: 1,
				operationType: 1,
			},
			match: {
				name: { $exists: true, $ne: null },
				operationType: { $ne: 'D' },
			}
		});

		// Mapear los tipos de variantes existentes a un objeto
		variantType.result.forEach((item: any) => {
			if (item.name) {
				variantTypeObj[item.name] = item;
			}
		});

		for (const item of data) {
			const columns = [item.column29?.trim(), item.column31?.trim(), item.column33?.trim()];

			for (const name of columns) {
				if (name && !variantTypeObj[name]) {
					let variantType: VariantType = VariantTypeSchema.getInstance(this.database);
					variantType = Object.assign(variantType, { name: name });
					await new VariantTypeController(this.database).save(variantType);
					variantTypeObj[name] = variantType;
				}
			}
		}

		return 200;
	}

	async createVariantValuesExel(data: any) {
		const variantValueObj: any = {};
		const variantValue = await new VariantValueController(this.database).getAll({
			project: {
				description: 1
			},
			match: {
				description: { $exists: true, $ne: null }
			}
		});

		variantValue.result.forEach((item: any) => {
			if (item.description) {
				variantValueObj[item.description] = item;
			}
		});

		const variantType = await this.getVariantType();

		for (const item of data) {
			const columns = [
				{ name: item.column30?.trim(), type: item.column29?.trim() },
				{ name: item.column32?.trim(), type: item.column31?.trim() },
				{ name: item.column34?.trim(), type: item.column33?.trim() }
			];

			for (const column of columns) {
				const { name, type } = column;
				if (name && !variantValueObj[name]) {
					let variantValue: VariantValue = VariantValueSchema.getInstance(this.database);
					variantValue = Object.assign(variantValue, {
						type: variantType[type],
						description: name
					});
					await new VariantValueController(this.database).save(variantValue);
					variantValueObj[name] = variantValue;
				}
			}
		}

		return 200;
	}


	async createVariantValues(data: any) {
		const varinatValuesObj: any = {};
		const VariantValues = await new VariantValueController(this.database).getAll({
			project: {
				description: 1,
				operationType: 1
			},
			match: {
				description: { $exists: true, $ne: null },
				operationType: { $ne: 'D' },
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
			let variantType = await new VariantTypeController(this.database).getAll(
				{
					project: {
						_id: 1,
						name: 1,
						operationType: 1
					},
					match: {
						operationType: { $ne: 'D' },
					}
				}
			)

			variantType.result.forEach((item: any) => {
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
			let descripcion = item.column4.trim()
			if (!makeObj[descripcion]) {
				if (descripcion) {
					let make: Make = MakeSchema.getInstance(this.database)
					make = Object.assign(make, {
						description: descripcion,
						visibleSale: false,

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

	async calculateSalePrice(basePrice: number, markupPercentage: number, salePrice: number, percentageExel: string
	) {
		//	console.log(basePrice, markupPercentage, salePrice, percentageExel)
		const percentage = percentageExel ? percentageExel : '21';
		//	console.log(percentage)
		const price = {
			basePrice: 0,
			markupPercentage: 0,
			salePrice: 0,
			markupPrice: 0,
			costPrice: 0,
			tax: [
				{
					tax: {},
					percentage: '',
					taxAmount: 0,
					taxBase: 0,
				},
			],
		};

		const taxObj = await this.getTax();
		switch (true) {
			case basePrice !== 0 && markupPercentage !== 0 && salePrice === 0:
				// Calcular el precio de venta
				price.basePrice = Number(basePrice);
				price.markupPercentage = Number(markupPercentage);
				price.tax[0].tax = taxObj[percentage];
				price.tax[0].percentage = percentage;
				price.tax[0].taxAmount = (price.basePrice * Number(percentage)) / 100;
				price.tax[0].taxBase = price.basePrice;
				price.costPrice = price.tax[0].taxAmount + price.basePrice;
				price.markupPrice = (price.costPrice * price.markupPercentage) / 100;
				price.salePrice = Number((price.costPrice + price.markupPrice).toFixed(2));
				break;

			case basePrice !== 0 && markupPercentage === 0 && salePrice !== 0:
				// Calcular el margen
				price.basePrice = Number(basePrice);
				price.salePrice = Number(salePrice);
				price.tax[0].tax = taxObj[percentage];
				price.tax[0].percentage = percentage;
				price.tax[0].taxAmount = (price.basePrice * Number(percentage)) / 100;
				price.tax[0].taxBase = price.basePrice;
				price.costPrice = price.tax[0].taxAmount + price.basePrice;
				price.markupPrice = price.salePrice - price.costPrice;
				price.markupPercentage = Number((price.markupPrice / price.costPrice) * 100);
				break;

			case basePrice !== 0 && markupPercentage === 0 && salePrice === 0:

				price.basePrice = Number(basePrice);
				price.markupPercentage = markupPercentage
				price.tax[0].tax = taxObj[percentage];
				price.tax[0].percentage = percentage;
				price.tax[0].taxAmount = (price.basePrice * Number(percentage)) / 100;
				price.tax[0].taxBase = price.basePrice;
				price.costPrice = price.tax[0].taxAmount + price.basePrice
				price.markupPrice = (price.costPrice * price.markupPercentage) / 100
				price.salePrice = price.costPrice
				break;

			case basePrice === 0 && markupPercentage === 0 && salePrice !== 0:
				price.basePrice = Number(basePrice);
				price.markupPercentage = 100
				price.tax[0].tax = taxObj[percentage];
				price.tax[0].percentage = percentage;
				price.tax[0].taxAmount = (price.basePrice * Number(percentage)) / 100;
				price.tax[0].taxBase = price.basePrice;
				price.costPrice = price.tax[0].taxAmount + price.basePrice
				price.markupPrice = (price.costPrice * price.markupPercentage) / 100
				price.salePrice = Number(salePrice);
				break

			default:
				price.basePrice = Number(basePrice);
				price.markupPercentage = markupPercentage
				price.tax[0].tax = taxObj[percentage];
				price.tax[0].percentage = percentage;
				price.tax[0].taxAmount = (price.basePrice * Number(percentage)) / 100;
				price.tax[0].taxBase = price.basePrice;
				price.costPrice = price.tax[0].taxAmount + price.basePrice
				price.markupPrice = (price.costPrice * price.markupPercentage) / 100
				price.salePrice = Number(salePrice);
		}

		return price;
	}

	async lastArticle() {
		const config = await new ConfigController(this.database).getAll({
			project: {
				_id: 1,
				'article.code.validators.maxLength': 1,
			}
		})

		const articles = await new ArticleController(this.database).getAll({
			match: {
				type: 'Final',
				operationType: { $ne: 'D' }
			}
		});
		if (articles.result) {
			articles.result.sort((a: any, b: any) => {
				const dateA = new Date(a.creationDate).getTime();
				const dateB = new Date(b.creationDate).getTime();
				return dateB - dateA;
			});

			const lastArticle = articles.result[0];
			let codeSum
			if (lastArticle) {
				codeSum = (Number(lastArticle?.code) + 1).toString().padStart(config.result[0].article.code.validators.maxLength, '0');
			} else {
				codeSum = '1'.padStart(config.result[0].article.code.validators.maxLength, '0');
			}
			return codeSum
		}
	}

	async getVariant(id: string) {
		let variant = await new VariantController(this.database).getAll({
			project: {
				articleParent: 1,
				'articleChild._id': 1,
				'value.description': 1,
				type: 1,
				operationType: 1

			},
			match: {
				operationType: { $ne: 'D' },
				$or: [
					{ articleParent: { $oid: id } },
					{ 'articleChild._id': { $oid: id } }
				]
			}
		})
		return variant.result

	}

	async getVariantValues(type: any) {
		try {
			let variantValue = await new VariantValueController(this.database).getAll({
				project: {
					_id: 1,
					type: 1,
					description: 1,
					operationType: 1
				},
				match: {
					type: { $oid: type },
					operationType: { $ne: 'D' },
				}
			})

			return variantValue.result

		} catch (error) {
			throw error;
		}

	}
}
