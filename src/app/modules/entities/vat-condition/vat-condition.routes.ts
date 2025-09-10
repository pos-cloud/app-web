import { Routes } from '@angular/router';

export const VAT_CONDITION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-vat-condition.component').then((m) => m.ListVatConditionComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/vat-condition.component').then((m) => m.VatConditionComponent),
  },
  {
    path: 'view/:id',
loadComponent: () => import('./crud/vat-condition.component').then((m) => m.VatConditionComponent),
  },
  {
    path: 'update/:id',
loadComponent: () => import('./crud/vat-condition.component').then((m) => m.VatConditionComponent),
  },
  {
    path: 'delete/:id',
loadComponent: () => import('./crud/vat-condition.component').then((m) => m.VatConditionComponent),
  },
];
