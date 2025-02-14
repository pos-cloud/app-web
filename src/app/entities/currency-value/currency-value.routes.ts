import { Routes } from '@angular/router';

export const CURRENCY_VALUE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-currency-value.component').then((m) => m.ListCurrencyValueComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/currency-value.component').then((m) => m.CurrencyValueComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/currency-value.component').then((m) => m.CurrencyValueComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/currency-value.component').then((m) => m.CurrencyValueComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/currency-value.component').then((m) => m.CurrencyValueComponent),
  },
];
