import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-user.component').then((m) => m.ListUserComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/user.component').then((m) => m.UserComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/user.component').then((m) => m.UserComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/user.component').then((m) => m.UserComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/user.component').then((m) => m.UserComponent),
  },
];
