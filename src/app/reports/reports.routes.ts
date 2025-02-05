import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: 'mov-art-by-category/:module',
    loadComponent: () =>
      import('./mov-art-by-category/mov-art-by-category.component').then((m) => m.ReportMovArtByCategoryComponent),
  },
  {
    path: 'current-account/:id',
    loadComponent: () => import('./current-account/current-account.component').then((m) => m.CurrentAccountComponent),
  },
  {
    path: 'production/requierements',
    loadComponent: () =>
      import('./list-articles-requirements-by-transaction/list-articles-requirements-by-transaction.component').then(
        (m) => m.ListArticlesRequirementsByTransactionComponent
      ),
  },
  {
    path: 'sales/payment-method/:module',
    loadComponent: () =>
      import('./report-sales-by-payment-method/report-sales-by-payment-method.component').then(
        (m) => m.ReportSalesByPaymentMethod
      ),
  },
];
