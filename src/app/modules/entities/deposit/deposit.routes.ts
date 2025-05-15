import { Routes } from '@angular/router';

export const DEPOSIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-deposit.component').then((m) => m.ListDepositComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/deposit.component').then((m) => m.DepositComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/deposit.component').then((m) => m.DepositComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/deposit.component').then((m) => m.DepositComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/deposit.component').then((m) => m.DepositComponent),
  },
];
