import { Routes } from '@angular/router';

export const MAKE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-makes.component').then((m) => m.ListMakesComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/make.component').then((m) => m.MakeComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/make.component').then((m) => m.MakeComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/make.component').then((m) => m.MakeComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/make.component').then((m) => m.MakeComponent),
  },
];
