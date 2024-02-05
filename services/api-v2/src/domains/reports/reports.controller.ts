import * as express from 'express'

import authMiddleware from '../../middleware/auth.middleware'
import ensureLic from '../../middleware/license.middleware'
import RequestWithUser from '../../interfaces/requestWithUser.interface'
import Responser from '../../utils/responser'
import { getItem } from './report/report-transaction'

export default class ArticleRequirementsByTransaccionController {

    public EJSON: any = require('bson').EJSON
    public path = '/reports'
    public router = express.Router()
    public database: string;
    public authToken: string;

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/article-requirements`, [authMiddleware, ensureLic], this.requirementByTransaction)
    }

    requirementByTransaction = async (
        request: RequestWithUser,
        response: express.Response,
        next: express.NextFunction
    ) => {
        this.database = request.database;
        const { startDate, endDate, status, transactionType, dateSelect, branch} = request.body

        const transactions = await getItem(startDate, endDate, status, transactionType, this.database, dateSelect, branch)

        if (transactions.length === 0) return response.send(new Responser(404, 0, 'Transaction not found'))

        return response.send(new Responser(200, transactions))
    }
}

