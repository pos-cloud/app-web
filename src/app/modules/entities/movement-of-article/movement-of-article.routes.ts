import { Routes } from '@angular/router';

export const MOVEMENT_OF_ARTICLE_ROUTES: Routes = [
  {
    path: ':type',
    loadComponent: () =>
      import('./list/list-movement-of-article.component').then((m) => m.ListMovementOfArticleComponent),
  },
];
