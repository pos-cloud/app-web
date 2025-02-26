import { Routes } from '@angular/router';

export const BANK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-bank.component').then((m) => m.ListBankComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/bank.component').then((m) => m.BankComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/bank.component').then((m) => m.BankComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/bank.component').then((m) => m.BankComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/bank.component').then((m) => m.BankComponent),
  },
];
