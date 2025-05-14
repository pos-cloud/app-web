import { Routes } from '@angular/router';

export const IDENTIFICATION_TYPE_ROUTE: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/list-identification-type.component').then((m) => m.ListIdentificationTypesComponent),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./crud/identification-type.component').then((m) => m.IdentificationTypeComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/identification-type.component').then((m) => m.IdentificationTypeComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/identification-type.component').then((m) => m.IdentificationTypeComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/identification-type.component').then((m) => m.IdentificationTypeComponent),
  },
];
