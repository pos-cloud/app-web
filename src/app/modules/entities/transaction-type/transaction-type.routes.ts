import { Routes } from '@angular/router';

export const TRANSANCTION_TYPE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-transaction-type.component').then((m) => m.ListTransactionTypeComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/transaction-type.component').then((m) => m.TransactionTypeComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/transaction-type.component').then((m) => m.TransactionTypeComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/transaction-type.component').then((m) => m.TransactionTypeComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/transaction-type.component').then((m) => m.TransactionTypeComponent),
  },
];
