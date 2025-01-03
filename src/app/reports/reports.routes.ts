import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: 'mov-art-by-category/:module',
    loadComponent: () =>
      import('./mov-art-by-category/mov-art-by-category.component').then(
        (m) => m.ReportSalesByCategoryComponent
      ),
  },
  {
    path: 'current-account/:id',
    loadComponent: () =>
      import('./current-account/current-account.component').then(
        (m) => m.CurrentAccountComponent
      ),
  },
  {
    path: 'production/requierements',
    loadComponent: () =>
      import(
        './list-articles-requirements-by-transaction/list-articles-requirements-by-transaction.component'
      ).then((m) => m.ListArticlesRequirementsByTransactionComponent),
  },
];
