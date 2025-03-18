import { Routes } from '@angular/router';

export const ARTICLE_ROUTES: Routes = [
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
];
