import { Routes } from '@angular/router';

export const RESOURCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-resource.component').then((m) => m.ListResourcesComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/resource.component').then((m) => m.ResourceComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/resource.component').then((m) => m.ResourceComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/resource.component').then((m) => m.ResourceComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/resource.component').then((m) => m.ResourceComponent),
  },
];
