import ArticleStockController from "./article-stock.controller";

export default class ArticleStockUC {
  database: string;
  articleStockController: ArticleStockController;
  api: any;
  authToken: string;

  constructor(database: string) {
    this.database = database;
    this.articleStockController = new ArticleStockController(database);
  }

  async updateFromExcel(data: any[], branchId: string, depositId: string) {
    return new Promise<{}>(async (resolve, reject) => {
      let articlesObject: any = {};

      const response = {
        updateArticle: <any>[],
        notUpdateArticle: <any>[],
        countUpdate: 0,
        countNotUpdate: 0
      }

      const articles = data.map((obj) => obj.article);

      data.forEach((item) => {
        articlesObject[item.article] = item;
        response.notUpdateArticle.push(item.article)
      });

      try {
        const articlesStockByArticle = await new ArticleStockController(
          this.database,
        ).find({ code: { $in: articles } }, {});

        articlesStockByArticle.forEach((item: any) => {
          item.realStock = articlesObject[item.code].realStock;
          item.minStock = articlesObject[item.code].minStock;
          item.maxStock = articlesObject[item.code].maxStock;
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

          if(result.status == 200) {
            response.updateArticle.push(result.result.code) 
            let indexToRemove = response.notUpdateArticle.indexOf(result.result.code);
              if (indexToRemove !== -1) {
                response.notUpdateArticle.splice(indexToRemove, 1);
              }
          }
          return result;
        });

        await Promise.all(updatePromises);

        response.countUpdate = response.updateArticle.length
        response.countNotUpdate = response.notUpdateArticle.length

        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  }
}
