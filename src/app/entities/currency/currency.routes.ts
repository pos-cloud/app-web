import { Routes } from '@angular/router';

export const CURRENCY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-currency.component').then((m) => m.ListCurrencyComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/currency.component').then((m) => m.CurrencyComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/currency.component').then((m) => m.CurrencyComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/currency.component').then((m) => m.CurrencyComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/currency.component').then((m) => m.CurrencyComponent),
  },
];
