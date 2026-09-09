import { Routes } from '@angular/router';

export const ARTICLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list-article/list-articles.component').then((m) => m.ListArticlesComponent),
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
  {
    path: 'variants',
    loadComponent: () => import('./list-variants/list-variants.components').then((m) => m.ListVariantsComponent),
  },
  {
    path: 'variants/view/:id',
    loadComponent: () => import('./crud/article.component').then((m) => m.ArticleComponent),
  },
  {
    path: 'variants/update/:id',
    loadComponent: () => import('./crud/article.component').then((m) => m.ArticleComponent),
  },
  {
    path: 'variants/delete/:id',
    loadComponent: () => import('./crud/article.component').then((m) => m.ArticleComponent),
  },
];
