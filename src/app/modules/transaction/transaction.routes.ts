import { Routes } from '@angular/router';

export const TRANSACTION_ROUTES: Routes = [
  {
    path: 'view/formal/:id',
    loadComponent: () =>
      import('./views/formal/formal-transaction-view.component').then((m) => m.FormalTransactionViewComponent),
  },
];
