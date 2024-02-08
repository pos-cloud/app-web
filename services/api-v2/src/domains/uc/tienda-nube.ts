import * as express from 'express'
import axios from 'axios'
import moment = require('moment')

import Responser from '../../utils/responser'
import Responseable from 'interfaces/responsable.interface'
import Transaction from './../transaction/transaction.interface'
import TransactionSchema from '../transaction/transaction.model'
import RequestWithUser from '../../interfaces/requestWithUser.interface'
import TransactionTypeController from '../transaction-type/transaction-type.controller'
import Address from '../address/address.interface'
import AddressSchema from '../address/address.model'
import CompanySchema from '../company/company.model'
import Company from '../company/company.interface'
import TransactionUC from '../transaction/transaction.uc'
import ArticleController from '../article/article.controller'
import MovementOfCash from '../movement-of-cash/movement-of-cash.interface'
import MovementOfCashSchema from '../movement-of-cash/movement-of-cash.model'
import UserController from '../user/user.controller'
import { TransactionType } from '../transaction-type/transaction-type.interface'
import MovementOfArticleSchema from '../movement-of-article/movement-of-article.model'
import MovementOfArticle from '../movement-of-article/movement-of-article.interface'
import Article from '../article/article.interface'
import PaymentMethod from '../payment-method/payment-method.interface'
import PaymentMethodController from '../payment-method/payment-method.controller'
import TransactionController from '../transaction/transaction.controller'
import ShipmentMethodController from '../shipment-method/shipment-method.controller'
import AddressController from '../address/address.controller'
import CompanyController from '../company/company.controller'
import VATConditionController from '../vat-condition/vat-condition.controller'
import MovementOfCashController from '../movement-of-cash/movement-of-cash.controller'

const credentialsTiendaNube = [
    {
        tokenTiendaNube: '76b8f64f0932d715f712ae1384d3a27f1025848d',
        storeId: 3937256,
        database: 'demo',
        user: 'admin',
        password: 'pos'
    },
    {
        tokenTiendaNube: '7f568c4aa62eca95fc5c4aef4200d16e5b1f85d2',
        storeId: 2469501,
        database: 'polirrubrojb',
        user: 'soporte',
        password: '431744'
    },
    {
        tokenTiendaNube: 'a3bc18debd7faff1af268f5fda3ad89f4776501f',
        storeId: 3954904,
        database: 'quierosersanto',
        user: 'soporte',
        password: '431744'
    }
]

export default class TiendaNubeController {

    public EJSON: any = require('bson').EJSON
    public path = '/tienda-nube'
    public router = express.Router()
    public database: string;
    public user: string;
    public password: string;
    public authToken: string;

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}/add-transaction`, this.createTransaction
        )
        this.router.get(`${this.path}/credentials/:storeId`, this.getCredentials)
    }

    createTransaction = async (
        request: RequestWithUser,
        response: express.Response,
        next: express.NextFunction) => {
        try {
            const { storeId, order, event } = request.body;
            if (typeof order == "undefined") return response.send(new Responser(404, null, 'Order not found', null));

            const credential = credentialsTiendaNube.find(credentials => credentials.storeId === parseInt(storeId));
            if (!credential) return response.send(new Responser(404, null, 'credential not found', null));

            this.database = credential.database
            this.user = credential.user
            this.password = credential.password

            const token = await this.getToken()

            if (!token) return response.send(new Responser(404, null, 'token not found', null));

            this.authToken = token

            const transaction = await this.getTransaction(order)
            let resp
            if (transaction.length) {
                resp = await this.updateTransaction(order, transaction[0])
            }
            if (resp) return response.send(new Responser(200, resp));

            const articles = await this.getArticles(this.database, order)

            if (!articles.result.length) return response.send(new Responser(404, null, 'articles not found', null));

            const transactionType = await this.getTiendaNubeTransactionsType(this.database);

            if (!transactionType) return response.send(new Responser(404, null, 'TransactionType not found', null));

            const company = await this.getCompany(order, transactionType)

            if (!company) return response.send(new Responser(404, null, 'Company not found', null));
            const address = await this.createAddress(order, transactionType)

            if (!address) return response.send(new Responser(404, null, 'Address not found', null));

            const paymentMethod = await this.getPaymentMethod()

            if (!paymentMethod) return response.send(new Responser(404, null, 'paymentMethod not found', null));

            const movementsOfCash = this.getMovementsOfCash(order, paymentMethod.result[0])

            if (!movementsOfCash) return response.send(new Responser(404, null, 'movementsOfCash not found', null))

            const movementOfArticle = this.getMovementsOfArticles(articles.result, order)

            if (!movementOfArticle) return response.send(new Responser(404, null, 'movementOfArticle not found', null));

            const user = await this.getUser(this.database)

            if (!user) return response.send(new Responser(404, null, 'user not found', null));

            const shipmentMethod = await this.shipmentMethod()

            if (!shipmentMethod) return response.send(new Responser(404, null, 'shipmentMethod not found', null));

            let statusOrder: any = {
                'open': 'Abierto',
                'closed': 'Cerrado',
                'cancelled': 'Anulado'
            };

            let transactionTiendaNube: Transaction = TransactionSchema.getInstance(this.database)

            transactionTiendaNube = Object.assign(transactionTiendaNube, {
                tiendaNubeId: order.id,
                letter: "X",
                totalPrice: order.total,
                discountAmount: order.discount,
                number: order.number,
                madein: 'tiendanube',
                state: statusOrder[order.status],
                endDate2: moment().format("YYYY-MM-DD HH:mm:ss.SSSSSS"),
                endDate: moment().format("MM/DD/YYYY"),
                balance: order.payment_status === "paid" ? order.total : 0,
                shipmentMethod: shipmentMethod,
                paymentMethodEcommerce: order.payment_details.method,
                type: transactionType._id,
                company: company,
                deliveryAddress: address._id,
                startDate: order.created_at,
                observation: order.note
            })

            const createTransaction = await new TransactionUC(this.database, this.authToken).createTransaction(transactionTiendaNube, movementsOfCash, movementOfArticle, user.result[0])

            return response.send(new Responser(200, { createTransaction }));

        } catch (error) {
            console.log(error)
            response.send(new Responser(500, null, error));
        }
    }

    async updateTransaction(order: any, transaction: Transaction) {

        let statusOrder: any = {
            'open': 'Abierto',
            'closed': 'Cerrado',
            'cancelled': 'Anulado'
        };
        let paymentStatus: any = {
            'authorized': 'Autorizado',
            'pending': 'Pendiente',
            'paid': 'Pagado',
            'abandoned': 'Abandonado',
            'refunded': 'Reembolso',
            'voided': 'Anulado'
        };


        const getMovementsOfCash = await new MovementOfCashController(this.database).getAll({
            project: {
                _id: 1,
                statusCheck: 1,
                quota: 1,
                status: 1,
                "transaction._id": 1
            },
            match: {
                "transaction._id": { $oid: transaction._id }
            }

        })
        let movOfCash: MovementOfCash = getMovementsOfCash.result[0]

        movOfCash.status = paymentStatus[order.payment_status]

        let updateMovOfCash = await new MovementOfCashController(this.database).update(movOfCash._id, movOfCash)

        if (updateMovOfCash.result.length) {
            return new Responser(404, null, `MovementOfCash not found`)
        }

        transaction.state = statusOrder[order.status]
        let address = await this.getAddress(transaction.deliveryAddress._id, order)
        transaction.deliveryAddress._id = address

        const updateTransaction = await new TransactionUC(this.database, this.authToken).updateTransaction(transaction._id, transaction)

        return updateTransaction
    }

    async getAddress(id: string, order: any) {
        const getAddress = await new AddressController(this.database).getAll({
            project: {
                _id: 1,
                shippingStatus: 1
            },
            match: {
                _id: { $oid: id }
            }
        })

        let shippingStatuss: any = {
            'unpacked': 'Desempaquetado',
            'fulfilled': 'Enviado',
            'shipped': 'Enviado',
            'unshipped': 'No enviado',
            'unfulfilled': 'No enviado'
        };

        let address: Address = getAddress.result[0]

        address.shippingStatus = shippingStatuss[order.shipping_status]
        let updateAddress = await new AddressController(this.database).update(address._id, address)

        return updateAddress.result._id
    }

    async getTransaction(order: any) {
        const transaction = await new TransactionController(this.database).getAll({
            project: {
                _id: 1,
                tiendaNubeId: 1,
                stateTiendaNube: 1,
                totalPrice: 1,
                origin: 1,
                state: 1,
                letter: 1,
                'deliveryAddress._id': 1,
            },
            match: {
                tiendaNubeId: String(order.id)
            }
        })
        return transaction.result
    }

    getCredentials = async (
        request: RequestWithUser,
        response: express.Response,
        next: express.NextFunction) => {

        const { storeId } = request.params;
        if (!storeId) {
            return response.send(new Responser(404, null, 'id not found', null));
        }

        const credential = credentialsTiendaNube.find(credentials => credentials.storeId === parseInt(storeId));

        return response.send(credential)
    }

    async getUser(database: string) {
        try {
            const user = await new UserController(database).getAll({
                project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    phone: 1,
                    state: 1,
                }
            });
            return user
        } catch (error) {
            console.log(error)
        }
    }

    getTiendaNubeTransactionsType = async (database: string) => {
        try {
            const transactionType = await new TransactionTypeController(database).getAll({
                project: {
                    _id: 1,
                    name: 1,
                    allowAPP: 1,
                    'application._id': 1,
                    'application.name': 1,
                    'application.type': 1,
                    requestCompany: 1,
                    transactionMovement: 1,
                    company: 1,
                },
                match: {
                    allowAPP: true,
                    'application.type': 'TiendaNube'
                },
            });
            return transactionType.result[0];
        } catch (error) {
            throw error;
        }
    }

    getArticles = async (database: string, order: any) => {
        try {
            const articles = await new ArticleController(database).getAll({
                project: {
                    tiendaNubeId: 1,
                    _id: 1,
                    description: 1,
                    salePrice: 1,
                    code: 1,
                    costPrice: 1,
                    barcode: 1,
                    basePrice: 1,
                    order: 1,
                    url: 1,
                    posDescription: 1,
                    category: 1
                },
                match: {
                    tiendaNubeId: { $in: order.products.map((product: { product_id: number }) => product.product_id) },
                }
            });
            return articles;
        } catch (error) {
            throw error;
        }
    }

    async getCompanyByIdentification(identification: string, id: string) {
        try {
            if (identification !== '') {
                const company = await new CompanyController(this.database).getAll({
                    project: {
                        _id: 1,
                        name: 1,
                        fantasyName: 1,
                        identificationValue: 1
                    },
                    match: {
                        identificationValue: identification
                    }
                });
                return company.result;
            } else {
                const company = await new CompanyController(this.database).getAll({
                    project: {
                        _id: 1,
                        name: 1,
                        fantasyName: 1,
                        identificationValue: 1,
                        vatCondition: 1
                    },
                    match: {
                        _id: { $oid: id }
                    }
                });

                return company.result[0].vatCondition
            }


        } catch (error) {
            throw error;
        }
    }

    async getCompany(order: any, transactionType: TransactionType): Promise<Company> {
        return new Promise<Company>(async (resolve, reject) => {
            try {
                if (order.customer) {
                    const company = await this.getCompanyByIdentification(order.customer.identification, '');
                    if (company.length > 0) {
                        resolve(company[0]);
                    } else {
                        const companyType = await this.getCompanyByIdentification('', transactionType.company._id);
                        let company: Company = CompanySchema.getInstance(this.database);
                        company = Object.assign(company, {
                            name: order.customer.name,
                            fantasyName: order.customer.name,
                            type: 'Cliente',
                            address: order.customer.default_address.address,
                            city: order.customer.default_address.city,
                            phones: order.customer.phone,
                            emails: order.customer.email,
                            identificationValue: order.customer.identification,
                            observation: order.customer.note,
                            addressNumber: order.customer.default_address.number,
                            zipCode: order.customer.default_address.zipCode,
                            floorNumber: order.customer.default_address.floor,
                            vatCondition: companyType
                        });

                        await new CompanyController(this.database).save(company)
                            .then((result: Responseable) => resolve(result.result))
                            .catch((error) => reject(error));
                    }
                } else if (transactionType.requestCompany !== null && transactionType.company !== null) {
                    resolve(transactionType.company);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    createAddress(order: any, transactionType: TransactionType) {
        return new Promise<Address>(async (resolve, reject) => {
            try {
                const company = await this.getCompany(order, transactionType)

                let shippingStatus: any = {
                    'unpacked': 'Desempaquetado',
                    'fulfilled': 'Enviado',
                    'unfulfilled': 'No enviado'
                };

                let address: Address = AddressSchema.getInstance(this.database)
                address = Object.assign(address, {
                    country: order.shipping_address.country,
                    city: order.shipping_address.city,
                    floor: order.shipping_address.floor,
                    name: order.shipping_address.name,
                    state: order.billing_province,
                    company: company,
                    number: order.shipping_address.number,
                    postalCode: order.shipping_address.zipcode,
                    shippingStatus: shippingStatus[order.shipping_status]
                })
                await new AddressController(this.database).save(address).then((result: Responseable) =>
                    resolve(result.result),
                )
            } catch (err) {
                reject(err)
            }
        })
    }

    async getToken() {
        let URL = 'https://api.poscloud.com.ar/api/login'

        let params = {
            database: this.database,
            user: this.user,
            password: this.password
        }
        const data = await axios.post(URL, params)
        return data.data.user.token
    }

    getMovementsOfCash(order: any, paymentMethod: PaymentMethod): MovementOfCash[] {
        let paymentStatus: any = {
            'authorized': 'Autorizado',
            'pending': 'Pendiente',
            'paid': 'Pagado',
            'abandoned': 'Abandonado',
            'refunded': 'Reembolso',
            'voided': 'Anulado'
        }
        let movementOfCash: MovementOfCash = MovementOfCashSchema.getInstance(this.database)
        movementOfCash = Object.assign(movementOfCash, {
            amountPaid: order.total,
            discountAmount: order.discount_gateway,
            quota: order.payment_details.installments,
            expirationDate: moment().format("YYYY-MM-DD HH:mm:ss.SSSSSS"),
            date: moment().format("YYYY-MM-DD HH:mm:ss.SSSSSS"),
            status: paymentStatus[order.payment_status],
            type: paymentMethod._id
        })
        return [movementOfCash]
    }

    async shipmentMethod() {
        const shipmentMethod = await new ShipmentMethodController(this.database).getAll({
            project: {
                _id: 1,
                name: 1,
                'applications.type': 1
            },
            match: {
                'applications.type': "TiendaNube"
            }
        })
        return shipmentMethod.result[0]._id
    }

    getMovementsOfArticles(articles: Article[], order: any): MovementOfArticle[] {
        return articles.map((article, index) => {
            let movementOfArticle: MovementOfArticle = MovementOfArticleSchema.getInstance(this.database);
            const products = order.products[index];
            movementOfArticle = Object.assign(movementOfArticle, {
                code: article.code,
                amount: products.quantity,
                description: article.description,
                basePrice: article.basePrice,
                salePrice: products.quantity * article.salePrice,
                unitPrice: article.salePrice,
                costPrice: article.costPrice,
                discountRate: (order.discount / order.subtotal) * 100,
                article: article._id,
                modifyStock: true,
                quantityForStock: -+products.quantity,
                stockMovement: 'Salida',
                category: article.category._id
            });
            return movementOfArticle;
        });
    }

    async getPaymentMethod() {
        let result = await new PaymentMethodController(this.database).getAll({
            project: {
                _id: 1,
                name: 1,
                acceptReturned: 1,
                isCurrentAccount: 1,
                'applications.type': 1
            },
            match: {
                'applications.type': "TiendaNube"

            },
        })
        return result
    }
}