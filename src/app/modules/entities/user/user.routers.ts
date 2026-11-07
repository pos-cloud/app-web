import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'system',
  },
  {
    path: 'add/:profile',
    loadComponent: () => import('./crud/user.component').then((m) => m.UserComponent),
  },
  {
    path: 'view/:profile/:id',
    loadComponent: () => import('./crud/user.component').then((m) => m.UserComponent),
  },
  {
    path: 'update/:profile/:id',
    loadComponent: () => import('./crud/user.component').then((m) => m.UserComponent),
  },
  {
    path: 'delete/:profile/:id',
    loadComponent: () => import('./crud/user.component').then((m) => m.UserComponent),
  },
  {
    path: ':profile',
    loadComponent: () => import('./list/list-user.component').then((m) => m.ListUserComponent),
  },
];
