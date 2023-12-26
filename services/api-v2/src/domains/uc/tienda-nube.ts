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

//  https://tiendanube.github.io/api-documentation/resources/order#get-ordersid

const credentialsTiendaNube = [
    {
        tokenTiendaNube: 'caeb032b8bbd258ae2fe42ef70b7c95b44e400eb',
        storeId: 3937256,
        database: 'demo',
        user:'admin',
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
        this.router.get(`${this.path}/credentials/:storeId`, this.getCredentials )
    }


    createTransaction = async (
        request: RequestWithUser,
        response: express.Response,
        next: express.NextFunction) => {
        try {
            const { storeId, order} = request.body;
            
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

            const company = this.getCompany(order)

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
                    percentage: (order.discount / order.total )* 100,
                    taxBase: order.subtotal,
                    }
                ],
                number: order.number,
                madein: 'Tienda Nube',
                state: 'Abierto',
                type: transactionType._id,
                company: company._id,
                deliveryAddress: address._id,
                startDate: order.created_at,
                
            })
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
 
       const {storeId} = request.params;
       if(!storeId){
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
                    'application.type': 1
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

    getCompany(order: any) {
        if (order.customer) {
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
            return company
        }
        return null

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

    async getToken(){
        let URL = 'https://api.poscloud.com.ar/api/login'
     
        let params ={
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