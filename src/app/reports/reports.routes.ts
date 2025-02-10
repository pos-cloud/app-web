import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: 'dashboard/:module',
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DasboardComponent),
  },
  {
    path: 'mov-art-by-article/:module',
    loadComponent: () =>
      import('./mov-art-by-article/mov-art-by-article.component').then((m) => m.ReportMovArtByArticleComponent),
  },
  {
    path: 'mov-art-by-make/:module',
    loadComponent: () =>
      import('./mov-art-by-make/mov-art-by-make.component').then((m) => m.ReportMovArtByMakeComponent),
  },
  {
    path: 'mov-art-by-category/:module',
    loadComponent: () =>
      import('./mov-art-by-category/mov-art-by-category.component').then((m) => m.ReportMovArtByCategoryComponent),
  },
  {
    path: 'mov-cash-by-type/:module',
    loadComponent: () =>
      import('./mov-cash-by-type/mov-cash-by-type.component').then((m) => m.ReportMovCashByTypeComponent),
  },
  {
    path: 'transaction-by-company/:module',
    loadComponent: () =>
      import('./transactions-by-company/transactions-by-company.component').then(
        (m) => m.ReportTransactionsByCompanyComponent
      ),
  },
  {
    path: 'transactions-by-employee/:module',
    loadComponent: () =>
      import('./transactions-by-employee/transactions-by-employee.component').then(
        (m) => m.ReportTransactionsByEmployeeComponent
      ),
  },
  {
    path: 'transactions-by-type/:module',
    loadComponent: () =>
      import('./transactions-by-type/transactions-by-type.component').then((m) => m.ReportTransactionsByTypeComponent),
  },
  {
    path: 'article-ledger',
    loadComponent: () =>
      import('./article-ledger/article-ledger.component').then((m) => m.ReportArticleLedgerComponent),
  },
  {
    path: 'check-wallet',
    loadComponent: () => import('./check-wallet/check-wallet.component').then((m) => m.ReportCheckWalletComponent),
  },
  {
    path: 'check-ledger',
    loadComponent: () => import('./check-ledger/check-ledger.component').then((m) => m.ReportCheckLedgerComponent),
  },
  {
    path: 'birthday',
    loadComponent: () => import('./birthday/birthday.component').then((m) => m.ReportBirthdayComponent),
  },
  {
    path: 'current-account/:id',
    loadComponent: () => import('./current-account/current-account.component').then((m) => m.CurrentAccountComponent),
  },
];
