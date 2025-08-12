import { Routes } from '@angular/router';

export const PRICE_LIST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-price-list.component').then((m) => m.ListPriceListComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/permission.component').then((m) => m.PermissionComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/permission.component').then((m) => m.PermissionComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/permission.component').then((m) => m.PermissionComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/permission.component').then((m) => m.PermissionComponent),
  },
];
