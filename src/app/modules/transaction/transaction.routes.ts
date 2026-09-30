import { Routes } from '@angular/router';

export const TRANSACTION_ROUTES: Routes = [
  {
    path: 'view/formal/:id',
    loadComponent: () =>
      import('./views/formal/formal-transaction-view.component').then((m) => m.FormalTransactionViewComponent),
  },
  {
    path: 'view/stock/:id',
    loadComponent: () =>
      import('./views/stock/stock-transaction-view.component').then((m) => m.StockTransactionViewComponent),
  },
  {
    path: 'charge/:id',
    loadComponent: () => import('./views/charge/charge.component').then((m) => m.ChargeComponent),
  },
];
