import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: 'mov-art-by-category/:module',
    loadComponent: () =>
      import('./mov-art-by-category/mov-art-by-category.component').then((m) => m.ReportMovArtByCategoryComponent),
  },
  {
    path: 'mov-art-by-make/:module',
    loadComponent: () =>
      import('./mov-art-by-make/mov-art-by-make.component').then((m) => m.ReportMovArtByMakeComponent),
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
    path: 'transactions-payment-method/:module',
    loadComponent: () =>
      import('./transactions-by-payment-method/transactions-by-payment-method.component').then(
        (m) => m.TransactionsByPaymentMethod
      ),
  },
  {
    path: 'transactions-by-clients/:module',
    loadComponent: () =>
      import('./transactions-by-clients/transactions-by-clients.component').then(
        (m) => m.transactionsByClientsComponent
      ),
  },
  {
    path: 'transactions-by-employee/:module',
    loadComponent: () =>
      import('./transactions-by-employee/transactions-by-employee.component').then(
        (m) => m.transactionsByEmployeeComponent
      ),
  },
];
