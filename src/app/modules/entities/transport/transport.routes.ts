import { Routes } from '@angular/router';

export const TRANSPORT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-transports.component').then((m) => m.ListTransportsComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/transport.component').then((m) => m.TransportComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/transport.component').then((m) => m.TransportComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/transport.component').then((m) => m.TransportComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/transport.component').then((m) => m.TransportComponent),
  },
];
