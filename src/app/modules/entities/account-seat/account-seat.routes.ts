import { Routes } from '@angular/router';

export const ACCOUNT_SER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-account-seat.component').then((m) => m.ListAccountSeatComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/account-seat.component').then((m) => m.AccountSeatComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/account-seat.component').then((m) => m.AccountSeatComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/account-seat.component').then((m) => m.AccountSeatComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/account-seat.component').then((m) => m.AccountSeatComponent),
  },
];
