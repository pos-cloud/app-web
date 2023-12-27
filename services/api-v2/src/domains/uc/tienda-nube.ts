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

//  https://tiendanube.github.io/api-documentation/resources/order#get-ordersid
let order: {
    "id": 1412498095,
    "token": "78bdfd5f113b4408d454779e2e65ce8abc263961",
    "store_id": "3937256",
    "contact_email": " jeremias.vallejos78@gmail.com",
    " contact_name": "Jeremias Vallejos",
    "contact_phone": "",
    "contact_identification": null,
    "shipping_min_days": null,
    "shipping_max_days": null,
    "billing_name": "Jeremias",
    "billing_phone": "",
    "billing_address": "Juan Jose Paso",
    "billing_number": "33",
    "billing_floor": "",
    "billing_locality": "",
    "billing_zipcode": "2933",
    "billing_city": "Perez Millan",
    "billing_province": "Buenos Aires",
    "billing_country": "AR",
    "shipping_cost_owner": "0.00",
    "shipping_cost_customer": "0.00",
    "coupon": [],
    "promotional_discount": {
        "id": null,
        "store_id": 3937256,
        "order_id": "1412498095",
        "created_at": " 2023-12-26T21:56:00+0000",
        "total_discount_amount": "0.00",
        "contents": [],
        "promotions_applied": []
    },
    "subtotal": "678.00",
    "discount": "0.00",
    "discount_coupon": "0.00",
    "discount_gateway": "0.00",
    "total": " 678.00",
    "total_usd": "0.84",
    "checkout_enabled": true,
    "weight": " 0.000",
    "currency": "ARS",
    "language": "es",
    "gateway": "offline",
    "gateway_id": null,
    "gateway_name": "A convenir",
    "shipping": "table_default",
    "shipping_option": "Nos comunicaremos para coordinar la entrega del producto",
    "shipping_option_code": "table_default_123123",
    "shipping_option_reference": null,
    "shipping_pickup_details": null,
    "shipping_tracking_number": null,
    "shipping_tracking_url": null,
    "shipping_store_branch_name": null,
    "shipping_store_branch_extra": null,
    "shipping_pickup_type": "ship",
    "shipping_suboption": [],
    "extra": {},
    "storefront": "store",
    "note": "kk",
    "created_at": " 2023-12-26T19:04:23+0000",
    "updated_at": " 2023-12-26T19:04:23+0000",
    "completed_at": {
        "date": "2023-12-26 19:04:23.000000",
        "timezone_type": 3,
        "timezone": "UTC"
    },
    "next_action": "waiting_manual_confirmation",
    "payment_details": { "method": "custom", "credit_card_company": null, "installments": "1" },
    "attributes": [],
    "products": [
        {
            "id": 1555630602,
            "depth": "0.00",
            "height": "0.00",
            "name": "order",
            "price": "678.00",
            "compare_at_price": "678.00",
            "product_id": 195611795,
            "image": null,
            "quantity": "1",
            "free_shipping": false,
            "weight": "0.00",
            "width": "0.00",
            "variant_id": "789844924",
            "variant_values": [],
            "properties": [],
            "sku": "787",
            "barcode": null,
            "cost": null
        }
    ],
    "fulfillments": null,
    "number": 128,
    "cancel_reason": null,
    "owner_note": null,
    "cancelled_at": null,
    "closed_at": null,
    "read_at": null,
    "status": "open",
    "payment_status": "pending",
    "gateway_link": null,
    "has_shippable_products": true,
    "shipping_carrier_name": null,
    "shipping_address": {
        "address": " Juan Jose Paso",
        "city": "Perez Millan",
        "country": "AR",
        "created_at": "2023-12-26T19:02:55+0000",
        "default": false,
        "floor": "",
        "id": 0,
        "locality": "",
        "name": "Jeremias Vallejos",
        "number": "33",
        "phone": "",
        "province": "Buenos Aires",
        "updated_at": "2023-12-26T19:04:23+0000",
        "zipcode": "2933",
        "customs": null
    },
    "shipping_status": "unpacked",
    "shipped_at": null,
    "paid_at": null,
    "app_id": null
}
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
            if (typeof order == "undefined") {
                return response.send(new Responser(404, null, 'Order not found', null));
            }

            const credential = credentialsTiendaNube.find(credentials => credentials.storeId === parseInt(storeId));
            if (!credential) {
                return response.send(new Responser(404, null, 'credential not found', null));
            }
            this.database = credential.database
            this.user = credential.user
            this.password = credential.password

            const token = await this.getToken()

            if (!token) {
                return response.send(new Responser(404, null, 'token not found', null));
            }
            this.authToken = token

            const articles = await this.getArticles(this.database, order)

            if (!articles.result.length) return response.send(new Responser(404, null, 'articles not found', null));

            const transactionType = await this.getTiendaNubeTransactions(this.database);

            if (!transactionType) return response.send(new Responser(404, null, 'TransactionType not found', null));

            const company = await this.getCompany(order, transactionType)
           
            if (!company) return response.send(new Responser(404, null, 'Company not found', null));

            const address = this.getaddress(order)

            if (!address) return response.send(new Responser(404, null, 'Address not found', null));

            const movementsOfCash = this.getMovementsOfCash(order)

            if (!movementsOfCash) return response.send(new Responser(404, null, 'movementsOfCash not found', null))
            const user = await this.getUser(this.database)

            if (!user) return response.send(new Responser(404, null, 'user not found', null));

            let transactionTiendaNube: Transaction = TransactionSchema.getInstance(this.database)
            transactionTiendaNube = Object.assign(transactionTiendaNube, {
                tiendaNubeId: order.id,
                letter: "X",
                origin: 0,
                totalPrice: order.total,
                discountAmount: order.discount,
                taxes: [
                    {
                        percentage: (order.discount / order.total) * 100,
                        taxBase: order.subtotal,
                    }
                ],
                number: order.number,
                madein: 'Tienda Nube',
                state: 'Abierto',
                type: transactionType._id,
                company: company,
                deliveryAddress: address._id,
                startDate: order.created_at,

            })
      console.log(transactionTiendaNube)
            const createTransaction = new TransactionUC(this.database, this.authToken).createTransaction(transactionTiendaNube, movementsOfCash, articles.result, user.result[0])

            response.send(new Responser(200, { createTransaction }));

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

    getTiendaNubeTransactions = async (database: string) => {
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

    getMovementsOfCash(order: any) {
        let movementOfCash: MovementOfCash[] = MovementOfCashSchema.getInstance(this.database)
        movementOfCash = Object.assign(movementOfCash, {
            amountPaid: order.total,
            discountAmount: order.discount_gateway,

        })
        return movementOfCash
    }
}