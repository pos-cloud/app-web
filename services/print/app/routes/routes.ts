import { Response, Router } from 'express';
import authMiddleware from '../middleware/auth.middleware';
import { getPrintArticle } from '../controllers/get-print-article.controller';
import { getPrintTransaction } from '../controllers/get-print-transaction';
import { getImage } from '../controllers/get-image.controller';
import { getPrintArticles } from '../controllers/get-print-articles.controller';
import RequestWithUser from 'interfaces/requestWithUser.interface';

class PrintRoutes {
  router = Router();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.get('/article', [authMiddleware], getPrintArticle);
    this.router.get('/transaction', [authMiddleware], getPrintTransaction);
    this.router.get('/get-img', [authMiddleware], getImage);
    this.router.post('/get-articles',[authMiddleware], getPrintArticles)

    this.router.get('/ver', (  
      req: RequestWithUser,
      res: Response) => {    
      res.status(200).send({ ver: '1' });
    });
  }
}
export default new PrintRoutes().router;