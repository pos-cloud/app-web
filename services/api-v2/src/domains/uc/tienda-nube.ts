import * as express from 'express'

import Responser from '../../utils/responser'
import Transaction from './../transaction/transaction.interface'
import TransactionSchema from '../transaction/transaction.model'

import RequestWithUser from '../../interfaces/requestWithUser.interface'
import TransactionTypeController from '../transaction-type/transaction-type.controller'
import Address from '../address/address.interface'
import AddresSchema from '../address/address.model'
import CompanySchema from '../company/company.model'
import Company from '../company/company.interface'
import TransactionUC from '../transaction/transaction.uc'
import ArticleController from '../article/article.controller'
import MovementOfCash from '../movement-of-cash/movement-of-cash.interface'
import MovementOfCashSchema from '../movement-of-cash/movement-of-cash.model'
import UserController from '../user/user.controller'
import axios from 'axios'
import { TransactionType } from '../transaction-type/transaction-type.interface'
import { ShipmentMethod } from '../shipment-method/shipment-method.interface'
import ShipmentMethodSchema from '../shipment-method/shipment-method.model'
import MovementOfArticleSchema from '../movement-of-article/movement-of-article.model'
import MovementOfArticle from '../movement-of-article/movement-of-article.interface'
import Article from '../article/article.interface'
import PaymentMethod from '../payment-method/payment-method.interface'
import PaymentMethodController from '../payment-method/payment-method.controller'

// https://tiendanube.github.io/api-documentation/resources/order#get-ordersid

const credentialsTiendaNube = [
    {
        tokenTiendaNube: 'caeb032b8bbd258ae2fe42ef70b7c95b44e400eb',
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
            const { storeId, order } = request.body;
            console.log(order)
            if (typeof order == "undefined") return response.send(new Responser(404, null, 'Order not found', null));

            const credential = credentialsTiendaNube.find(credentials => credentials.storeId === parseInt(storeId));
            if (!credential) return response.send(new Responser(404, null, 'credential not found', null));

            this.database = credential.database
            this.user = credential.user
            this.password = credential.password

            const token = await this.getToken()

            if (!token) return response.send(new Responser(404, null, 'token not found', null));

            this.authToken = token

            const articles = await this.getArticles(this.database, order)

            if (!articles.result.length) return response.send(new Responser(404, null, 'articles not found', null));

            const transactionType = await this.getTiendaNubeTransactionsType(this.database);

            if (!transactionType) return response.send(new Responser(404, null, 'TransactionType not found', null));

            const company = await this.getCompany(order, transactionType)

            if (!company) return response.send(new Responser(404, null, 'Company not found', null));

            const address = this.getaddress(order)

            if (!address) return response.send(new Responser(404, null, 'Address not found', null));

            const paymentMethod = await this.getPaymentMethod()

            if (!paymentMethod) return response.send(new Responser(404, null, 'paymentMethod not found', null));

            const movementsOfCash = this.getMovementsOfCash(order, paymentMethod.result[0])

            if (!movementsOfCash) return response.send(new Responser(404, null, 'movementsOfCash not found', null))

            const movementOfArticle = this.getMovementsOfArticles(articles.result, order.products)

            if (!movementOfArticle) return response.send(new Responser(404, null, 'movementOfArticle not found', null));

            const user = await this.getUser(this.database)

            if (!user) return response.send(new Responser(404, null, 'user not found', null));

            const shipmentMethod = this.shipmentMethod()

            if (!shipmentMethod) return response.send(new Responser(404, null, 'shipmentMethod not found', null));

            let transactionTiendaNube: Transaction = TransactionSchema.getInstance(this.database)
            transactionTiendaNube = Object.assign(transactionTiendaNube, {
                tiendaNubeId: order.id,
                letter: "X",
                totalPrice: order.total,
                discountAmount: order.discount,
                taxes: [
                    {
                        percentage: (order.discount / order.total) * 100,
                        taxBase: order.subtotal,
                    }
                ],
                number: order.number,
                madein: 'tiendanube',
                state: "Pendiente de pago",
                balance: order.payment_status === "paid" ? order.total : 0,
                shipmentMethod: shipmentMethod,
                type: transactionType._id,
                company: company,
                deliveryAddress: address._id,
                startDate: order.created_at,
                observation: order.note
            })

            const createTransaction = await new TransactionUC(this.database, this.authToken).createTransaction(transactionTiendaNube, movementsOfCash, movementOfArticle, user.result[0])
            console.log(createTransaction.movementsOfArticles.length)
            return response.send(new Responser(200, { createTransaction }));

        } catch (error) {
            console.log(error)
            response.send(new Responser(500, null, error));
        }
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
                    company: 1
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

    async getCompany(order: any, transactionType: TransactionType) {

        if (transactionType.requestCompany !== null && transactionType.company !== null) {
            return transactionType.company
        } else if (order.customer) {
            let company: Company = CompanySchema.getInstance(this.database)
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
                state: order.customer.default_address.province,
                country: order.customer.default_address.country,
            })
            return company._id
        }
    }

    getaddress(order: any) {
        if (order.shipping_address) {
            let addressTiendaNube: Address = AddresSchema.getInstance(this.database)
            addressTiendaNube = Object.assign(addressTiendaNube, {
                country: order.shipping_address.country,
                city: order.shipping_address.city,
                floor: order.shipping_address.floor,
                name: order.shipping_address.name,
                postalCode: order.shipping_address.zipcode,
            })
            return addressTiendaNube
        }
        return null
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
        let movementOfCash: MovementOfCash = MovementOfCashSchema.getInstance(this.database)
        movementOfCash = Object.assign(movementOfCash, {
            amountPaid: order.total,
            discountAmount: order.discount_gateway,
            quota: order.payment_details.installments,
            expirationDate: "2023-12-26 19:04:23.000000",
            date: "2023-12-26 19:04:23.000000",
            type: paymentMethod._id
        })
        return [movementOfCash]
    }

    shipmentMethod() {
        let shipmentMethod: ShipmentMethod = ShipmentMethodSchema.getInstance(this.database)
        shipmentMethod = Object.assign(shipmentMethod, {
            name: "Delivery"
        })
        return shipmentMethod._id
    }

    getMovementsOfArticles(articles: Article[], orders: any): MovementOfArticle[] {
        return articles.map((article, index) => {
            let movementOfArticle: MovementOfArticle = MovementOfArticleSchema.getInstance(this.database);
            const order = orders[index];
            movementOfArticle = Object.assign(movementOfArticle, {
                code: article.code,
                amount: order.quantity,
                description: article.description,
                basePrice: article.basePrice,
                salePrice: order.quantity * article.salePrice,
                unitPrice: article.salePrice,
                costPrice: article.costPrice,
                article: article._id,
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