import { Routes } from '@angular/router';

export const ORIGIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-origins.component').then((m) => m.ListOriginsComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/origin.component').then((m) => m.OriginComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/origin.component').then((m) => m.OriginComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/origin.component').then((m) => m.OriginComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/origin.component').then((m) => m.OriginComponent),
  },
];
