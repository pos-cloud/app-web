import { Routes } from '@angular/router';

export const TAX_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-tax.component').then((m) => m.ListTaxComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/tax.component').then((m) => m.TaxComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/tax.component').then((m) => m.TaxComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/tax.component').then((m) => m.TaxComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/tax.component').then((m) => m.TaxComponent),
  },
];
