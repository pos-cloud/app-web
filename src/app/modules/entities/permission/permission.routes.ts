import { Routes } from '@angular/router';

export const PERMISSION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-permission.component').then((m) => m.ListPermissionComponent),
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
