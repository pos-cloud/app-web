import { Routes } from '@angular/router';

export const TRANSACTION_ROUTES: Routes = [
  {
    path: ':type',
    loadComponent: () => import('./list/list-transaction.component').then((m) => m.ListTransactionComponent),
  },
];
