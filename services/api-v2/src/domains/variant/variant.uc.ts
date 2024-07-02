import axios from "axios"
import VariantController from "./variant.controller"
import Variant from "./variant.interface"
import ArticleController from "../article/article.controller"

export default class VariantUC {
    database: string
    articleController: VariantController
    api: any
    authToken: string

    constructor(database: string, authToken?: string) {
        this.database = database
        this.authToken = authToken
        this.articleController = new VariantController(database)
        this.api = axios.defaults
    }

    createVariant = async (articleParentId: string, variants: Variant) => {

        const article = await new ArticleController(this.database).getAll({
            project: {
                _id: 1,
                description: 1
            },
            match: {
                _id: { $oid: articleParentId }
            }
        })
        return article
    }


}