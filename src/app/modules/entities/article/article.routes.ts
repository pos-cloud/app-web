import { Routes } from '@angular/router';

export const ARTICLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-articles.component').then((m) => m.ListArticlesComponent),
  },
  {
    path: 'variants',
    loadComponent: () =>
      import('./list/lis-articles-variants/list-articles-variants.component').then((m) => m.ListVariantsComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/article.component').then((m) => m.ArticleComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/article.component').then((m) => m.ArticleComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/article.component').then((m) => m.ArticleComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/article.component').then((m) => m.ArticleComponent),
  },
  {
    path: 'copy/:id',
    loadComponent: () => import('./crud/article.component').then((m) => m.ArticleComponent),
  },
];
