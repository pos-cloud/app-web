import * as express from 'express';
import RequestWithUser from './../../interfaces/requestWithUser.interface';
import ArticleController from './../../domains/article/article.controller';
import Responser from './../../utils/responser';
import HttpException from './../../exceptions/HttpException';
import Article from './../../domains/article/article.interface';

export default class MenuController {
  public EJSON: any = require('bson').EJSON;
  public path = "/menu/:database"; // Modificado para incluir el parámetro :database
  public router = express.Router();
  public obj: any;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.menu);
  }

  menu = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const database = request.params.database;
  
      const result = await new ArticleController(database)
        .getAll({
          project: {
            description: 1,
            "category.description": 1,
            "category.showMenu": 1,
            operationType: 1,
            observation: 1,
            salePrice: 1,
            showMenu: 1
          },
          match: {
            showMenu: true,
            "category.showMenu": true,
            operationType: { $ne : "D" }
          }
        });
  
      if (result.status === 200) {

        // find style for menu

        response.status(200).send(new Responser(200, { data: result.result, style: {}}));
      } else {
        throw new HttpException(
          new Responser(result.status, null, result.message, result.error)
        );
      }
    } catch (error) {
      next(error);
    }
  }
  

}
