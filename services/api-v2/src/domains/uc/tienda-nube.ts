import * as express from 'express'
import axios from 'axios'
import moment = require('moment')
import Responser from '../../utils/responser'
import Responseable from 'interfaces/responsable.interface'
import Transaction from './../transaction/transaction.interface'
import TransactionSchema from '../transaction/transaction.model'
import RequestWithUser from '../../interfaces/requestWithUser.interface'
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
import PaymentMethod from '../payment-method/payment-method.interface'
import TransactionController from '../transaction/transaction.controller'
import AddressController from '../address/address.controller'
import CompanyController from '../company/company.controller'
import MovementOfCashController from '../movement-of-cash/movement-of-cash.controller'
import ApplicationController from '../application/application.controller'
import { ApplicationType } from '../application/application.interface'
import authMiddleware from './../../middleware/auth.middleware'
import ensureLic from './../../middleware/license.middleware'
import TransactionTypeController from '../transaction-type/transaction-type.controller'
import IdentificationTypeController from '../identification-type/identification-type.controller'
import config from '../../utils/config'

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
    },
    {
        tokenTiendaNube: '7c4682264c62f8f5cd246fac1687278adb8ce508',
        storeId: 1350756,
        database: 'arterama',
        user: 'soporte',
        password: '9fR8Gh49'
    },
    {
        tokenTiendaNube: '6d2b63bbf23ad4131d376209f331c74e9afc36af',
        storeId: 3937223,
        database: 'demotest',
        user: 'soporte',
        password: 'etUHWcAv'
    },
    {
        tokenTiendaNube: '1c1d2af103fe9e3eb36a1993329139e03d7c2366',
        storeId: 535284,
        database: 'syp',
        user: 'soporte',
        password: 'PosRest@'
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
        this.router.get(`${this.path}/credentials/:storeId`, this.getCredentials);
        this.router.post(`${this.path}/add-transaction`, this.createTransaction);
        this.router.post(`${this.path}/webhook`, this.verifyWebHook);
        this.router.post(`${this.path}/order`,[authMiddleware, ensureLic], this.getOrder);
    }

    createTransaction = async (
        request: RequestWithUser,
        response: express.Response,
        next: express.NextFunction) => {
        try {
            const { storeId, order, event} = request.body;
            
            if(!storeId || !order){
            return response.send(new Responser(404, null, 'No se encuentra ni el ID de la tienda ni la orden.', null));
            }
            return this.createTransactionByOrder(storeId, order, event).then((data) =>{
                return response.send(new Responser(200,data))
            }).catch((error)=>{
                return response.send(new Responser(404, null, error))
            })
        } catch (error) {
            console.log(error)
            response.send(new Responser(500, null, error));
        }
    }

    async createTransactionByOrder(storeId: any, order: any, event?: string){
        try{
            const credential = credentialsTiendaNube.find(credentials => credentials.storeId === parseInt(storeId));
            if (!credential) return new Responser(404, null, 'credential not found', null)
    
            this.database = credential.database
            this.user = credential.user
            this.password = credential.password
    
            const token = await this.getToken()
    
            if (!token) return new Responser(404, null, 'token not found', null)
    
            this.authToken = token
            const transaction = await this.getTransaction(order)
        
            if (transaction.length > 0 || event === "order/updated") {
                let resp = await this.updateTransaction(order, transaction[0])
                return new Responser(200, resp);
            }
    
            const application = await this.getApplications()

            const transactionType = await this.getTransactionType(application.result[0].tiendaNube.transactionType)
       
            const company = await this.getCompany(order, transactionType)
    
            if (!company) return new Responser(404, null, 'Company not found', null);
    
            let address = null
            if (order.shipping_address.id !== 0) {
                address = await this.createAddress(order, transactionType)
    
                if (!address)  throw new Error('Address not found');
            }
    
            const movementsOfCash = this.getMovementsOfCash(order, application.result[0].tiendaNube.paymentMethod)
    
            if (!movementsOfCash) throw new Error('movementsOfCash not found');
       
            const movementOfArticle = await this.getMovementsOfArticles(order)
    
            if (!movementOfArticle.length)  throw new Error('movementOfArticle not found');
    
            const user = await this.getUser(this.database)
    
            if (!user) throw new Error('user not found');
        
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
                endDate2: order.created_at,
                endDate: moment(order.created_at).format("MM/DD/YYYY"),
                balance: order.total,
                shipmentMethod: application.result[0].tiendaNube.shipmentMethod,
                paymentMethodEcommerce: order.payment_details.method,
                type: application.result[0].tiendaNube.transactionType,
                company: company,
                deliveryAddress: address !== null ? address._id : address,
                startDate: order.created_at,
                observation: order.note
            })
    
            const createTransaction = await new TransactionUC(this.database, this.authToken).createTransaction(transactionTiendaNube, movementsOfCash, movementOfArticle, user.result[0])
    
            return new Responser(200, { createTransaction });
    
        }catch(err){
            console.log(err)
        }
    }

    verifyWebHook = async (
        request: RequestWithUser,
        response: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const { userId, authentication } = request.body;

            const Webhooks = await this.getWebhook(userId, authentication)
            if (!Webhooks.length) {
                const createWebhook: any = await this.createWebhook(userId, authentication)
                if (createWebhook.length) {
                    return response.send(new Responser(200, createWebhook, userId, authentication));
                }
                return response.send(new Responser(200, 'No se encontraron un usuario con esas credenciales'));
            }
            const deleteWebhooks = await this.deleteWebhook(Webhooks, userId, authentication)
            if (deleteWebhooks) {
                const createWebhook: any = await this.createWebhook(userId, authentication)
                if (createWebhook.length) {
                    return response.send(new Responser(200, createWebhook, userId, authentication));
                }
                return response.send(new Responser(200, 'Error al crear los webhooks'));
            }
            return response.send(new Responser(200, deleteWebhooks));
        } catch (error) {
            return response.send(new Responser(500, error));
        }
    }

    async getWebhook(userId: string, authentication: string) {
        try {
            let URL = `https://api.tiendanube.com/v1/${userId}/webhooks`;
            const requestOptions = {
                headers: {
                    Authentication: `bearer ${authentication}`
                }
            };
            const webhook = await axios.get(URL, requestOptions)
            return webhook.data
        } catch (error) {
            throw 'Tienda no encontrada con las credenciales proporcionadas';
        }
    }

    async createWebhook(userId: string, authentication: string) {
        try {
            let URL = `https://api.tiendanube.com/v1/${userId}/webhooks`;

            const requestOptions = {
                headers: {
                    Authentication: `bearer ${authentication}`
                }
            };
            const webhooksData = [
                {
                    event: 'order/created',
                    url: "https://api-tiendanube.poscloud.ar/orders/post-webhook",
                },
                {
                    event: 'order/updated',
                    url: "https://api-tiendanube.poscloud.ar/orders/post-webhook",
                }
            ];

            const webhookPromises = webhooksData.map(async (data) => {
                const response = await axios.post(URL, data, requestOptions)
                return response.data;
            });

            const webhooks = await Promise.all(webhookPromises);
            return webhooks
        } catch (error) {
            throw 'Tienda no encontrada con las credenciales proporcionadas'
        }
    }

    async deleteWebhook(webhook: any, userId: string, authentication: string) {
        try {
            const requestOptions = {
                headers: {
                    Authentication: `bearer ${authentication}`
                }
            };
            const webhookPromises = webhook.map(async (data: any) => {
                const response = await axios.delete(`https://api.tiendanube.com/v1/${userId}/webhooks/${data.id}`, requestOptions)
                return response.data;
            });
            const webhooks = await Promise.all(webhookPromises);
            return webhooks
        } catch (error) {
            console.log(error)
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
        transaction.number = order.number

        if (transaction.deliveryAddress) {
            let address = await this.getAddress(transaction.deliveryAddress._id, order)
            transaction.deliveryAddress._id = address
        }
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

    getArticlesById = async (producId: any) => {
        try {
            const ArticlesObj: any = {};

            let matchCondition;
            if (Array.isArray(producId)) {
                matchCondition = { tiendaNubeId: { $in: producId } };
            } else {
                matchCondition = { _id: { $oid: producId } };
            }
            const articles = await new ArticleController(this.database).getAll({
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
                match: matchCondition
            });

            if (Array.isArray(producId)) {
                articles.result.forEach((item: any) => {
                    if (item.tiendaNubeId) {
                        ArticlesObj[item.tiendaNubeId] = item;
                    }
                })
                return ArticlesObj;
            } else {
                return articles
            }
        } catch (error) {
            throw error;
        }
    }

    async getCompanyByIdentification(emails: string, id: string) {
        try {
            if (emails !== '') {
                const company = await new CompanyController(this.database).getAll({
                    project: {
                        _id: 1,
                        name: 1,
                        fantasyName: 1,
                        emails: 1,
                        identificationValue: 1
                    },
                    match: {
                        emails: emails
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
                  const company = await this.getCompanyByIdentification(order.customer.email, '');
                    if (company.length > 0) {
                        resolve(company[0]);
                    } else {
                        const companyType = await this.getCompanyByIdentification('', transactionType.company._id);
                        const identificationType = await this.getIdentificationType()
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
                            vatCondition: companyType,
                            identificationType: identificationType._id
                        });

                        await new CompanyController(this.database).save(company)
                            .then((result: Responseable) => resolve(result.result))
                            .catch((error) => reject(error));
                    }
                } else {
                    const company = await this.getCompanyByIdentification(order.contact_email, '');
                    if (company.length > 0) {
                        resolve(company[0]);
                    } else {
                        const companyType = await this.getCompanyByIdentification('', transactionType.company._id);
                        const identificationType = await this.getIdentificationType()
                        let company: Company = CompanySchema.getInstance(this.database);
                        company = Object.assign(company, {
                            name: order.contact_name,
                            type: 'Cliente',
                            address: order.billing_address,
                            city: order.billing_city,
                            phones: order.billing_phone,
                            emails: order.contact_email,
                            identificationValue: order.contact_identification || 99999999,
                            addressNumber: order.billing_number,
                            zipCode: order.billing_zipcode,
                            floorNumber: order.billing_floor,
                            vatCondition: companyType,
                            identificationType: identificationType._id
                        });

                        await new CompanyController(this.database).save(company)
                            .then((result: Responseable) => resolve(result.result))
                            .catch((error) => reject(error));
                    }
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
                    country: order.shipping_address.country || "No informado",
                    city: order.shipping_address.city || "No informado",
                    floor: order.shipping_address.floor || "No informado",
                    name: order.shipping_address.name || "No informado",
                    state: order.billing_province || "No informado",
                    company: company,
                    number: order.shipping_address.number || "No informado",
                    postalCode: order.shipping_address.zipcode || "No informado",
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
        let URL = `${config.API_URL}/login`

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

    async getMovementsOfArticles(order: any) {
       try {

            let variantIds: number[] = [];
            let productIds: number[] = []
            order.products.forEach((product: any) => {
                if (product.variant_values.length) {
                    variantIds.push(parseInt(product.variant_id))
                } else {
                    productIds.push(product.product_id)
                }

            });
            let ids = productIds.concat(variantIds)
            const articlesObj = await this.getArticlesById(ids);
         
            const movOfArticle = [];

            for (const product of order.products) {
                let article
                if (product.variant_values.length) {
                    article = articlesObj[product.variant_id];
                } else {
                    article = articlesObj[product.product_id];
                }
               
                if (article) {
                    let movementOfArticle: MovementOfArticle = MovementOfArticleSchema.getInstance(this.database);

                    movementOfArticle = Object.assign(movementOfArticle, {
                        code: article.code,
                        amount: product.quantity,
                        description: article.description,
                        basePrice: article.basePrice,
                        salePrice: product.price * product.quantity,
                        unitPrice: product.price,
                        costPrice: article.costPrice,
                        discountRate: (order.discount / order.subtotal) * 100,
                        article: article._id,
                        modifyStock: true,
                        quantityForStock: -product.quantity,
                        stockMovement: 'Salida',
                        category: article.category._id
                    });

                    movOfArticle.push(movementOfArticle);
                } else {
                    const resultApp = await this.getApplications()
                    const resultArt = await this.getArticlesById(resultApp.result[0].tiendaNube.article);
                    let article = resultArt.result[0]
                   
                    let movementOfArticle: MovementOfArticle = MovementOfArticleSchema.getInstance(this.database);
                    movementOfArticle = Object.assign(movementOfArticle, {
                        code: article.code,
                        amount: product.quantity,
                        description: product.name,
                        basePrice: article.basePrice,
                        salePrice: product.price * product.quantity,
                        unitPrice: product.price,
                        costPrice: article.costPrice,
                        discountRate: (order.discount / order.subtotal) * 100,
                        article: article._id,
                        modifyStock: true,
                        quantityForStock: -product.quantity,
                        stockMovement: 'Salida',
                        category: article.category._id
                    });

                    movOfArticle.push(movementOfArticle);
                }
            }
            return movOfArticle;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async getApplications() {
        let result = await new ApplicationController(this.database).getAll({
            project: {
                _id: 1,
                type: 1,
                tiendaNube: {
                    article: 1,
                    company: 1,
                    transactionType: 1,
                    paymentMethod: 1,
                    shipmentMethod: 1
                }
            },
            match: {
                type: ApplicationType.TiendaNube

            },
        })
        return result

    }

    async getTransactionType(id: string){
        let result = await new TransactionTypeController(this.database).getAll({
            project: {
                _id: 1,
                company: 1
               
            },
            match: {
                _id: { $oid: id }

            },
        })
        return result.result[0]
    }

    async getIdentificationType(){
        let result = await new IdentificationTypeController(this.database).getAll({
            project: {
                _id: 1,
                name: 1
               
            },
            match: {
                name: 'DNI'

            },
        })
        return result.result[0]
    }

    getOrder = async (
        request: RequestWithUser,
        response: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const { date } = request.body
            const db = request.database
            if (!date.desde || !date.hasta) {
                return response.send(new Responser(400, 'Debe ponen las fechas correctamente'))
            }
            const dateRangeISO = {
                desde: new Date(date.desde).toISOString(),
                hasta: new Date(date.hasta).toISOString()
            };
            const credential = credentialsTiendaNube.find(credentials => credentials.database === db);

            const URL = `https://api.tiendanube.com/v1/${credential.storeId}/orders?per_page=200&created_at_min=${dateRangeISO.desde}&created_at_max=${dateRangeISO.hasta}`;

            const requestOptions = {
                headers: {
                    Authentication: `bearer ${credential.tokenTiendaNube}`
                }
            };
            const res = await axios.get(URL, requestOptions);

            if (!res.data.length) {
                return response.send('No hay ordenes a sincronizar')
            }
            for (const order of res.data) {
                await this.createTransactionByOrder(credential.storeId, order);
            }
            return response.send(new Responser(200, 'Las ordenes se sincronizaron correctamente'))
        } catch (error) {
            console.log(error)
        }
    }
}