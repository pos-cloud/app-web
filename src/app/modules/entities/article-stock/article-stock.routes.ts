import { Routes } from '@angular/router';

export const ARTICLE_STOCK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-article-stock.component').then((m) => m.ListArticleStockComponent),
  },
];
