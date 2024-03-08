import Article from "../article/article.interface";
import ArticleController from "../article/article.controller";
import ArticleStockController from "./article-stock.controller";
import ArticleStockSchema from '../article-stock/article-stock.model'
import ArticleStock from "./article-stock.interface";
import Responser from './../../utils/responser'

export default class ArticleStockUC {
  database: string;
  articleStockController: ArticleStockController;
  api: any;
  authToken: string;

  constructor(database: string) {
    this.database = database;
    this.articleStockController = new ArticleStockController(database);
  }

  async importFromExcel(data: any[], branchId: string, depositId: string) {
    return new Promise<{}>(async (resolve, reject) => {
      let articlesObject: any = {};
      const response = {
        updateArticle: <any>[],
        notUpdateArticle: <any>[],
        countUpdate: 0,
        countNotUpdate: 0
      };

      const articles = data.map((obj) => obj.column1);

      data.forEach((item) => {
        articlesObject[item.column1] = item;
        response.notUpdateArticle.push(item.column1);
      });

      try {
        if (articles.some(code => code === '')) {
          return reject(new Responser(500, null, "En el archivo Excel, hay códigos de productos que están incompletos."))
        }

        const article = await new ArticleController(this.database).find(
          { code: { $in: articles }, type: "Final" }, {}
        );

        const existingCodes = article.map((item: Article) => item.code);

        const nonExistingCodes = existingCodes.filter(code => !existingCodes.includes(code));
        nonExistingCodes.forEach((item) => {
          response.notUpdateArticle.push(item);
        });


        const articlesStockByArticle = await new ArticleStockController(
          this.database,
        ).find(
          { code: { $in: existingCodes }, deposit: depositId, branch: branchId }, {}
        );

        articlesStockByArticle.forEach((item: any) => {
          item.realStock = articlesObject[item.code].column2;
          item.minStock = articlesObject[item.code].column3;
          item.maxStock = articlesObject[item.code].column4;
        });

        const updatePromises = articlesStockByArticle.map(async (item: any) => {
          const result = await new ArticleStockController(this.database).update(
            item._id,
            {
              realStock: item.realStock,
              minStock: item.minStock,
              maxStock: item.maxStock,
            },
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
          return result;
        });

        await Promise.all(updatePromises);

        const existingCodesS = articlesStockByArticle.map((item: ArticleStock) => item.code);
        const articlesNotFoundInStock = existingCodes.filter(code => !existingCodesS.includes(code));


        const createPromises = articlesNotFoundInStock.map(async (code) => {
          const articleData = articlesObject[code];

          const articles: Article[] = await new ArticleController(this.database).find({ code: code, type: "Final" }, {});

          const article = articles[0];
          let articleStock: ArticleStock = ArticleStockSchema.getInstance(this.database);
          articleStock = Object.assign(articleStock, {
            code,
            article: article._id,
            deposit: depositId,
            branch: branchId,
            realStock: articleData.column2,
            minStock: articleData.column3,
            maxStock: articleData.column4,
          });

          const result = await new ArticleStockController(this.database).save(articleStock);
          if (result.status === 200) {
            const createdCode = result.result.code;
            if (!response.updateArticle.includes(createdCode)) {
              response.updateArticle.push(createdCode);
            }
            const indexToRemove = response.notUpdateArticle.indexOf(createdCode);
            if (indexToRemove !== -1) {
              response.notUpdateArticle.splice(indexToRemove, 1);
            }
          }
          return result;
        });

        await Promise.all(createPromises);

        response.countUpdate = response.updateArticle.length;
        response.countNotUpdate = response.notUpdateArticle.length;
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  }
}