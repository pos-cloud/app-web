import { Routes } from '@angular/router';

export const CASH_BOX_TYPES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-cash-box-types.component').then((m) => m.ListCashBoxTypesComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/cash-box-types.component').then((m) => m.CashBoxTypeComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/cash-box-types.component').then((m) => m.CashBoxTypeComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/cash-box-types.component').then((m) => m.CashBoxTypeComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/cash-box-types.component').then((m) => m.CashBoxTypeComponent),
  },
];
