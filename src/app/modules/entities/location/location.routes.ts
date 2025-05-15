import { Routes } from '@angular/router';

export const LOCATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-location.component').then((m) => m.ListLocationComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/location.component').then((m) => m.LocationComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/location.component').then((m) => m.LocationComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/location.component').then((m) => m.LocationComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/location.component').then((m) => m.LocationComponent),
  },
];
