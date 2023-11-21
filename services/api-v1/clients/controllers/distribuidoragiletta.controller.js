'use strict'

const { EJSON } = require('bson');
const constants = require('./../../utilities/constants');

let moment = require('moment');
moment.locale('es');

let ArticleStock;
let Article;
let Variant;

// METODOS ASYNC
async function updateArticle(req, res, next) {

    initConnectionDB('distribuidoragiletta');

    let query = [];

    query.push({
        $lookup: {
            from: "categories",
            foreignField: "_id",
            localField: "category",
            as: "category"
        }
    })

    query.push({
        $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true
        }
    });

    query.push({
        $lookup: {
            from: "makes",
            foreignField: "_id",
            localField: "make",
            as: "make"
        }
    })

    query.push({
        $unwind: {
            path: "$make",
            preserveNullAndEmptyArrays: true
        }
    });

    query.push({
        $match:
        {
            $and:
                [
                    {
                        "make.ecommerceEnabled": true,
                        "category.ecommerceEnabled": true,
                        "type": "Final",
                        "allowSaleWithoutStock": false,
                        "operationType": { "$ne": "D" },
                    }
                ],
        }
    });

    query.push({
        $project: {
            "make.ecommerceEnabled": 1,
            "category.ecommerceEnabled": 1,
            "containsVariants": 1,
            "type": 1,
            "operationType": 1,
            "ecommerceEnabled": 1
        }
    })

    query = EJSON.parse(JSON.stringify(query));


    Article.aggregate(query)
        .allowDiskUse(true)
        .then(async function (result) {
            let quantity = 0;

            for (const article of result) {
                let ecommerce;
                if (article.containsVariants) {
                    ecommerce = await getVariants(article._id)
                } else {
                    ecommerce = await getArticleStock(article._id)
                }
                if (article.ecommerceEnabled != ecommerce) {
                    await Article.findByIdAndUpdate(article._id,
                        {
                            $set: {
                                ecommerceEnabled: ecommerce
                            }
                        }, (err, Article) => {
                            if (err) {
                                return res.status(500).send(constants.ERR_SERVER);
                            } else {
                                quantity++;
                            }
                        });
                }
            };
            return res.status(200).send({ message: "Fueron actualizado:" + quantity + " productos" });
        });
}

function getVariants(articleId) {

    return new Promise((resolve, reject) => {

        initConnectionDB('distribuidoragiletta');


        let query = [];

        query.push({
            $match:
            {
                $and:
                    [
                        {
                            "articleParent": { $oid: articleId },
                            "operationType": { "$ne": "D" },
                        }
                    ],
            }
        });


        query.push({
            $project: {
                "articleParent": 1,
                "articleChild": 1,
                "operationType": 1
            }
        })

        query = EJSON.parse(JSON.stringify(query));


        Variant.aggregate(query)
            .allowDiskUse(true)
            .then(async function (result) {
                for (const variant of result) {
                    if (await getArticleStock(variant.articleChild)) {
                        resolve(true)
                    }
                }
                resolve(false)
            });
    })
}

function getArticleStock(articleId) {

    return new Promise((resolve, reject) => {

        initConnectionDB('distribuidoragiletta');

        let query = [];

        query.push({
            $match:
            {
                $and:
                    [
                        {
                            "article": { $oid: articleId },
                            "operationType": { "$ne": "D" },
                        }
                    ],
            }
        });

        query.push({
            $project: {
                "realStock": 1,
                "deposit": 1,
                "article": 1,
                "operationType": 1,
            }
        })
        query = EJSON.parse(JSON.stringify(query));


        ArticleStock.aggregate(query)
            .allowDiskUse(true)
            .then(async function (result) {

                let quantity = 0;
                for (const articleStock of result) {
                    quantity = quantity + articleStock.realStock
                }

                if (quantity > 0) {
                    resolve(true)
                } else {
                    resolve(false)
                }


            })
    })

}


function initConnectionDB(database) {

    const Model = require('./../../models/model');

    let ArticleStockSchema = require('./../../models/article-stock');
    ArticleStock = new Model('article-stock', {
        schema: ArticleStockSchema,
        connection: database
    });

    let ArticleSchema = require('./../../models/article');
    Article = new Model('article', {
        schema: ArticleSchema,
        connection: database
    });

    let VariantSchema = require('./../../models/variant');
    Variant = new Model('variant', {
        schema: VariantSchema,
        connection: database
    });

}

module.exports = {
    updateArticle
}