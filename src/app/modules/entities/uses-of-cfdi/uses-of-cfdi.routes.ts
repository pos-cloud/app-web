import { Routes } from '@angular/router';

export const USES_OF_CFDI: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-uses-of-cfdi.component').then((m) => m.ListUsesOfCFDIComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/uses-of-cfdi.component').then((m) => m.UsesOfCFDIComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/uses-of-cfdi.component').then((m) => m.UsesOfCFDIComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/uses-of-cfdi.component').then((m) => m.UsesOfCFDIComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/uses-of-cfdi.component').then((m) => m.UsesOfCFDIComponent),
  },
];
