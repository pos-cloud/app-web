import { Routes } from '@angular/router';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-account.account').then((m) => m.ListAccountComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/account.component').then((m) => m.AccountComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/account.component').then((m) => m.AccountComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/account.component').then((m) => m.AccountComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/account.component').then((m) => m.AccountComponent),
  },
];
