import { Routes } from '@angular/router';

export const STATE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-state.component').then((m) => m.ListStateComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/state.component').then((m) => m.StateComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/state.component').then((m) => m.StateComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/state.component').then((m) => m.StateComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/state.component').then((m) => m.StateComponent),
  },
];
