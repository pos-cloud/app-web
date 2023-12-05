import * as express from 'express'

import HttpException from '../../exceptions/HttpException'
import authMiddleware from '../../middleware/auth.middleware'
import ensureLic from '../../middleware/license.middleware'
import Responser from '../../utils/responser'
// import TransactionUC from 'domains/transaction/transaction.uc'
// import TransactionDto from 'domains/transaction/transaction.dto'
import Transaction, { TransactionState } from './../transaction/transaction.interface'
import TransactionSchema from '../transaction/transaction.model'

import RequestWithUser from '../../interfaces/requestWithUser.interface'
import TransactionController from '../transaction/transaction.controller'
import TransactionTypeController from '../transaction-type/transaction-type.controller'
import Responseable from '../../interfaces/responsable.interface'
import Address from '../address/address.interface'
import AddresSchema from '../address/address.model'

//  https://tiendanube.github.io/api-documentation/resources/order#get-ordersid

const exampleOrder: any = {
    "id": 871254203,
    "token": "b872a1befbcde5aaf0517ecbcc910f5dc005350e",
    "store_id": "817495",
    "contact_email": "buyer@tiendanube.com",
    "contact_name": "Maria Silva",
    "contact_phone": "+551533276436",
    "contact_identification": "75839566500",
    "shipping_min_days": null,
    "shipping_max_days": null,
    "billing_name": "Maria",
    "billing_phone": "+551533276436",
    "billing_address": "Rua Doutor Azevedo Sampaio",
    "billing_number": "50",
    "billing_floor": "",
    "billing_locality": "Centro",
    "billing_zipcode": "18010220",
    "billing_city": "Sorocaba",
    "billing_province": "São Paulo",
    "billing_country": "BR",
    "shipping_cost_owner": "0.00",
    "shipping_cost_customer": "0.00",
    "coupon": [],
    "promotional_discount": {
        "id": null,
        "store_id": 817495,
        "order_id": "871254203",
        "created_at": "2022-11-15T19:37:08+0000",
        "total_discount_amount": "0.00",
        "contents": [],
        "promotions_applied": []
    },
    "subtotal": "6000.00",
    "discount": "600.00",
    "discount_coupon": "0.00",
    "discount_gateway": "600.00",
    "total": "5400.00",
    "total_usd": "40.79",
    "checkout_enabled": true,
    "weight": "0.000",
    "currency": "ARS",
    "language": "es",
    "gateway": "offline",
    "gateway_id": null,
    "gateway_name": "Transferencia Bancaria",
    "shipping": "table",
    "shipping_option": "Envio Personalizado 1",
    "shipping_option_code": "table_6103303",
    "shipping_option_reference": null,
    "shipping_pickup_details": null,
    "shipping_tracking_number": null,
    "shipping_tracking_url": null,
    "shipping_store_branch_name": null,
    "shipping_pickup_type": "ship",
    "shipping_suboption": [],
    "extra": {},
    "storefront": "store",
    "note": "",
    "created_at": "2022-11-15T19:36:59+0000",
    "updated_at": "2022-11-15T19:37:08+0000",
    "completed_at": {
        "date": "2022-11-15 19:36:59.000000",
        "timezone_type": 3,
        "timezone": "UTC"
    },
    "next_action": "waiting_manual_confirmation",
    "payment_details": {
        "method": "custom",
        "credit_card_company": null,
        "installments": 1
    },
    "attributes": [],
    "customer": {
        "id": 105799009,
        "name": "Maria Silva",
        "email": "buyer@tiendanube.com",
        "identification": "75839566500",
        "phone": "+551533276436",
        "note": null,
        "default_address": {
            "address": "Evergreen Terrace",
            "city": "New York",
            "country": "US",
            "created_at": "2022-11-15T19:36:59+0000",
            "default": true,
            "floor": "Apartment 8",
            "id": 80189931,
            "locality": "Bronx",
            "name": "John Doe",
            "number": "742",
            "phone": "john.doe@example.com",
            "province": "New York",
            "updated_at": "2022-11-15T19:36:59+0000",
            "zipcode": "10451"
        },
        "addresses": [
            {
                "address": "Evergreen Terrace",
                "city": "New York",
                "country": "US",
                "created_at": "2022-11-15T19:36:59+0000",
                "default": true,
                "floor": "Apartment 8",
                "id": 80189931,
                "locality": "Bronx",
                "name": "John Doe",
                "number": "742",
                "phone": "john.doe@example.com",
                "province": "New York",
                "updated_at": "2022-11-15T19:36:59+0000",
                "zipcode": "10451"
            }
        ],
        "billing_name": "Maria",
        "billing_phone": "+551533276436",
        "billing_address": "Rua Doutor Azevedo Sampaio",
        "billing_number": "50",
        "billing_floor": "",
        "billing_locality": "Centro",
        "billing_zipcode": "18010220",
        "billing_city": "Sorocaba",
        "billing_province": "São Paulo",
        "billing_country": "BR",
        "extra": {},
        "total_spent": "27.00",
        "total_spent_currency": "USD",
        "last_order_id": 871254203,
        "active": false,
        "first_interaction": "2022-11-15T19:36:59+0000",
        "created_at": "2022-11-15T19:36:59+0000",
        "updated_at": "2022-11-15T19:36:59+0000"
    },
    "products": [
        {
            "id": 1069053829,
            "depth": "0.00",
            "height": "0.00",
            "name": "Mesa de Roble",
            "price": "6000.00",
            "compare_at_price": "37.77",
            "product_id": 111334785,
            "image": {
                "id": 277896749,
                "product_id": 111334785,
                "src": "https://d2r9epyceweg5n.cloudfront.net/stores/817/495/products/pexels-olya-prutskova-89764951-74e3f47763f1aec3ec16448436206687-1024-1024.jpg",
                "position": 1,
                "alt": [],
                "created_at": "2022-02-14T13:00:03+0000",
                "updated_at": "2022-10-28T21:52:37+0000"
            },
            "quantity": "1",
            "free_shipping": false,
            "weight": "0.00",
            "width": "0.00",
            "variant_id": "426215948",
            "variant_values": [],
            "properties": [],
            "sku": "12389012348124801234890",
            "barcode": null
        }
    ],
    "number": 306,
    "cancel_reason": null,
    "owner_note": null,
    "cancelled_at": null,
    "closed_at": null,
    "read_at": null,
    "status": "open",
    "payment_status": "pending",
    "gateway_link": null,
    "shipping_carrier_name": null,
    "shipping_address": {
        "address": "Evergreen Terrace",
        "city": "New York",
        "country": "US",
        "created_at": "2022-11-15T19:23:59+0000",
        "default": false,
        "floor": "Apartment 8",
        "id": 0,
        "locality": "Bronx",
        "name": "John Doe",
        "number": "742",
        "phone": "john.doe@example.com",
        "province": "New York",
        "updated_at": "2022-11-15T19:37:08+0000",
        "zipcode": "10451",
        "customs": null
    },
    "shipping_status": "unpacked",
    "shipped_at": null,
    "paid_at": null,
    "landing_url": "http://www.example.com?source=abc",
    "client_details": {
        "browser_ip": "181.16.41.4",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36"
    },
    "app_id": null
}

export default class TiendaNubeController {
    public EJSON: any = require('bson').EJSON
    public path = '/tienda-nube'
    public router = express.Router()
    public database: string;

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}/add-transaction`, [authMiddleware, ensureLic], this.createTransaction
        )
    }

    createTransaction(
        request: RequestWithUser,
        response: express.Response,
        next: express.NextFunction,) {

        let database = request.database;
        const order = request.body;

        if (Object.keys(order).length < 0) {
            return response.send(new Responser(404, null, 'Order not found', null));
        }
        new TransactionTypeController(database).getAll({
            project: {
                _id: 1,
                name: 1,
                allowAPP: 1,
                'application._id': 1,
                'application.name': 1,
                'application.type': 1
            },
            match: {
                allowAPP: true,
                'application.type': 'TiendaNube'
            },
        })
            .then(async (result: Responseable) => {
                if (result.status == 200) {
                    if (result.result.length > 0) {
                        let addressTiendaNube: Address = AddresSchema.getInstance(database)
                        addressTiendaNube = Object.assign(addressTiendaNube, {
                            country: order.shipping_address.country,
                            city: order.shipping_address.city,
                            floor: order.shipping_address.floor,
                            name: order.shipping_address.name,
                            postalCode: order.shipping_address.zipcode,
                        })

                        let transactionTiendaNube: Transaction = TransactionSchema.getInstance(database)
                        transactionTiendaNube = Object.assign(transactionTiendaNube, {
                            letter: "X",
                            origin: 0,
                            totalPrice: order.total,
                            discountAmount: order.discount,
                            number: order.number,
                            madein: 'Tienda Nube',
                            state: order.status,
                            deliveryAddress: addressTiendaNube,
                            startDate: order.created_at,
                            shipmentMethod: order.shipping,
                        })

                        response.send(new Responser(200, transactionTiendaNube));
                    }
                }
            }).catch(error => {
                response.send(new Responser(500, null, error));
            })
    }
}