import { Routes } from '@angular/router';

export const ACCOUNT_PERIOD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-account-periods.component').then((m) => m.ListAccountPeriodsComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/account-period.component').then((m) => m.AccountPeriodComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/account-period.component').then((m) => m.AccountPeriodComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/account-period.component').then((m) => m.AccountPeriodComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/account-period.component').then((m) => m.AccountPeriodComponent),
  },
];
