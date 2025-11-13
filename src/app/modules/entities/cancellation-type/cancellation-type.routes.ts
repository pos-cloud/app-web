import { Routes } from '@angular/router';

export const CANCELLATION_TYPE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-cancellation-type.component').then((m) => m.ListCancellationTypeComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/cancellation-type.component').then((m) => m.CancellationTypeComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/cancellation-type.component').then((m) => m.CancellationTypeComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/cancellation-type.component').then((m) => m.CancellationTypeComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/cancellation-type.component').then((m) => m.CancellationTypeComponent),
  },
];
